import { Component, ViewChild } from '@angular/core';
import { MapService } from './services/map.service';
import { WFSService } from './services/wfs.service';
import { Location } from './core/location.class';
import { GeocodingService } from './services/geocoding.service';
import { geoJSONService } from './services/geoJSON.service'
import { NavigatorComponent } from './navigator/navigator.component';
import { PMMarkerComponent } from './marker/PMmarker.component';
import { LayerPermissionService } from '../../_services/_layerPermission.service';
import { LayerAdminService } from '../../_services/_layerAdmin.service';
import { UserPageService } from '../../_services/_userPage.service';
import { SideNavService } from '../../_services/sidenav.service';
import { MyCubeService } from './services/mycube.service'
import { ServerService } from '../../_services/_server.service';
import { LayerPermission, LayerAdmin, UserPageLayer, MyCubeField, MyCubeConfig } from '../../_models/layer.model';
import { Server } from '../../_models/server.model';
import { UserPage } from '../../_models/user.model';
import { UserPageLayerService } from '../../_services/_userPageLayer.service';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { LeafletDirective, LeafletDirectiveWrapper } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawDirective, LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';

@Component({
    moduleId: module.id,
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: [ServerService, geoJSONService]
})

export class MapComponent {
    private token: string;
    private userID: number;
    private headers: Headers;
    private _map: L.Map;
    private userPageLayers: Array<UserPageLayer> = [];
    private currLayer: UserPageLayer;
    private userPages: UserPage[];
    private layerList: Array<L.Layer> = [];
    private server: Server;
    private servers: Array<Server>;
    private perm: LayerPermission;
    private perms: LayerPermission[];

    private defaultPage: UserPage;
    private turnOnLayer: L.Layer;
    private currPage: any = ''; //Could be "none"
    private currLayerName: string = ''; //Could say something besides nothing
    private noLayers: boolean;
    private shown: boolean = false
    private drawOptions = {
        position: 'bottomright',
        draw: {
            marker: {
                icon: L.icon({
                    iconUrl: 'http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png',
                })
            },
            polyline: false,
            circle: {
                shapeOptions: {
                    color: '#aaaaaa'
                }
            }
        }
    };
    
    private options =  {
        zoomControl: false,
        center: L.latLng(40.4864, -86.1336),
        zoom: 12,
        minZoom: 4,
        maxZoom: 20,
        layers: [this.mapService.baseMaps.OpenStreetMap]
    };

    private layers: L.Layer []

    constructor(private _http: Http, private geojsonservice: geoJSONService, private mapService: MapService, private wfsService: WFSService, private geoCoder: GeocodingService, private layerPermissionService: LayerPermissionService, private layerAdminService: LayerAdminService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private http: Http, private sideNavService: SideNavService, private myCubeService: MyCubeService, private serverService: ServerService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }

    
    //Angular component initialization
    ngOnInit() {
        //this.getPage();
    }
 
    private onMapReady(map: L.Map) {
        this._map = map
        console.log("Map Ready")
        this.mapService.map = this._map;
        this.getPage()
        this.setFlags();
        L.DomUtil.addClass(this._map.getContainer(), 'default-enabled');
    }

    private getPage(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data: UserPage[]) => {
                console.log(data);
                this.userPages = data;
                this.getDefaultPage();
            });
    }

    private getDefaultPage(): void {
        for (let userpage of this.userPages) {
            //console.log('Userpage = ' + userpage.page);
            //console.log('Default = ' + userpage.default);
            if (userpage.default === true) {
                this.defaultPage = userpage;
            }
        }
        //console.log(this.defaultPage);
        this.currPage = this.defaultPage.page;
        this.getUserPageLayers(this.defaultPage);
    }

    private getUserPageLayers(page: UserPage): void {
        this.userPageLayerService
            .GetPageLayers(page.ID)
            .subscribe((data: UserPageLayer[]) => {
                this.userPageLayers = data;
                this.getServers();
            });
    }

    private getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((data: Server[]) => {
                this.servers = data;
                this.getLayerPerms();
            });
    }

    private getLayerPerms(): void {
        this.layerPermissionService
            .GetUserLayer(this.userID)
            .subscribe((data: LayerPermission[]) => {
                this.perms = data;
                this.loadLayers();
            })
    }
   
    //loadLayers will load during map init and load the layers that should come on by themselves with the "layerON" property set (in userPageLayers)
    private loadLayers(): void {
        console.log('Loading Layers')
        let temp = this.userPageLayers;
        
        for (let i=0; i<temp.length; i++) {
            console.log(temp[i]);
            if (temp[i].layerON == true) {
                temp[i].layerShown = true;
                this.toggleLayers(i,temp[i],false)
            } else {
                temp[i].layerShown == false
            }
            this.userPageLayers = temp
        }
    }

    //Reads index of layer in dropdown, layerAdmin, and if it is shown or not. Needs to remove a layer if a new one is selected
    private toggleLayers(index: number, layer: UserPageLayer, checked: boolean): void {
        console.log("toggleLayers")
        let zindex: number = 1000;
        let allLayersOff: boolean = true;
        let nextActive: UserPageLayer;
        index = this.userPageLayers.findIndex(x => x==layer)
        console.log(index)
        
        if (checked == false) {  //Where layers get turned on
            console.log("turning on layer " + layer.layer_admin.layerName)
            if (layer.layer_admin.layerType == 'MyCube') {this.loadMyCube(index, layer, checked)} else{
                if (layer.layer_admin.layerGeom == 'Coverage') {zindex = -50}; //This doesn't seem to work.
                console.log (layer.layer_admin.layerType)
                let url: string = this.formLayerRequest(layer);
                this.turnOnLayer = (L.tileLayer.wms(url, {
                    layers: layer.layer_admin.layerIdent,
                    format: layer.layer_admin.layerFormat,
                    transparent: true
                }).addTo(this._map));
                this.layerList[index] = this.turnOnLayer;
                this.currLayer = layer;
                this.currLayerName = layer.layer_admin.layerName;
                this.noLayers = false;
                this.userPageLayers[index].layerShown = true;
                this.setCurrentLayer(index, this.currLayer, true);
            }
        } else { //Where layers get turned OFF
            console.log("turning off layer" + layer.layer_admin.layerName)
            if (layer.layer_admin.layerType == 'MyCube') {this.loadMyCube(index, layer, checked)} else{
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
                    //this.setCurrentLayer(index, this.currLayer, true); //sets the current layer if the current layer is turned off.
                    this.noLayers = false;
                }
            }
        }
    }

    private loadMyCube(index:number, layer: UserPageLayer, checked) {
        let allLayersOff: boolean = true;
        let nextActive: UserPageLayer;

        console.log("loadMyCube: index=" + index + ",checked=" + checked)
        if (!checked) {
            this.geojsonservice.GetAll(layer.layer_admin.ID)
            .subscribe((data: GeoJSON.Feature<any>) => {
                this.layerList[index] = L.geoJSON(data[0][0]['jsonb_build_object'])
                    .addTo(this._map)
                    .on('click', (event: any) => {
                    //this.sendMyCubeData(event.layer.feature.properties)
                    this.myCubeService.setMyCubeConfig(layer.layer_admin.ID, this.perm.edit);
                    this.myCubeService.sendMyCubeData(layer.layer_admin.ID, event.layer.feature.properties.ID, event.layer.feature.properties);
                })
            })
            this.setCurrentMyCube(index, layer, checked)
            //this.sendMessage("<body>MyCube Selected</body>")
            this.layerList[index] = this.turnOnLayer;
            this.currLayer = layer;
            this.currLayerName = layer.layer_admin.layerName;
            this.noLayers = false;
            this.userPageLayers[index].layerShown = true;

            for(let i=0; i<this.perms.length; i++) {
                if(this.perms[i].layerAdminID == this.currLayer.layerAdminID) {
                    this.perm = this.perms[i];
                }
            }
            console.log(this.perm.edit)
            //this.myCubeService.setMyCubeConfig(layer.layer_admin.ID, this.perm.edit);
        } else {
            console.log("Removing Mycube: " + this.layerList[index])
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
        }
        //this.setCurrentLayer(index, this.currLayer, true);
    }
    private setCurrentLayer(index: number, layer: UserPageLayer, checked: boolean): void {
        console.log('Setting Current Layer')
        index = this.userPageLayers.findIndex(x => x==layer)
        for (let x of this.userPageLayers) {
            if (x == layer) {
                if (x.layerShown === true && x.layer_admin.layerType == "MyCube") {
                    this.setCurrentMyCube(index, layer, checked)
                }
                if (x.layerShown === true && x.layer_admin.layerType != "MyCube") {
                    switch (x.layer_admin.layerType) {
                        case ("MyCube"): {this.shown = true; break}
                        default: {this.shown = false}
                    }
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
  

    private setCurrentMyCube(index: number, layer: UserPageLayer, checked: boolean) {
        console.log("setCurrentMyCube")
        this.shown = true
        
        this._map.off('click');
        this._map.on('click', (event: L.LeafletMouseEvent) => {
            console.log('clicked on the screen')    
        })

        //when a new object gest created
        this._map.on(L.Draw.Event.CREATED, (event: any) => {
            let layer = event.layer
            let shape = layer.toGeoJSON()
            console.log(shape)
            })
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
        //console.log('Flags array: ' + this.userPageLayers[0].layerShown);
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

    

   

    private formLayerRequest(layer: UserPageLayer): string {
        let server: Server;
        this.getServer(layer.layer_admin.serverID);
        for (let i of this.servers) {
            if (i.ID == layer.layer_admin.serverID) {
                server = i;
            }
        }

        switch (layer.layer_admin.layerType) {
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
        this.sideNavService.sendMessage(message);
    }

    private clearMessage(): void {
        this.sideNavService.clearMessage();
    }

    private sendMyCubeData(message: JSON): void {
        let data: MyCubeField[]
        console.log(message["id"])
        //this.myCubeService.sendMyCubeData(message["id"]);
    }

    private clearMyCubeData(): void {
        this.myCubeService.clearMyCubeData();
    }
}
