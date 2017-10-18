import { Component, ViewChild } from '@angular/core';
import { MapService } from './services/map.service';
import { WFSService } from './services/wfs.service';
import { Location } from './core/location.class';
import { GeocodingService } from './services/geocoding.service';
import { NavigatorComponent } from './navigator/navigator.component';
import { MarkerComponent } from './marker/marker.component';
import { LayerPermissionService } from '../../_services/_layerPermission.service';
import { LayerAdminService } from '../../_services/_layerAdmin.service';
import { UserPageService } from '../../_services/_userPage.service';
import { SidenavService } from '../../_services/sidenav.service';
import { ServerService } from '../../_services/_server.service';
import { LayerPermission, LayerAdmin, UserPageLayer } from '../../_models/layer.model';
import { Server } from '../../_models/server.model';
import { UserPage } from '../../_models/user.model';
import { UserPageLayerService } from '../../_services/_userPageLayer.service';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as L from 'leaflet';

@Component({
    moduleId: module.id,
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
    public popuptx: string = ''
          
    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    //Constructor, elementref is for use in ngAfterViewInit to test the geoJSON file. the rest are necessary for map component to work.
    constructor(private _http: Http, private mapService: MapService, private wfsService: WFSService, private geocoder: GeocodingService, private layerPermissionService: LayerPermissionService, private layerAdminService: LayerAdminService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private http: Http, private sidenavService: SidenavService, private serverService: ServerService ) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        wfsService.popupText$.subscribe(tx => {
            return this.popuptx = tx;
        });
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
    public currPage: any = 'None'
    public currLayerName: string = 'No Active Layer'
    public noLayers: boolean;

    public count = 0;

    
    //ORDER OF EVENTS ON COMPONENT INITIALIZATION:
    //
    //ngOnInit()
    //setPage()
    //getDefaultPage()
    //getUserPageLayers()
    //init_map()
    //loadLayers()
    //toggleLayers()
    //openFeatureInfo()
    //getfeatureinfo()
    //setFlags()

    //Order of events (changePages)
    //setUserPageLayers(userpage)
    //getUserPageLayers()
    //changePages()
    //setFlags()


    //Angular component initialization
    ngOnInit() {
        this.getPage();
    }
    
    //Takes results from getDefaultPage and sets the page based on result
    getPage(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data:UserPage[]) => {
                return this.userpages = data;
            },
            error => {
                return console.log(error);
            },
            () => {
                return this.getDefaultPage();
            }
            );
    }

    //Currently this logic seems flawed. Whatever the last page that is set as default will be selected, consider a break statement within the if block
    getDefaultPage() {
        for (let userpage of this.userpages) {
            //console.log('Userpage = ' + userpage.page);
            //console.log('Default = ' + userpage.default);
            if (userpage.default === true) {
                this.defaultpage = userpage;
            }
        }
        //console.log('Default Page = ' + this.defaultpage.page);
        this.getUserPageLayers(this.defaultpage);
    }

    //Gets data from the userpagelayers table based on the user that is accessing, and calls init_map() to intitialize the map
    getUserPageLayers(page): void {
        this.userPageLayerService
            .GetPageLayers(page.ID)
            .subscribe((data:UserPageLayer[]) => {
                console.log('userpagelayers is set')
                return this.userpagelayers = data;
            },
            error => {
                return console.log(error);
            },
            () => {
                return this.getServers();
            }
            );
    }

    getServers() {
        this.serverService
            .GetAll()
            .subscribe((data) => {
                return this.servers = data;
            },
            error => {
                return console.log(error);
            },
            () => {
                return this.init_map();
            }
            );
    }

    getServer(serverID) {
        this.serverService
            .GetSingle(serverID)
            .subscribe((data) => {
                return this.server = data;
            });
    }

    updateUserPageLayer(userpage) {
        this.userPageLayerService
            .Update(userpage)
            .subscribe(result => {
                console.log(result);
                this.getUserPageLayers(userpage);
            });
    }

    getUserPageItems(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data:UserPage[]) => {
                return this.userpages = data;
            },
            error => {
                return console.log(error);
            }
            );
        console.log(this.userpages);
    }

    init_map() {
        
        console.log(this.userpagelayers);
        if (this.currPage === 'None') {
            console.log('Initializing Map');
            this.currPage = this.defaultpage.page;
            this._map = L.map('mapid', {
                zoomControl: false,
                center: L.latLng(40.4864, -86.1336),
                zoom: 12,
                minZoom: 4,
                maxZoom: 20,
                layers: [this.mapService.baseMaps.OpenStreetMap]
            });
            L.control.zoom({ position: 'bottomright' }).addTo(this._map);
            L.control.scale().addTo(this._map);

            //This is the control that allows changing of base map from openstreetmaps to esri, cartodb, or mapbox
            //L.control.layers(this.mapService.baseMaps, this.mapService.overlays, {position: "bottomright"}).addTo(this._map);

            this.mapService.map = this._map;

            try {
                this.markerComponent.Initialize();
            } catch (err) {
                console.log(err);
            }
        }

        //this.markerComponent.Initialize();
        this.loadLayers();
        this.setFlags();
        L.DomUtil.addClass(this._map.getContainer(), 'default-enabled');

        //this.setUserPageLayers(this.userpagelayers)
    }

    //This method sets flags for use with the "Layers in Map Component" map.component.html control in order to determine
    //Which layers are currently active, so they can be turned on or off at will with the corresponding dropdown selection.
    setFlags() {
        for (let x of this.userpagelayers) {
            x.layerShown = x.layerON;
        }
    }
        
    //Gets userpagelayers by page.ID, changes pages
    setUserPageLayers(page): void {
        this.currPage = page.page;
        this.cleanPage();
        this.getUserPageLayers(page);
        this.currLayerName = 'No Active Layer';
        this.noLayers = true;
    }
        
    cleanPage(): void {
        console.log('Flags array: ' + this.userpagelayers[0].layerShown);
        this.clearMessage();
        this.setFlags();
        this.mapService.map.eachLayer(function (removelayer) {
            removelayer.remove();
        });
        console.log(this.mapService.baseMaps);
        this.mapService.map.addLayer(L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 4,
            maxZoom: 21,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
        }));
    }

    //loadLayers will load during map init and load the layers that should come on by themselves with the "layerON" property set (in userpagelayers)
    loadLayers() {
        console.log('Loading Layers')
        let temp = this.userpagelayers;
        for (let i=0; i<temp.length; i++) {
            console.log(temp[i]);
            if (temp[i].layerON == true) {
                temp[i].layerShown = true
                //this.toggleLayers(i,temp[i], false)
                this.setCurrentLayer(i, temp[i], false);
            }
        this.userpagelayers = temp
        }
    }

    setCurrentLayer(index, layer: UserPageLayer, checked) {
        console.log('Setting Current Layer')
        for (let x of this.userpagelayers) {
            if (x == layer) {
                console.log("this is x = " + x.layer_admin.layerName)
                console.log("layershown =  " + x.layerShown);
                if (x.layerShown === true) {
                    console.log('Layer is shown');
                    this.currLayerName = x.layer_admin.layerName;
                    this.getServer(layer.layer_admin.serverID);
                    for (let i of this.servers) {
                        if (i.ID == layer.layer_admin.serverID) {
                            this.server = i;
                        }
                    }
                    this.noLayers = false;
                    this._map.off('click');
                    console.log("creating click event")
                    this._map.on('click', (event: L.LeafletMouseEvent) => {
                        let BBOX = this._map.getBounds().toBBoxString();
                        let WIDTH = this._map.getSize().x;
                        let HEIGHT = this._map.getSize().y;
                        let IDENT = x.layer_admin.layerIdent;
                        let X = this._map.layerPointToContainerPoint(event.layerPoint).x;
                        let Y = Math.trunc(this._map.layerPointToContainerPoint(event.layerPoint).y);

                        //let URL = "http://maps.indiana.edu/arcgis/services/Infrastructure/Railroads_Rail_Crossings_INDOT/MapServer/WMSServer?version=1.1.1&request=GetFeatureInfo&layers=0&styles=default&SRS=EPSG:4326&BBOX=-86.35185241699219,40.35387022893512,-85.91274261474611,40.62620049126207&width=1044&height=906&format=text/html&X=500&Y=400&query_layers=0"
                        let URL = this.formLayerRequest(layer) + '?service=WMS&version=1.1.1&request=GetFeatureInfo&layers='+IDENT+'&query_layers='+IDENT+'&BBOX='+BBOX+'&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG:4326&X='+X+'&Y='+Y;
                        console.log(URL);
                        this.wfsService.getfeatureinfo(URL, false)
                            .subscribe((data: any) => {
                                this.sendMessage(data);
                            });
                    });
                }
            }
        }

        if (!checked) {
            console.log('Turning off layer' + layer.layer_admin.layerName);
            this.toggleLayers(index, layer, checked);
        }
        
        console.log(this.currLayer.layer_admin.layerName);
    }

    formLayerRequest (layer: UserPageLayer) {
        let server: Server;
        this.getServer(layer.layer_admin.serverID);
        for (let i of this.servers) {
            if (i.ID == layer.layer_admin.serverID) {
                server = i;
            }
        }
        switch (layer.layer_admin.layerType){
        case ('MapServer'): {
            console.log('Mapserver Layer');
            let norest: string = server.serverURL.split('/rest/')[0] + '/' + server.serverURL.split('/rest/')[1];
            let url: string = norest + '/' + layer.layer_admin.layerService + '/MapServer/WMSServer';
            console.log(url);
            return url;
        }
        case ('Geoserver'): {
            console.log('Geoserver Layer');
                let url: string = server.serverURL + '/wms'
            return url;
        }
        }
    }

    //Reads index of layer in dropdown, layerAdmin, and if it is shown or not. Needs to remove a layer if a new one is selected
    toggleLayers(index, layer: UserPageLayer, checked) {
        let zindex = 1000;
        let allLayersOff = true;
        let nextActive: any;
        this.formLayerRequest(layer);

        //7/24/17
        /*layer userpagelayer returns attributes, one of which is of type LayerAdmin:
        .layer_admin LayerAdmin returns attributes, one of which is of type Server:
        .server.serverURL Server has attribute serverUrl. This is theoretically possible to do all within http request.
        (preferred way of doing this)*/
        //Replace block below with this ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        
        console.log(checked);
        //console.log(layer.layer_admin.layerIdent);
        //console.log(layer.layer_admin.layerFormat);

        //form URL
        let url: string = this.formLayerRequest(layer);
        if (checked == false) {
            console.log("Turning on")
            if (layer.layer_admin.layerGeom == 'Coverage') {
                console.log ("This is a coverage layer")
                zindex = -50;
            }
            this.turnonlayer = (L.tileLayer.wms(url, { //error somewhere in here
                layers: layer.layer_admin.layerIdent,
                format: 'image/png',
                transparent: true
            }).addTo(this._map));
            
            //this.turnonlayer = (L.tileLayer.wms(server.serverURL, {
            //layers: layer.layer_admin.layerIdent,
            //format: layer.layer_admin.layerFormat,
            //transparent: true,
            //}).addTo(this._map))
            console.log(this.turnonlayer);
            this.layerList[index] = this.turnonlayer;
            this.currLayer = layer;
            this.currLayerName = layer.layer_admin.layerName;
            this.noLayers = false;

            //this.openFeatureInfo(server);
            this.userpagelayers[index].layerShown = true;
            this.setCurrentLayer(index, this.currLayer, true);
        } else {
            this.layerList[index].removeFrom(this._map);
            this.userpagelayers[index].layerShown = false;
            for (let i of this.userpagelayers) {
                allLayersOff = true
                if (i.layerON) {
                    nextActive = i;
                    allLayersOff = false;
                    break;
                }
            }
            
            if (this.currLayer == layer && allLayersOff == true) {
                this._map.off('click');
                this.currLayer = null;
                this.currLayerName = 'No Active Layer';
                this.noLayers = true;
            } else if (this.currLayer == layer && !allLayersOff) {
                //9/25/17: Needs to make the next layer the current layer.  Right now it just goes to the first one.
                this.currLayer = nextActive;
                this.currLayerName = nextActive.layer_admin.layerName;
                this.setCurrentLayer(index, this.currLayer, true); //sets the current layer if the current layer is turned off.
                this.noLayers = false;
            }
        }
    }

    //I don't think this is being used
    // openFeatureInfo(serv: Server) {
    //     this._map.on('click', (event: L.LeafletMouseEvent) => {
    //         let BBOX = this._map.getBounds().toBBoxString();
    //         let WIDTH = this._map.getSize().x;
    //         let HEIGHT = this._map.getSize().y;
    //         let IDENT = this.currLayer.layer_admin.layerIdent;
    //         let X = this._map.layerPointToContainerPoint(event.layerPoint).x;
    //         let Y = Math.trunc(this._map.layerPointToContainerPoint(event.layerPoint).y);
    //         let URL = serv.serverURL + '/wms?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetFeatureInfo&LAYERS='+IDENT+'&QUERY_LAYERS='+IDENT+'&BBOX='+BBOX+'&FEATURE_COUNT=1&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326&X='+X+'&Y='+Y;
    //         this.wfsService.getfeatureinfo(URL, false)
    //             .subscribe((data: any) => {
    //                 return this.getFeatureData = data;
    //             });
    //     });
    // }
    sendMessage(message: string): void {
        message = message.split("<body>")[1]
        this.sidenavService.sendMessage(message);
    }

    clearMessage(): void {
        // clear message
        this.sidenavService.clearMessage();
    }
}
