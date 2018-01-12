import { Injectable } from "@angular/core";
//import {Location} from "../core/location.class";
import * as L from "leaflet";
import { MapConfig, styles } from '../models/map.model'
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
import { MessageService } from '../../../_services/message.service'
import { Http, Response } from "@angular/http";
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
    public mapConfig: MapConfig
    public styles: styles;
    public vectorlayer= new ol.layer.Vector();
    public evkey: any;
 

    constructor(private http: Http,
        private userPageLayerService: UserPageLayerService,
        private serverService: ServerService,
        private layerPermissionService: LayerPermissionService,
        private geojsonservice: geoJSONService,
        private myCubeService: MyCubeService,
        private wfsService: WFSService,
        private sideNavService: SideNavService,
        private messageService: MessageService) {
        
          }
    //Will be deleted once the navigator component is changed out.
    disableLeafletMouseEvent(elementId: string) {
        let element = <HTMLElement>document.getElementById(elementId);

        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);

    };

    public styleFunction = function(feature: ol.Feature) {
        console.log(feature.getGeometry().getType())
        return this.styles[feature.getGeometry().getType()]
    }

    public openjson(URL) {
        return this.http.get(URL)
            .map((response: Response) => <any>response.json())
            .subscribe(data => console.log(data))
    }

    public initMap(mapConfig: MapConfig): Promise<any> {
        this.mapConfig = mapConfig
        //sets the base layer
        this.mapConfig.layers = []
        let osm_layer: any = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        osm_layer.setVisible(true)
        this.mapConfig.sources.push(new ol.source.OSM())
        this.mapConfig.layers.push(osm_layer)

        //continues the initialization
        let promise = new Promise((resolve, reject) => {
            this.getUserPageLayers(this.mapConfig)  //only sending an argument because I have to.
                .then(() => this.getLayerPerms())
                .then(() => this.loadLayers(this.mapConfig, true).then(() => {
                    console.log("initMap Started")
                    this.mapConfig.map = new ol.Map({
                        layers: this.mapConfig.layers,
                        view: new ol.View({
                            projection: 'EPSG:3857',
                            
                            center: ol.proj.transform([-86.1336, 40.4864], 'EPSG:4326', 'EPSG:3857'),
                            zoom: 13
                        })
                    }); resolve(this.mapConfig)
                })
                )
        })
        return promise
    }

    public getUserPageLayers(mapConfig): Promise<any> {
        this.mapConfig = mapConfig //only necessary on changed page
        let promise = new Promise((resolve, reject) => {
            console.log("mapService getUserPageLayers")
            console.log(this.mapConfig)
            this.userPageLayerService
            .GetPageLayers(this.mapConfig.currentpage.ID)
            .subscribe((data: UserPageLayer[]) => {
                this.mapConfig.userpagelayers = data
                resolve()
            });
        })
        return promise
    }

    public getLayerPerms(): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            console.log("getLayerPerms started")
            this.layerPermissionService
                .GetUserLayer(this.userID)
                .subscribe((data: LayerPermission[]) => {
                    this.mapConfig.layerpermission = data
                    resolve()
                })
        })
        return promise
    }

    //loadLayers will load during map init and load the layers that should come on by themselves with the "layerON" property set (in userPageLayers)
    public loadLayers(mapConfig: MapConfig, init: boolean): Promise<any> {
        if (this.evkey) { ol.Observable.unByKey(this.evkey); console.log(this.evkey + " is unned in setCurrentLayer")}
        this.myCubeService.clearMyCubeData()
        this.messageService.clearMessage()
        let promise = new Promise((resolve, reject) => {
            for (let i = 0; i < this.mapConfig.userpagelayers.length; i++) {
                if (this.mapConfig.userpagelayers[i].layer_admin.layerType == "MyCube") {
                    this.mapConfig.userpagelayers[i].layerShown = this.mapConfig.userpagelayers[i].layerON
                    this.loadMyCube(init,this.mapConfig.userpagelayers[i],i)  
                }
                    else {
                    let url = this.formLayerRequest(this.mapConfig.userpagelayers[i])
                    let wmsSource = new ol.source.ImageWMS({
                        url: url,
                        params: { 'LAYERS': this.mapConfig.userpagelayers[i].layer_admin.layerIdent },
                        projection: 'EPSG:4326',
                        serverType: 'geoserver',
                        crossOrigin: 'anonymous'
                    });
                    let wmsLayer = new ol.layer.Image({
                        source: wmsSource
                    });
                    this.mapConfig.userpagelayers[i].layerShown = this.mapConfig.userpagelayers[i].layerON
                    wmsLayer.setVisible(this.mapConfig.userpagelayers[i].layerON)
                    this.mapConfig.layers.push(wmsLayer)
                    this.mapConfig.sources.push(wmsSource)
                    this.mapConfig.userpagelayers[i].loadOrder = this.mapConfig.layers.length
                    if (init == false) {
                       mapConfig.map.addLayer(wmsLayer)
                    }
                
                }
                resolve()
            }
        })
        return promise
    }

    //Reads index of layer in dropdown, layerAdmin, and if it is shown or not. Needs to remove a layer if a new one is selected
    private toggleLayers(loadOrder: number, mapConfig: MapConfig, index): void {
        console.log("toggling Layer loadOrder=" + (loadOrder) + "index=" + index)
        //console.log(index)
        if (mapConfig.userpagelayers[index].layerShown === true) {
            mapConfig.layers[loadOrder - 1].setVisible(false)
            mapConfig.userpagelayers[index].layerShown = false
        }
        else {
            mapConfig.layers[loadOrder - 1].setVisible(true)
            mapConfig.userpagelayers[index].layerShown = true
        }
        // let zindex: number = 1000;
        // let allLayersOff: boolean = true;
        // let nextActive: UserPageLayer;
        // index = this.userPageLayers.findIndex(x => x == layer)
        // console.log(index)

        // if (checked == false) {  //Where layers get turned on
        //     console.log("turning on layer " + layer.layer_admin.layerName)
        //     if (layer.layer_admin.layerType == 'MyCube') { this.loadMyCube(index, layer, checked) } else {
        //         if (layer.layer_admin.layerGeom == 'Coverage') { zindex = -50 }; //This doesn't seem to work.
        //         console.log(layer.layer_admin.layerType)
        //         let url: string = this.formLayerRequest(layer);
        //         this.turnOnLayer = (L.tileLayer.wms(url, {
        //             layers: layer.layer_admin.layerIdent,
        //             format: layer.layer_admin.layerFormat,
        //             transparent: true
        //         }).addTo(this.map));
        //         this.layerList[index] = this.turnOnLayer;
        //         this.currLayer = layer;
        //         this.currLayerName = layer.layer_admin.layerName;
        //         this.noLayers = false;
        //         this.userPageLayers[index].layerShown = true;
        //         this.setCurrentLayer(index, this.currLayer, true);
        //     }
        // } else { //Where layers get turned OFF
        //     console.log("turning off layer" + layer.layer_admin.layerName)
        //     if (layer.layer_admin.layerType == 'MyCube') { this.loadMyCube(index, layer, checked) } else {
        //         this.layerList[index].removeFrom(this.map);
        //         this.userPageLayers[index].layerShown = false;
        //         for (let i of this.userPageLayers) {
        //             allLayersOff = true;
        //             if (i.layerON) {
        //                 nextActive = i;
        //                 allLayersOff = false;
        //                 break;
        //             }
        //         }

        //         if (this.currLayer == layer && allLayersOff == true) {
        //             this.map.off('click');
        //             this.currLayer = null;
        //             this.currLayerName = 'No Active Layer';
        //             this.noLayers = true;
        //         } else if (this.currLayer == layer && !allLayersOff) {
        //             //9/25/17: Needs to make the next layer the current layer.  Right now it just goes to the first one.
        //             this.currLayer = nextActive;
        //             this.currLayerName = nextActive.layer_admin.layerName;
        //             //this.setCurrentLayer(index, this.currLayer, true); //sets the current layer if the current layer is turned off.
        //             this.noLayers = false;
        //         }
        //     }
        // }
    }

    private loadMyCube(init: boolean, layer: UserPageLayer, index) {
        let allLayersOff: boolean = true;
        let nextActive: UserPageLayer;
        this.geojsonservice.GetAll(layer.layer_admin.ID)
            .subscribe((data: GeoJSON.Feature<any>) => {
                console.log(data[0][0]['jsonb_build_object'])
                let source = new ol.source.Vector({ features: (new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })).readFeatures(data[0][0]['jsonb_build_object']) })
                let style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.6)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#319FD3',
                        width: 1
                    }),
                    text: new ol.style.Text({
                        font: '12px Calibri,sans-serif',
                        fill: new ol.style.Fill({
                            color: '#000'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#fff',
                            width: 3
                        })
                    })
                });

                this.vectorlayer = new ol.layer.Vector({ source: source })
                this.vectorlayer.setOpacity(.5)
                this.vectorlayer.setVisible(layer.layerON)
                this.mapConfig.map.addLayer(this.vectorlayer)
                this.mapConfig.layers.push(this.vectorlayer)
                this.mapConfig.sources.push(source)
                this.mapConfig.userpagelayers[index].loadOrder = this.mapConfig.layers.length
                if (init == false) {
                    this.mapConfig.map.addLayer(this.vectorlayer)
                }
                // this.layerList[index] = L.geoJSON(data[0][0]['jsonb_build_object'])
                //     .addTo(this.map)
                //     .on('click', (event: any) => {
                //         //this.sendMyCubeData(event.layer.feature.properties)
                //         this.myCubeService.setMyCubeConfig(layer.layer_admin.ID, this.perm.edit);
                //         this.myCubeService.sendMyCubeData(layer.layer_admin.ID, event.layer.feature.properties.ID, event.layer.feature.properties);
                //     })
            })
        //     this.setCurrentMyCube(index, layer, checked)
        //     //this.sendMessage("<body>MyCube Selected</body>")
        //     this.layerList[index] = this.turnOnLayer;
        //     this.currLayer = layer;
        //     this.currLayerName = layer.layer_admin.layerName;
        //     this.noLayers = false;
        //     this.userPageLayers[index].layerShown = true;

        //     for (let i = 0; i < this.perms.length; i++) {
        //         if (this.perms[i].layerAdminID == this.currLayer.layer_admin.ID) {
        //             this.perm = this.perms[i];
        //         }
        //     }
        //     console.log(this.perm.edit)
        //     //this.myCubeService.setMyCubeConfig(layer.layer_admin.ID, this.perm.edit);
        // } else {
        //     console.log("Removing Mycube: " + this.layerList[index])
        //     this.layerList[index].removeFrom(this.map);
        //     this.userPageLayers[index].layerShown = false;
        //     for (let i of this.userPageLayers) {
        //         allLayersOff = true;
        //         if (i.layerON) {
        //             nextActive = i;
        //             allLayersOff = false;
        //             break;
        //         }
        //     }

        //this.setCurrentLayer(index, this.currLayer, true);

    }

    private formLayerRequest(layer: UserPageLayer): string {

        switch (layer.layer_admin.layerType) {
            case ('MapServer'): {
                console.log('Mapserver Layer');
                let norest: string = layer.layer_admin.server.serverURL.split('/rest/')[0] + '/' + layer.layer_admin.server.serverURL.split('/rest/')[1];
                let url: string = norest + '/' + layer.layer_admin.layerService + '/MapServer/WMSServer';
                //console.log(url);
                return url;
            }
            case ('Geoserver'): {
                console.log('Geoserver Layer');
                let url: string = layer.layer_admin.server.serverURL
                return url;
            }
        }
    }

    private getServer(serverID: number): void {
        this.serverService
            .GetSingle(serverID)
            .subscribe((data: Server) => {
                console.log(data.serverURL)
                this.server = data;
            });
    }

    private setCurrentLayer(index: number, layer: UserPageLayer, checked: boolean, mapconfig: MapConfig): void {
        console.log("setCurrentLayer()")
        this.mapConfig = mapconfig
        this.mapConfig.currLayerName = layer.layer_admin.layerName
        this.mapConfig.userpagelayers.forEach(element => {
            if (element.layer_admin.layerType == "MyCube") {
                console.log("Setting layer to .5 opacity")
                this.mapConfig.layers[element.loadOrder-1].setOpacity(.5)
            }
        });
        // console.log('Setting Current Layer')
        // console.log(this.mapConfig.layers[index].getSource())
        index = this.mapConfig.userpagelayers.findIndex(x => x == layer)
        for (let x of this.mapConfig.userpagelayers) {
            if (x == layer) {
                if (x.layerShown === true && x.layer_admin.layerType == "MyCube") {
                    this.setCurrentMyCube(index, layer, checked)
                }
                if (x.layerShown === true && x.layer_admin.layerType != "MyCube") {
                    switch (x.layer_admin.layerType) {
                        case ("MyCube"): { this.shown = true; break }
                        default: { this.shown = false }
                    }
                    if (this.evkey) { ol.Observable.unByKey(this.evkey); console.log(this.evkey + " is unned in setCurrentLayer")}
                   
                    this.evkey = this.createClick(layer, index)
                    // this.mapConfig.map.on('singleclick', (evt:any) => {
                    //     //document.getElementById('info').innerHTML = '';
                    //     let url1: string
                    //    switch (layer.layer_admin.layerType) {
                    //         case ('MapServer'): {
                    //             console.log('Mapserver Layer');
                    //             let norest: string = layer.layer_admin.server.serverURL.split('/rest/')[0] + '/' + layer.layer_admin.server.serverURL.split('/rest/')[1];
                    //             url1 = norest + '/' + layer.layer_admin.layerService + '/MapServer/WMSServer';
                    //             //console.log(url);
                        
                    //         }
                    //         case ('Geoserver'): {
                    //             console.log('Geoserver Layer');
                    //             url1 = layer.layer_admin.server.serverURL
                    //         }
                    //     }
                    //     console.log(url1)
                    //     let wmsSource = new ol.source.ImageWMS({
                    //         url: url1,
                    //         params: { 'LAYERS': layer.layer_admin.layerIdent },
                    //         projection: 'EPSG:4326',
                    //         serverType: 'geoserver',
                    //         crossOrigin: 'anonymous'
                    //     });
                    //     let viewResolution = mapconfig.map.getView().getResolution();
                    //     let BBOX = mapconfig.map.getView().getMinResolution
                    //     console.log(BBOX)
                    //     let source: ol.source.ImageWMS = mapconfig.map.getLayers().item(index).getProperties().source
                    //     console.log(evt.coordinate)
                    //     let url = wmsSource.getGetFeatureInfoUrl(
                    //         evt.coordinate, viewResolution, 'EPSG:3857',
                    //         {'INFO_FORMAT': 'text/html'});
                    //     // url = this.formLayerRequest(layer) + '?service=WMS&version1.1.1&request=GetFeatureInfo&layers=' + x.layer_admin.layerIdent + '&query_layers=' + x.layer_admin.layerIdent + 
                    //     console.log(url)
                    //     if (url) {
                    //             this.wfsService.getfeatureinfo(url, false)
                    //             .subscribe((data: any) => {
                    //             this.sendMessage(data);
                    //         });
                    //     }
                    //   });
                    this.mapConfig.currLayerName = x.layer_admin.layerName;
                    this.getServer(layer.layer_admin.serverID);
                    this.noLayers = false;
                    console.log("creating click event");
                }
            }
        }

        // if (!checked) {
        //     console.log('Turning off layer' + layer.layer_admin.layerName);
        //     this.toggleLayers(index, layer, checked);
        // }

        //console.log(this.currLayer.layer_admin.layerName);
    }

    private createClick(layer, index) {
        let evkey = this.mapConfig.map.on('singleclick', (evt:any) => {
            let url2 = this.formLayerRequest(layer)
            let wmsSource = new ol.source.ImageWMS({
                url: url2,
                params: { 'LAYERS': layer.layer_admin.layerIdent },
                projection: 'EPSG:4326',
                serverType: 'geoserver',
                crossOrigin: 'anonymous'
            });
            let viewResolution = this.mapConfig.map.getView().getResolution();
            let source: ol.source.ImageWMS = this.mapConfig.map.getLayers().item(index).getProperties().source
            let url = wmsSource.getGetFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:3857',
                {'INFO_FORMAT': 'text/html'});
            if (url) {
                    this.wfsService.getfeatureinfo(url, false)
                    .subscribe((data: any) => {
                    this.sendMessage(data);
                });
            }
          });
          return evkey
    }
    private sendMessage(message: any): void {
        message = message.split("<body>")[1]
        this.messageService.sendMessage(message);
    }

    private clearMessage(): void {
        this.messageService.clearMessage();
    }

    private setCurrentMyCube(index: number, layer: UserPageLayer, checked: boolean) {
        console.log("setCurrentMyCube")
        this.shown = true
        if (this.evkey) { ol.Observable.unByKey(this.evkey), console.log(this.evkey + " is unned in setCurrentMyCube.")}
        console.log(layer.loadOrder)
        console.log(this.mapConfig.layers[layer.loadOrder])

        let filterlayer = new Array
        this.mapConfig.layers[layer.loadOrder-1].setOpacity(1)
        filterlayer.push(this.mapConfig.layers[layer.loadOrder])
        let selectClick = new ol.interaction.Select({
            condition: ol.events.condition.click,
            layers:  [this.mapConfig.layers[layer.loadOrder-1]]
          });
          
        selectClick.on('select', (evt:ol.interaction.Select.Event) => {
            console.log("inside the selectClick interaction")
            if (evt.selected[0]) {
           //console.log(evt.selected[0].getKeys())
            //console.log(evt.selected[0].getProperties().id)
            this.myCubeService.setMyCubeConfig(layer.layer_admin.ID, true); //need to fix the edit property
         this.myCubeService.sendMyCubeData(layer.layer_admin.ID, evt.selected[0].getProperties().id);
            }
        })
        this.mapConfig.map.addInteraction(selectClick)
        this.mapConfig.clickInteraction = selectClick

        // this.evkey = this.mapConfig.map.on('click', (evt:ol.MapEvent) => {
        //     console.log('clicked on the screen')
        //     console.log(evt.target.toString())
        // })
    }
    private filterlayer(layer) {
        console.log(layer)
        return layer
    }
}
