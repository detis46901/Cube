// <reference path='../../../typings/leaflet.d.ts'/>
// <reference path='../../../typings/leaflet-omnivore.d.ts'/>

//Import statements
import { ElementRef, Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { MapService } from "./services/map.service";
import { WFSService } from "./services/wfs.service";
import { Location } from "./core/location.class";
import { GeocodingService } from "./services/geocoding.service";
import { NavigatorComponent } from "./navigator/navigator.component";
import { MarkerComponent } from "./marker/marker.component";
import { LayerPermissionService } from "../../_services/_layerPermission.service"
import { LayerAdminService } from "../../_services/_layerAdmin.service"
import { UserPageService } from '../../_services/_userPage.service'
import { SidenavService } from '../../_services/sidenav.service'
import { ServerService } from '../../_services/_server.service'
import { LayerPermission, LayerAdmin, UserPageLayer } from "../../_models/layer.model";
import { Server } from "../../_models/server.model";
import { UserPage } from '../../_models/user.model';
import { UserPageLayerService } from '../../_services/_userPageLayer.service'
import { Http, Response, Headers } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { Subscription }   from 'rxjs/Subscription';
import * as L from "leaflet";

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [ServerService]
})

export class MapComponent {
    //Token and current user, Working on changing the token format to JWT once hashing is operational
    public token: string;
    public userID: number;
    public headers: Headers;
    public popuptx: string = ""
          
    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    //Constructor, elementref is for use in ngAfterViewInit to test the geoJSON file. the rest are necessary for map component to work.
    constructor(private _http: Http, private elementRef: ElementRef, private mapService: MapService, private wfsservice: WFSService, private geocoder: GeocodingService, private layerPermissionService: LayerPermissionService, private layerAdminService: LayerAdminService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private http: Http, private sidenavService: SidenavService, private serverService: ServerService ) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        wfsservice.popupText$.subscribe(tx => this.popuptx = tx)
        //sidenavService.activeLayer$.subscribe(l => this.currIdent = l) 7/13/17 current Active Layer for sidenav information output
    }

    //Class variables
    public _map: L.Map;

    //GeoJSON testing variables

    public getFeatureData: any;

    //Database information

    public layeradmins: Array<LayerAdmin>;
    public userpagelayers: Array<UserPageLayer> = [];
    public currLayer: UserPageLayer; 
    public userpages: any; 
    public layerList: Array<L.Layer> = [];
    public server: Server;
    public servers: Array<Server>;

    public defaultpage: any; 
    public turnonlayer: L.Layer;
    public overlays: any;
    public currPage: any = "None"
    public currLayerName: string = "No Active Layer"
    public noLayers: boolean;

    public count = 0;

    
    // ORDER OF EVENTS ON COMPONENT INITIALIZATION:
    //
    // ngOnInit()
    // setPage()
    // getDefaultPage()
    // getUserPageLayers()
    // init_map()
    // loadLayers()
    //     toggleLayers()
    //         openFeatureInfo()
    //             getfeatureinfo()
    // setFlags()

    // Order of events (changePages)
    // setUserPageLayers(userpage)
    // getUserPageLayers()
    // changePages()
    // setFlags()


    //Angular component initialization
    ngOnInit() {
        this.getPage();       
    }
    
    //Takes results from getDefaultPage and sets the page based on result
    getPage(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data:UserPage[]) => this.userpages = data,
                error => console.log(error),
                () => this.getDefaultPage()
            );
    }

    //Currently this logic seems flawed. Whatever the last page that is set as default will be selected, consider a break statement within the if block
    getDefaultPage() {
        for (let userpage of this.userpages) {
            console.log ("Userpage = " + userpage.page)
            console.log ("Default = " + userpage.default)
            if (userpage.default === true) {
                this.defaultpage = userpage
            }
        }
        console.log("Default Page = " + this.defaultpage.page)
        this.getUserPageLayers(this.defaultpage)
    } 

    //Gets data from the userpagelayers table based on the user that is accessing, and calls init_map() to intitialize the map
    getUserPageLayers(page): void {
        this.userPageLayerService
            .GetPageLayers(page.ID)
            .subscribe((data:UserPageLayer[]) => this.userpagelayers = data,
                error => console.log(error),
                () =>  this.getServers()
            );
    }

    getServer(serverID) {
        this.serverService
            .GetSingle(serverID)
            .subscribe((data) => this.server = data);
    }

    getServers() {
        this.serverService
            .GetAll()
            .subscribe((data) => this.servers = data,
                error => console.log(error),
                () => this.init_map()
            );
    }

    updateUserPageLayer(userpage) {
        this.userPageLayerService
            .Update(userpage)
            .subscribe(result => {
                console.log(result);
                this.getUserPageLayers(userpage);
            })
    }

    getUserPageItems(): void {
        this.userPageService
        .GetSome(this.userID)
        .subscribe((data:UserPage[]) => this.userpages = data,
            error => console.log(error)
            );
        console.log(this.userpages)
    }

    init_map() {
        
        console.log (this.userpagelayers)
        if (this.currPage === "None") {
            console.log ("Initializing Map")
            this.currPage = this.defaultpage.page
            this._map = L.map("mapid", {
                zoomControl: false,
                center: L.latLng(40.4864, -86.1336),
                zoom: 12,
                minZoom: 4,
                maxZoom: 20,
                layers: [this.mapService.baseMaps.OpenStreetMap]
            });               
            L.control.zoom({ position: "bottomright" }).addTo(this._map);
            L.control.scale().addTo(this._map);

            //This is the control that allows changing of base map from openstreetmaps to esri, cartodb, or mapbox
            //L.control.layers(this.mapService.baseMaps, this.mapService.overlays, {position: "bottomright"}).addTo(this._map);

            this.mapService.map = this._map;

            try {
                this.markerComponent.Initialize();
            }

            catch(err) {
                console.log(err)
            }
        }
        //this.markerComponent.Initialize();
        this.loadLayers();
        this.setFlags();
        L.DomUtil.addClass(this._map.getContainer(),'default-enabled');
        //this.setUserPageLayers(this.userpagelayers)
    }   

    //This method sets flags for use with the "Layers in Map Component" map.component.html control in order to determine
    //Which layers are currently active, so they can be turned on or off at will with the corresponding dropdown selection.
    setFlags() {
        for (let x of this.userpagelayers) {
            x.layerShown = x.layerON
        }
    }
        
    //Gets userpagelayers by page.ID, changes pages
    setUserPageLayers(page): void {
        this.currPage = page.page
        this.cleanPage()
        this.getUserPageLayers(page)
        this.currLayerName = "No Active Layer"
        this.noLayers = true;
    }
        
    cleanPage(): void {
        console.log('Flags array: ' + this.userpagelayers[0].layerShown)
        this.setFlags();
        this.mapService.map.eachLayer(function (removelayer) {removelayer.remove()})
        console.log(this.mapService.baseMaps)
        this.mapService.map.addLayer(L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            minZoom: 4,
            maxZoom: 21,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
        }))
    }

    //loadLayers will load during map init and load the layers that should come on by themselves with the "layerON" property set (in userpagelayers)
    loadLayers() {
        let temp = this.userpagelayers
        for (let i=0; i<temp.length; i++) {
            console.log(temp[i])
            if (temp[i].layerON) {
                this.toggleLayers(i,temp[i], false)
            }
        }
    }

    setCurrentLayer(index, layer: UserPageLayer, checked) {
        for (let x of this.userpagelayers) {
            if (x == layer) {
                console.log(x)
                if (x.layerShown === true) {
                    console.log("Layer is shown")
                    this.currLayerName = x.layer_admin.layerName
                    this.getServer(layer.layer_admin.serverID)
                    for (let i of this.servers) {
                        if (i.ID == layer.layer_admin.serverID) {this.server = i}
                    }
                    this.noLayers = false;
                    this._map.off('click')
                    this._map.on('click', (event: L.LeafletMouseEvent) => { 
                        let BBOX = this._map.getBounds().toBBoxString();
                        let WIDTH = this._map.getSize().x;
                        let HEIGHT = this._map.getSize().y;
                        let IDENT = x.layer_admin.layerIdent
                        let X = this._map.layerPointToContainerPoint(event.layerPoint).x;
                        let Y = Math.trunc(this._map.layerPointToContainerPoint(event.layerPoint).y);
                        let URL = this.server.serverURL + '/wms?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetFeatureInfo&LAYERS='+IDENT+'&QUERY_LAYERS='+IDENT+'&BBOX='+BBOX+'&FEATURE_COUNT=1&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326&X='+X+'&Y='+Y;
                        console.log(URL)
                        this.wfsservice.getfeatureinfo(URL, false)
                        .subscribe((data: any) => this.getFeatureData = data)
                    })
                }
            }
        }

        if(!checked) {
            this.toggleLayers(index, layer, checked)
        }
        
        console.log(this.currLayer.layer_admin.layerName)
    }

    formLayerRequest (layer: UserPageLayer) {
        let server: Server;
        this.getServer(layer.layer_admin.serverID)
        for (let i of this.servers) {
            if (i.ID == layer.layer_admin.serverID) {server = i}
        }
        switch (layer.layer_admin.layerType){
            case ("MapServer"): {
                console.log("Mapserver Layer")
                let norest: string = server.serverURL.split("/rest/")[0] + "/" + server.serverURL.split("/rest/")[1]
                let url: string = norest + "/" + layer.layer_admin.layerService + "/MapServer/WMSServer"
                console.log(url)
                return url
            }
            case ("Geoserver"): {
                return ""
            }
            }
        }

    //Reads index of layer in dropdown, layerAdmin, and if it is shown or not. Needs to remove a layer if a new one is selected
    toggleLayers(index, layer: UserPageLayer, checked) {
        let zindex = 1000
        let allLayersOff = true;
        let nextActive: any;
        this.formLayerRequest(layer)

        //7/24/17
        /*layer userpagelayer returns attributes, one of which is of type LayerAdmin:
        .layer_admin LayerAdmin returns attributes, one of which is of type Server:
        .server.serverURL Server has attribute serverUrl. This is theoretically possible to do all within http request.
        (preferred way of doing this)*/
        //Replace block below with this ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        
        console.log(checked)
        console.log(layer.layer_admin.layerIdent)
        console.log(layer.layer_admin.layerFormat)

        //form URL
        let url: string = this.formLayerRequest(layer)
        if (checked == false) {
            if (layer.layer_admin.layerGeom == "Coverage") {zindex = -50}
           
            this.turnonlayer = (L.tileLayer.wms(url, {
                     layers: layer.layer_admin.layerIdent,
                     format: "image/png",
                     transparent: true,
                 }).addTo(this._map))
            // this.turnonlayer = (L.tileLayer.wms(server.serverURL, {
            //     layers: layer.layer_admin.layerIdent,
            //     format: layer.layer_admin.layerFormat,
            //     transparent: true,
            // }).addTo(this._map))
            console.log(this.turnonlayer)
            this.layerList[index] = this.turnonlayer
            this.currLayer = layer
            this.currLayerName = layer.layer_admin.layerName
            this.noLayers = false;
            //this.openFeatureInfo(server);
            this.userpagelayers[index].layerShown = true
        }
        else { 
            this.layerList[index].removeFrom(this._map)
            this.userpagelayers[index].layerShown = false
            for (let i of this.userpagelayers) {
                if (i.layerON) {
                    nextActive = i;
                    allLayersOff = false;
                    break;
                }
            }
            this._map.off('click')

            if (this.currLayer == layer && allLayersOff) {
                this.currLayer = null
                this.currLayerName = "No Active Layer"
                this.noLayers = true;
            }
            else if (this.currLayer == layer && !allLayersOff) {
                this.currLayer = nextActive
                this.currLayerName = nextActive.layer_admin.layerName
                this.noLayers = false;
            }
        }
    }

    openFeatureInfo(serv: Server) {
        this._map.on('click', (event: L.LeafletMouseEvent) => { 
            let BBOX = this._map.getBounds().toBBoxString();
            let WIDTH = this._map.getSize().x;
            let HEIGHT = this._map.getSize().y;
            let IDENT = this.currLayer.layer_admin.layerIdent
            let X = this._map.layerPointToContainerPoint(event.layerPoint).x;
            let Y = Math.trunc(this._map.layerPointToContainerPoint(event.layerPoint).y);
            let URL = serv.serverURL + '/wms?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetFeatureInfo&LAYERS='+IDENT+'&QUERY_LAYERS='+IDENT+'&BBOX='+BBOX+'&FEATURE_COUNT=1&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326&X='+X+'&Y='+Y;
            this.wfsservice.getfeatureinfo(URL, false)
                .subscribe((data: any) => this.getFeatureData = data)
        })
    }
}
