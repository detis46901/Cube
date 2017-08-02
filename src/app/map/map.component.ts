// <reference path='../../../typings/leaflet.d.ts'/>
// <reference path='../../../typings/leaflet-omnivore.d.ts'/>

//Import statements
import { ElementRef, Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { MapService } from "./services/map.service";
import { WFSService } from "./services/wfs.service";
import { WFSMarker } from "../../_models/wfs.model";
import { Location } from "./core/location.class";
import { GeocodingService } from "./services/geocoding.service";
import { NavigatorComponent } from "./navigator/navigator.component";
import { MarkerComponent } from "./marker/marker.component";
import { LayerPermissionService } from "../../_services/layerpermission.service"
import { LayerAdminService } from "../../_services/layeradmin.service"
import { UserPageService } from '../../_services/user-page.service'
import { SidenavService } from '../../_services/sidenav.service'
import { ServerService } from '../../_services/server.service'
import { LayerPermission, LayerAdmin, UserPageLayer } from "../../_models/layer.model";
import { Server } from "../../_models/server.model";
import { UserPage } from '../../_models/user-model';
import { UserPageLayerService } from '../../_services/user-page-layer.service'
import { Http, Response, Headers } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { Subscription }   from 'rxjs/Subscription';
import { Map, MouseEvent, Marker } from "leaflet";

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
    public geoFlag = false;
    public geoURL = "http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/ows?service=WFS&version=1.1.0&request=GetFeature&styles=Kokomo:point&typeName=Kokomo:Bench_Marks&srsName=EPSG:4326&maxFeatures=150&outputFormat=application%2Fjson";
    public geoURL2 = 'http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/ows?service=WFS&version=1.1.0&request=GetFeature&styles=Kokomo:point&typeName=Kokomo:Cabinets&srsName=EPSG:4326&maxFeatures=50&outputFormat=application%2Fjson'
    public geoURLWMS = "http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/wms?service=WMS&version=1.1.0&request=GetMap&layers=Kokomo:Bench_Marks&styles=&bbox=184144.95491078153,1888976.6503463583,221117.617793215,1918974.7383329805&width=768&height=623&srs=EPSG:2965&format=image%2Fpng"
    public geoTest: any;
    public geoLayerGroup: any;
    public geoArray: Array<L.Layer>
    public geoProp: Array<any>;
    public curMarker: any;
    public markerArr: Array<L.Marker>;
    public wfsmarker: Array<WFSMarker>;
    public getFeatureData: any;

    //Database information
    public layers: MapService;
    public layerpermissions: any;
    public layeradmin = new LayerAdmin;
    public layeradmins: Array<LayerAdmin>;
    public userpagelayers: Array<UserPageLayer>;
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

    public count = 0;

    
    // Order of events (onload):
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
        this.setPage();       
    }
    
    //Takes results from getDefaultPage and sets the page based on result
    setPage(): void {
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
            if (userpage.default == true) {
                this.defaultpage = userpage
            }
        }
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
            .GetOne(serverID)
            .subscribe((data) => this.setServer(data));
    }

    setServer(serv: Server) {
        this.server = serv
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
        console.log (this.currPage)
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
            //L.control.layers(this.mapService.baseMaps, this.mapService.overlays).addTo(this._map);
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
    }   

    //This method sets flags for use with the "Layers in Map Component" map.component.html control in order to determine
    //Which layers are currently active, so they can be turned on or off at will with the corresponding dropdown selection.
    setFlags() {
        for (let x of this.userpagelayers) {
            x.layerShown = x.layerON
        }
    }
        
    //Gets userpagelayers by page.ID, changes pages
    setUserPageLayers(page): void { //This does not update the layer control properly 7/19/17

        this.currPage = page.page
        this.cleanPage()
        console.log(this.currPage)
        console.log("set pageID = " + page.ID)
        this.getUserPageLayers(page)
        this.currLayerName = "No Active Layer"
        // this.userPageLayerService
        //     .GetPageLayers(page.ID)
        //     .subscribe((data:UserPageLayer[]) => this.userpagelayers = data,
        //         error => console.log(error),
        //         () => {console.log(this.userpagelayers); this.cleanPage()}
        //     );
    }
        
    cleanPage(): void {
        console.log('Flags array: ' + this.userpagelayers[0].layerShown)
        this.setFlags();
        this.mapService.map.eachLayer(function (removelayer) {removelayer.remove()})
        console.log(this.mapService.baseMaps)
        this.mapService.map.addLayer(L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
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
                console.log("Found Layer!")
                if (x.layerShown === true) {
                    console.log("Layer is shown")
                    this.currLayerName = x.layer_admin.layerName
                    this._map.off('click')
                    this._map.on('click', (event: MouseEvent) => { 
                        let BBOX = this._map.getBounds().toBBoxString();
                        let WIDTH = this._map.getSize().x;
                        let HEIGHT = this._map.getSize().y;
                        let IDENT = x.layer_admin.layerIdent
                        let X = this._map.layerPointToContainerPoint(event.layerPoint).x;
                        let Y = Math.trunc(this._map.layerPointToContainerPoint(event.layerPoint).y);
                        let URL = this.server.serverURL + '?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetFeatureInfo&LAYERS='+IDENT+'&QUERY_LAYERS='+IDENT+'&BBOX='+BBOX+'&FEATURE_COUNT=1&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326&X='+X+'&Y='+Y;
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
        console.log(this.server)
    }

    //Reads index of layer in dropdown, layeradmin, and if it is shown or not. Needs to remove a layer if a new one is selected
    toggleLayers(index, layer: UserPageLayer, checked) {
        let zindex = 1000
        let allLayersOff = true;
        let nextActive: any;
        let server;

        //7/24/17
        /*layer userpagelayer returns attributes, one of which is of type LayerAdmin:
        .layer_admin LayerAdmin returns attributes, one of which is of type Server:
        .server.serverURL Server has attribute serverUrl. This is theoretically possible to do all within http request.
        (preferred way of doing this)*/
        //Replace block below with this ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        this.getServer(layer.layer_admin.serverID)
        for (let i of this.servers) {
            if (i.ID == layer.layer_admin.serverID) {server = i}
        }
        console.log(server.serverURL)
        console.log(checked)
        console.log(layer.layer_admin.layerIdent)
        console.log(layer.layer_admin.layerFormat)


        if (checked == false) {
            if (layer.layer_admin.layerGeom == "Coverage") {zindex = 500}
            this.turnonlayer = (L.tileLayer.wms(/*server.serverURL*/'http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/ows/', { //will not be server.serverURL exactly like this, once code above is changed
                minZoom: 4,
                maxZoom: 20,
                zIndex: zindex,
                layers: layer.layer_admin.layerIdent,
                format: layer.layer_admin.layerFormat,
                transparent: true,
            })).addTo(this._map)
            console.log(this.turnonlayer)
            this.layerList[index] = this.turnonlayer
            this.currLayer = layer
            this.currLayerName = layer.layer_admin.layerName
            this.openFeatureInfo();
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
                this.currLayerName = "No Current"
            }
            else if (this.currLayer == layer && !allLayersOff) {
                this.currLayer = nextActive
                this.currLayerName = nextActive.layer_admin.layerName
            }
        }
    }

    //this needs to be set up for every layer
    openFeatureInfo() {
        let ms_url="http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/wms";
        /*this._map.on('drag', (event: MouseEvent) => {
            L.DomUtil.addClass(this._map.getContainer(),'grabbing-enabled')
        })

        this._map.on('mouseup', (event: MouseEvent) => {
            L.DomUtil.removeClass(this._map.getContainer(),'grabbing-enabled')
        })*/

        this._map.on('click', (event: MouseEvent) => { 
            let BBOX = this._map.getBounds().toBBoxString();
            let WIDTH = this._map.getSize().x;
            let HEIGHT = this._map.getSize().y;
            let IDENT = this.currLayer.layer_admin.layerIdent
            let X = this._map.layerPointToContainerPoint(event.layerPoint).x;
            let Y = Math.trunc(this._map.layerPointToContainerPoint(event.layerPoint).y);
            let URL = ms_url + '?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetFeatureInfo&LAYERS='+IDENT+'&QUERY_LAYERS='+IDENT+'&BBOX='+BBOX+'&FEATURE_COUNT=1&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326&X='+X+'&Y='+Y;
            this.wfsservice.getfeatureinfo(URL, false)
                .subscribe((data: any) => this.getFeatureData = data)
        })

        // this._map.on('mousemove', (event: MouseEvent) => {
        //     let BBOX = this._map.getBounds().toBBoxString();
        //     let WIDTH = this._map.getSize().x;
        //     let HEIGHT = this._map.getSize().y;
        //     let IDENT = this.currIdent
        //     let X = this._map.layerPointToContainerPoint(event.layerPoint).x;
        //     let Y = Math.trunc(this._map.layerPointToContainerPoint(event.layerPoint).y);
        //     let URL = ms_url + '?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetFeatureInfo&LAYERS='+IDENT+'&QUERY_LAYERS='+IDENT+'&BBOX='+BBOX+'&FEATURE_COUNT=1&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326&X='+X+'&Y='+Y;
        //     this.wfsservice.getfeatureinfo(URL, true)
        //         .subscribe((data: any) => {
        //             if (data.length > 18) {
        //                 L.DomUtil.addClass(this._map.getContainer(),'pointer-enabled')
        //             }
        //             else {
        //                 L.DomUtil.removeClass(this._map.getContainer(),'pointer-enabled')
        //             }
        //         })
            
        // })   
    }

    /*openWFS(geometry, URL, index) {
        let myIcon = L.icon({iconUrl: 'my-icon.png', iconSize: [5, 5]});
        switch(geometry) {
            case "Point": {
                this.wfsservice.getPointLayers(URL)
                    .subscribe(res => {
                        res.addTo(this.mapService.map)
                        this.userpagelayers[index].featureGroupObject = res
                    })
                break
            }
            case "Polyline": {
                this.wfsservice.getPolylineLayers(URL)
                    .subscribe(res => {
                        res.addTo(this.mapService.map)
                        this.userpagelayers[index].featureGroupObject = res
                    })
                break
            }
            case "Polygon": {
                this.wfsservice.getPolygonLayers(URL)
                break
            }
            case "Coverage": {
                //this.wfsservice.getCoverageLayers(URL)
                break
            }
            default: {
                alert("Invalid Geometry type: " + geometry)
            }
        }
        
        this._map.on('click', (event: MouseEvent) => {
            this.wfsservice.popupText.next("Click a layer for details.");
            console.log("fired")
            })
            //6/30/2017 Do something right here with assigning things to onClick of featureGroup        
    }*/
}
