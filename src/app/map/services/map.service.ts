import {Injectable} from "@angular/core";
//import {Location} from "../core/location.class";
import * as L from "leaflet";
import { UserPage } from '../../../_models/user.model';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { LayerPermission, LayerAdmin, UserPageLayer, MyCubeField, MyCubeConfig } from '../../../_models/layer.model';
import { Server } from '../../../_models/server.model';
import { ServerService } from '../../../_services/_server.service';
import { LayerPermissionService } from '../../../_services/_layerPermission.service';
import { geoJSONService } from './../services/geoJSON.service'
import { MyCubeService } from './../services/mycube.service'
import { WFSService } from './../services/wfs.service';
import { SideNavService } from '../../../_services/sidenav.service';
import {Http, Response } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class MapService {
    public map: L.Map;
    public baseMaps: any;
    public jsonlayer: any;
    public layers = new Array
    private userPageLayers: Array<UserPageLayer> = [];
    private server: Server;
    private servers: Array<Server>;
    private userID: number;
    private perms: LayerPermission[];
    private turnOnLayer: L.Layer;
    private layerList: Array<L.Layer> = [];
    private currLayer: UserPageLayer;
    private currLayerName: string = ''; //Could say something besides nothing
    public noLayers: boolean;
    private perm: LayerPermission;
    private shown: boolean = false
    
    
    
  
    constructor(private http:Http, 
        private userPageLayerService: UserPageLayerService, 
        private serverService: ServerService, 
        private layerPermissionService: LayerPermissionService,
        private geojsonservice: geoJSONService,
        private myCubeService: MyCubeService,
        private wfsService: WFSService,
        private sideNavService: SideNavService)
        {  }

    //Will be deleted once the navigator component is changed out.
    disableLeafletMouseEvent(elementId: string) {
        let element = <HTMLElement>document.getElementById(elementId);

        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);
        
    };

    public openjson (URL) {
    return this.http.get(URL)
        .map((response: Response) => <any>response.json())
        .subscribe(data => console.log(data))
    }

    public initMap() {
        let osm_layer: any = new ol.layer.Tile({
            source: new ol.source.OSM()
        });

        osm_layer.setVisible(true)
        this.layers.push(osm_layer)
        console.log(this.layers)
        let map = new ol.Map({
            layers: this.layers,
            view: new ol.View({
            center: ol.proj.transform([-86.1336, 40.4864], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
            })
        });
        return map
    }
        
    public getUserPageLayers(page: UserPage): void {
        console.log("mapService getUserPageLayers")
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
            let wmsSource = new ol.source.ImageWMS({
                url: 'http://foster2.cityofkokomo.org:8080/geoserver/wms',
                params: {'LAYERS': 'kokomo:Pipes'},
                projection: 'EPSG:4326',
                serverType: 'geoserver',
                crossOrigin: 'anonymous'
              });
        
            let wmsLayer = new ol.layer.Image({
                source: wmsSource
            });
    
            wmsLayer.setVisible(true)
            this.layers.push(wmsLayer)

            if (temp[i].layerON == true) {
                temp[i].layerShown = true;
                //this.toggleLayers(i,temp[i],false)
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
                }).addTo(this.map));
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
                this.layerList[index].removeFrom(this.map);
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
                    this.map.off('click');
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
                    .addTo(this.map)
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
            this.layerList[index].removeFrom(this.map);
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

    private getServer(serverID: number): void {
        this.serverService
            .GetSingle(serverID)
            .subscribe((data: Server) => {
                this.server = data;
            });
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
                    this.map.off('click');
                    console.log("creating click event");
                    this.map.on('click', (event: L.LeafletMouseEvent) => {
                        let BBOX = this.map.getBounds().toBBoxString();
                        let WIDTH = this.map.getSize().x;
                        let HEIGHT = this.map.getSize().y;
                        let IDENT = x.layer_admin.layerIdent;
                        let X = this.map.layerPointToContainerPoint(event.layerPoint).x;
                        let Y = Math.trunc(this.map.layerPointToContainerPoint(event.layerPoint).y);

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

    private sendMessage(message: string): void {
        message = message.split("<body>")[1]
        this.sideNavService.sendMessage(message);
    }

    private setCurrentMyCube(index: number, layer: UserPageLayer, checked: boolean) {
        console.log("setCurrentMyCube")
        this.shown = true
        
        this.map.off('click');
        this.map.on('click', (event: L.LeafletMouseEvent) => {
            console.log('clicked on the screen')    
        })

        //when a new object gest created
        this.map.on(L.Draw.Event.CREATED, (event: any) => {
            let layer = event.layer
            let shape = layer.toGeoJSON()
            console.log(shape)
            })
    }
}
