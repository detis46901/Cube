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
    public styles: styles
    public  vectorlayer= new ol.layer.Vector()

    constructor(private http: Http,
        private userPageLayerService: UserPageLayerService,
        private serverService: ServerService,
        private layerPermissionService: LayerPermissionService,
        private geojsonservice: geoJSONService,
        private myCubeService: MyCubeService,
        private wfsService: WFSService,
        private sideNavService: SideNavService) { }

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
        let promise = new Promise((resolve, reject) => {
            console.log("Existing # of layers in array=" + this.mapConfig.layers.length)
            console.log('LoadLayers Started.  # of layers= '  + this.mapConfig.userpagelayers.length)
            for (let i = 0; i < this.mapConfig.userpagelayers.length; i++) {
                console.log("loading " + this.mapConfig.userpagelayers[i].layer_admin.layerName)
                if (this.mapConfig.userpagelayers[i].layer_admin.layerType == "MyCube") {
                    this.mapConfig.userpagelayers[i].layerShown = this.mapConfig.userpagelayers[i].layerON
                    this.loadMyCube(init,this.mapConfig.userpagelayers[i],i)  
                }
                    else {
                    console.log(this.mapConfig.userpagelayers[i].layer_admin.layerType)
                    let url = this.formLayerRequest(this.mapConfig.userpagelayers[i])
                    //console.log(url)
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
                    this.mapConfig.userpagelayers[i].loadOrder = this.mapConfig.layers.length
                    //this.mapConfig.map.addLayer(wmsLayer)
                    console.log("Layer " + this.mapConfig.layers.length + " pushed")
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
        
        //let vectorLayer = new ol.layer.Vector()
        //let geojsonObject = {"type":"FeatureCollection","features":[{"id":"2018-01-01T15:26:57.01581","type":"Feature","geometry":{"type":"LineString","coordinates":[[-86.1217502016954,40.5042953152252],[-86.1557655020145,40.4238597233524]]},"properties":{"1":true,"id":"2018-01-01T15:26:57.01581"}},{"id":"2018-01-01T17:08:58.357797","type":"Feature","geometry":{"type":"LineString","coordinates":[[-86.1523180053605,40.4938091790315],[-86.1192220374824,40.4247345410204]]},"properties":{"1":false,"id":"2018-01-01T17:08:58.357797"}}]};
    
        //   let geoJSONObject2 = {
        //       "type":"FeatureCollection",
        //   'crs': {
        //     'type': 'name',
        //     'properties': {
        //       'name': 'EPSG:4326'
        //     }
        // },
        // "features":[{
        //     "type":"Feature",
        //     "geometry":{
        //         "type":"LineString",
        //         "coordinates":[[4e6, -2e6], [8e6, -2e6]]
        //     }
        // },{
        //     "type":"Feature",
        //     "geometry":{
        //         "type":"LineString",
        //         "coordinates":[[-86.15,40.49], [-86.11,40.42]]
        //     }}
        // ]}
        // console.log(geojsonObject)
        // let source = new ol.source.Vector({features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)})
        // var vectorLayer = new ol.layer.Vector({
        //     source: source
        // });
        
        // this.mapConfig.layers.push(vectorLayer)
        
        // let source2 = new ol.source.Vector({features: (new ol.format.GeoJSON()).readFeatures(geoJSONObject2)})
        // var vectorLayer2 = new ol.layer.Vector({
        //     source: source2
        // });
        // this.mapConfig.layers.push(vectorLayer2)
        // console.log(geoJSONObject2)
        
        console.log("loadMyCube: init=" + init + ",index=" + index)
            this.geojsonservice.GetAll(layer.layer_admin.ID)
                .subscribe((data: GeoJSON.Feature<any>) => {
                    console.log(data[0][0]['jsonb_build_object'])
                    let source = new ol.source.Vector({features: (new ol.format.GeoJSON({defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'})).readFeatures(data[0][0]['jsonb_build_object'])})
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
        
                    this.vectorlayer = new ol.layer.Vector({source: source})

                   //this.mapConfig.layers[index] = (this.vectorlayer)
                   this.vectorlayer.setVisible(layer.layerON)
                   this.mapConfig.map.addLayer(this.vectorlayer)
                   this.mapConfig.layers.push(this.vectorlayer)
                   this.mapConfig.userpagelayers[index].loadOrder = this.mapConfig.layers.length
                    console.log("Layer " + index + " pushed")
                    if (init == false) {
                        //this.mapConfig.map.addLayer(this.vectorlayer)
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
        //console.log(layer.layer_admin.server.serverURL)
        // let server: Server;
        // this.getServer(layer.layer_admin.serverID);
        // for (let i of this.servers) {
        //     if (i.ID == layer.layer_admin.serverID) {
        //         server = i;
        //     }
        // }

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

    private setCurrentLayer(index: number, layer: UserPageLayer, checked: boolean): void {
        console.log('Setting Current Layer')
        index = this.userPageLayers.findIndex(x => x == layer)
        for (let x of this.userPageLayers) {
            if (x == layer) {
                if (x.layerShown === true && x.layer_admin.layerType == "MyCube") {
                    this.setCurrentMyCube(index, layer, checked)
                }
                if (x.layerShown === true && x.layer_admin.layerType != "MyCube") {
                    switch (x.layer_admin.layerType) {
                        case ("MyCube"): { this.shown = true; break }
                        default: { this.shown = false }
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
                        let URL: string = this.formLayerRequest(layer) + '?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=' + IDENT + '&query_layers=' + IDENT + '&BBOX=' + BBOX + '&HEIGHT=' + HEIGHT + '&WIDTH=' + WIDTH + '&INFO_FORMAT=text%2Fhtml&SRS=EPSG:4326&X=' + X + '&Y=' + Y;
                        console.log(URL);
                        this.wfsService.getfeatureinfo(URL, false)
                            .subscribe((data: any) => {
                                this.sendMessage(data);
                            });
                    });
                }
            }
        }

        // if (!checked) {
        //     console.log('Turning off layer' + layer.layer_admin.layerName);
        //     this.toggleLayers(index, layer, checked);
        // }

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
