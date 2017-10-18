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
    private token: string;
    private userID: number;
    private headers: Headers;
    private popupText: string = '';

    private _map: L.Map;
    private userPageLayers: Array<UserPageLayer> = [];
    private currLayer: UserPageLayer;
    private userPages: UserPage[];
    private layerList: Array<L.Layer> = [];
    private server: Server;
    private servers: Array<Server>;

    private defaultPage: UserPage;
    private turnOnLayer: L.Layer;
    private currPage: any = 'None';
    private currLayerName: string = 'No Active Layer';
    private noLayers: boolean;

    
    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    constructor(private _http: Http, private mapService: MapService, private wfsService: WFSService, private geoCoder: GeocodingService, private layerPermissionService: LayerPermissionService, private layerAdminService: LayerAdminService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private http: Http, private sidenavService: SidenavService, private serverService: ServerService ) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        wfsService.popupText$.subscribe(text => {
            this.popupText = text;
        });
    }

    //ORDER OF EVENTS ON COMPONENT INITIALIZATION:
    //
    //ngOnInit()
    //setPage()
    //getDefaultPage()
    //getUserPageLayers()
    //getServers()
    //initMap()
    //loadLayers()
    //toggleLayers()
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
    private getPage(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data: UserPage[]) => {
                console.log(data);
                this.userPages = data;
                this.getDefaultPage();
            });
    }

    //Currently this logic seems flawed. Whatever the last page that is set as default will be selected, consider a break statement within the if block
    private getDefaultPage(): void {
        for (let userpage of this.userPages) {
            //console.log('Userpage = ' + userpage.page);
            //console.log('Default = ' + userpage.default);
            if (userpage.default === true) {
                this.defaultPage = userpage;
            }
        }
        //console.log(this.defaultPage);
        this.getUserPageLayers(this.defaultPage);
    }

    //Gets data from the userPageLayers table based on the user that is accessing, and calls init_map() to intitialize the map
    private getUserPageLayers(page: UserPage): void {
        this.userPageLayerService
            .GetPageLayers(page.ID)
            .subscribe((data: UserPageLayer[]) => {
                console.log('userPageLayers is set');
                this.userPageLayers = data;
                this.getServers();
            });
    }

    private getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((data: Server[]) => {
                this.servers = data;
                this.initMap();
            });
    }

    private initMap(): void {      
        if (this.currPage === 'None') {
            console.log('Initializing Map');
            this.currPage = this.defaultPage.page;
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
            this.mapService.map = this._map;

            //This doesn't work yet
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
    }

    //loadLayers will load during map init and load the layers that should come on by themselves with the "layerON" property set (in userPageLayers)
    private loadLayers(): void {
        console.log('Loading Layers')
        let temp = this.userPageLayers;
        for (let i=0; i<temp.length; i++) {
            console.log(temp[i]);
            if (temp[i].layerON == true) {
                temp[i].layerShown = true;
                this.setCurrentLayer(i, temp[i], false);
            }
            this.userPageLayers = temp
        }
    }

    //Reads index of layer in dropdown, layerAdmin, and if it is shown or not. Needs to remove a layer if a new one is selected
    private toggleLayers(index: number, layer: UserPageLayer, checked: boolean): void {
        let zindex: number = 1000;
        let allLayersOff: boolean = true;
        let nextActive: UserPageLayer;
        let url: string = this.formLayerRequest(layer);

        if (checked == false) {
            console.log("Turning on");
            if (layer.layer_admin.layerGeom == 'Coverage') {
                console.log ("This is a coverage layer");
                zindex = -50;
            }

            this.turnOnLayer = (L.tileLayer.wms(url, {
                layers: layer.layer_admin.layerIdent,
                format: 'image/png',
                transparent: true
            }).addTo(this._map));
            
            console.log(this.turnOnLayer);
            this.layerList[index] = this.turnOnLayer;
            this.currLayer = layer;
            this.currLayerName = layer.layer_admin.layerName;
            this.noLayers = false;
            this.userPageLayers[index].layerShown = true;
            this.setCurrentLayer(index, this.currLayer, true);
        } else {
            this.layerList[index].removeFrom(this._map);
            this.userPageLayers[index].layerShown = false;
            for (let i of this.userPageLayers) {
                allLayersOff = true;
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

    //This method sets flags for use with the "Layers in Map Component" map.component.html control in order to determine
    //Which layers are currently active, so they can be turned on or off at will with the corresponding dropdown selection.
    private setFlags(): void {
        for (let x of this.userPageLayers) {
            x.layerShown = x.layerON;
        }
    }

    private getServer(serverID: number): void {
        this.serverService
            .GetSingle(serverID)
            .subscribe((data: Server) => {
                this.server = data;
            });
    }

    private updateUserPageLayer(userPage: UserPage): void {
        this.userPageLayerService
            .Update(userPage)
            .subscribe(() => {
                this.getUserPageLayers(userPage);
            });
    }

    private getUserPageItems(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data: UserPage[]) => {
                this.userPages = data;
            });
    }
        
    //Gets userPageLayers by page.ID, changes pages
    private setUserPageLayers(page: UserPage): void {
        this.currPage = page.page;
        this.cleanPage();
        this.getUserPageLayers(page);
        this.currLayerName = 'No Active Layer';
        this.noLayers = true;
    }
        
    private cleanPage(): void {
        console.log('Flags array: ' + this.userPageLayers[0].layerShown);
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

    

    private setCurrentLayer(index: number, layer: UserPageLayer, checked: boolean): void {
        console.log('Setting Current Layer')
        for (let x of this.userPageLayers) {
            if (x == layer) {
                console.log("this is x = " + x.layer_admin.layerName);
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
                    console.log("creating click event");
                    this._map.on('click', (event: L.LeafletMouseEvent) => {
                        let BBOX = this._map.getBounds().toBBoxString();
                        let WIDTH = this._map.getSize().x;
                        let HEIGHT = this._map.getSize().y;
                        let IDENT = x.layer_admin.layerIdent;
                        let X = this._map.layerPointToContainerPoint(event.layerPoint).x;
                        let Y = Math.trunc(this._map.layerPointToContainerPoint(event.layerPoint).y);

                        //let URL = "http://maps.indiana.edu/arcgis/services/Infrastructure/Railroads_Rail_Crossings_INDOT/MapServer/WMSServer?version=1.1.1&request=GetFeatureInfo&layers=0&styles=default&SRS=EPSG:4326&BBOX=-86.35185241699219,40.35387022893512,-85.91274261474611,40.62620049126207&width=1044&height=906&format=text/html&X=500&Y=400&query_layers=0"
                        let URL: string = this.formLayerRequest(layer) + '?service=WMS&version=1.1.1&request=GetFeatureInfo&layers='+IDENT+'&query_layers='+IDENT+'&BBOX='+BBOX+'&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG:4326&X='+X+'&Y='+Y;
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

    private formLayerRequest (layer: UserPageLayer): string {
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

    private sendMessage(message: string): void {
        message = message.split("<body>")[1]
        this.sidenavService.sendMessage(message);
    }

    private clearMessage(): void {
        this.sidenavService.clearMessage();
    }
}
