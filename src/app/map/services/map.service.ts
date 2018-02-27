import { Injectable } from "@angular/core";

import { MapConfig, mapStyles, featureList } from '../models/map.model'
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { LayerPermission, Layer, UserPageLayer, MyCubeField, MyCubeConfig } from '../../../_models/layer.model';
import { LayerPermissionService } from '../../../_services/_layerPermission.service';
import { geoJSONService } from './../services/geoJSON.service'
import { MyCubeService } from './../services/mycube.service'
import { WFSService } from './../services/wfs.service';
import { SQLService } from './../../../_services/sql.service'
import { MessageService } from '../../../_services/message.service'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { when } from "q";

@Injectable()
export class MapService {
    public map: L.Map; //needs to be removed once marker and pmmarker are removed.
    public noLayers: boolean;
    private shown: boolean = false
    public mapConfig: MapConfig;
    public vectorlayer= new ol.layer.Vector();
    public evkey: any;
    public modkey: any;
    public modify: ol.interaction.Modify;
    public selectedLayer: any
    public editmode: boolean = false
    public oid: number
    public featurelist = new Array<featureList>()
    public base: string = 'base'
    private cubeData: MyCubeField[]
    public http: Http
    public options: any

    constructor(
        private userPageLayerService: UserPageLayerService,
        private layerPermissionService: LayerPermissionService,
        private geojsonservice: geoJSONService,
        private myCubeService: MyCubeService,
        private wfsService: WFSService,
        private messageService: MessageService,
        private sqlService: SQLService,
        private mapstyles: mapStyles,
        http: Http
         ) {this.http = http }

    //Will be deleted once the navigator component is changed out.
    disableLeafletMouseEvent(elementId: string) {
    };

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
                    this.mapConfig.view = new ol.View({
                        projection: 'EPSG:3857',                       
                        center: ol.proj.transform([-86.1336, 40.4864], 'EPSG:4326', 'EPSG:3857'),
                        zoom: 13
                    })
                    this.mapConfig.map = new ol.Map({
                        layers: this.mapConfig.layers,
                        view: this.mapConfig.view,
                        controls: ol.control.defaults({
                            attribution: false,
                            zoom: null
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
            this.userPageLayerService
            .GetPageLayers(this.mapConfig.currentpage.ID)
            .subscribe((data: UserPageLayer[]) => {
                this.mapConfig.userpagelayers = data
                if (data.length != 0){
                //if (this.mapConfig.userpagelayers[0].layerON == true) {this.mapConfig.currentLayer = this.mapConfig.userpagelayers[0]}
                //this.mapConfig.currentLayerName = this.mapConfig.userpagelayers[0].layer.layerName
                }
                else {
                    this.mapConfig.currentLayer = new UserPageLayer
                    this.mapConfig.currentLayerName = ""
                }
                resolve()
            });
        })
        return promise
    }

    public getLayerPerms(): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            console.log("UserID = " + this.mapConfig.userID)
            this.layerPermissionService
                .GetByUserGroups(this.mapConfig.userID)
                .subscribe((data: LayerPermission[]) => {
                    this.mapConfig.layerpermission = data
                    this.mapConfig.userpagelayers.forEach((userpagelayer) => {
                        let j = this.mapConfig.layerpermission.findIndex((x) => x.layerID == userpagelayer.layerID)
                        if (j >= 0) {
                            userpagelayer.layerPermissions = this.mapConfig.layerpermission[j]
                            //need to make sure the maximum permissions get provided.  probably need to use foreach instead of findIndex  It uses the first one instead of the most liberal.
                        }
                    })
                    resolve()
                })
        })
        return promise
    }

    public getCapabilities = (url): Observable<any> => {
        return this.http.get(url)
        //return this.http.get("https://openlayers.org/en/v4.6.4/examples/data/WMTSCapabilities.xml")
            .map((response: Response) => <any>response.text())
    }

    //loadLayers will load during map init and load the layers that should come on by themselves with the "layerON" property set (in userPageLayers)
    public loadLayers(mapConfig: MapConfig, init: boolean): Promise<any> {
        let j=0
        if (this.evkey) { ol.Observable.unByKey(this.evkey)}  //removes the previous click event if there was one.
        if (this.modkey) { ol.Observable.unByKey(this.modkey)} //removes the previous modify even if there was one.
        this.myCubeService.clearMyCubeData()
        this.messageService.clearMessage()
        let promise = new Promise((resolve, reject) => {
            for (let i = 0; i < this.mapConfig.userpagelayers.length; i++) {

                switch (this.mapConfig.userpagelayers[i].layer.layerType) {
                    case "MyCube": {
                        this.mapConfig.userpagelayers[i].layerShown = this.mapConfig.userpagelayers[i].layerON
                        this.loadMyCube(init, this.mapConfig.userpagelayers[i])
                        j++
                        console.log("j=" + j)
                        if (j == this.mapConfig.userpagelayers.length) {resolve()}
                        break
                    }
                    case "WMTS": {
                        this.getCapabilities(this.mapConfig.userpagelayers[i].layer.server.serverURL)
                            .subscribe((data) => {
                                console.log(data)
                                let parser = new ol.format.WMTSCapabilities();
                                let result = parser.read(data)
                                //console.log(result)
                                let options = ol.source.WMTS.optionsFromCapabilities(result, {
                                    layer: this.mapConfig.userpagelayers[i].layer.layerIdent,
                                    matrixSet: 'EPSG:3857'
                                });
                                console.log(mapConfig.userpagelayers[i].layer.layerIdent)
                                console.log(options)
                                let wmsSource = new ol.source.WMTS(options)
                                this.setLoadEvent(this.mapConfig.userpagelayers[i], wmsSource)
                                let wmsLayer = new ol.layer.Tile({
                                    opacity: 1,
                                    source: new ol.source.WMTS(options)
                                });
                                this.mapConfig.userpagelayers[i].layerShown = this.mapConfig.userpagelayers[i].layerON
                                wmsLayer.setVisible(this.mapConfig.userpagelayers[i].layerON)
                                this.mapConfig.layers.push(wmsLayer)
                                this.mapConfig.sources.push(wmsSource)
                                this.mapConfig.userpagelayers[i].loadOrder = this.mapConfig.layers.length
                                if (init == false) {
                                    mapConfig.map.addLayer(wmsLayer)
                                }
                                console.log("Done")
                                j++
                                console.log("j=" + j)
                                if (j == this.mapConfig.userpagelayers.length) {resolve()}
                            })
                        break

                    }
                    default: {
                        let url = this.formLayerRequest(this.mapConfig.userpagelayers[i])
                        let wmsSource = new ol.source.ImageWMS({
                            url: url,
                            params: { 'LAYERS': this.mapConfig.userpagelayers[i].layer.layerIdent },
                            projection: 'EPSG:4326',
                            serverType: 'geoserver',
                            crossOrigin: 'anonymous'
                        });
                        this.setLoadEvent(this.mapConfig.userpagelayers[i], wmsSource)
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
                        j++
                        console.log("j=" + j)
                        if (j == this.mapConfig.userpagelayers.length) {resolve()}
                    }
                }
            }
            
            console.log(this.mapConfig.userpagelayers.length)
        })
        return promise
    }

    //Reads index of layer in dropdown, layer, and if it is shown or not. Needs to remove a layer if a new one is selected
    private toggleLayers(loadOrder: number, mapConfig: MapConfig, index): void {
        if (mapConfig.userpagelayers[index].layerShown === true) {
            mapConfig.layers[loadOrder - 1].setVisible(false)
            mapConfig.userpagelayers[index].layerShown = false
            
            if (this.mapConfig.currentLayer == this.mapConfig.userpagelayers[index]) {
                this.mapConfig.currentLayer = new UserPageLayer
                this.mapConfig.currentLayerName = ""}
                //could add something here that would move to the next layerShown=true.  Not sure.
        }
        else {
            mapConfig.layers[loadOrder - 1].setVisible(true)
            mapConfig.userpagelayers[index].layerShown = true
            this.setCurrentLayer(mapConfig.userpagelayers[index], mapConfig)
        }
    }

    private loadMyCube(init: boolean, layer: UserPageLayer) {
        let index = this.mapConfig.userpagelayers.findIndex(x => x == layer)
        let allLayersOff: boolean = true;
        let nextActive: UserPageLayer;
        //let source = new ol.source.Vector(
        let source = new ol.source.Vector({
            format: new ol.format.GeoJSON()
        })

        let interval = setInterval(() => {
            this.getMyCubeData(layer).then((data) => {
                if (data[0][0]['jsonb_build_object']['features']) {
                    //need to put something in here so that when an object is being edited, it doesn't update...
                    //might just be that the layer doesn't update unless something has changed.
                    source.clear()
                    source.addFeatures(new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']))
                    if (this.mapConfig.currentLayer == layer) {
                        this.getFeatureList()
                        if (this.mapConfig.selectedFeature) {
                            this.mapConfig.selectedFeature = source.getFeatureById(this.mapConfig.selectedFeature.getId())
                            if (this.mapConfig.selectedFeature) {this.selectFeature(layer, true)} //need to make sure the feature still exists
                            
                            //source.getFeatureById(this.mapConfig.selectedFeature.getId()).setStyle(this.mapstyles.selected)
                            //this.mapConfig.selectedFeature.setStyle(this.mapstyles.selected)
                        }
                    }
                    //may need to add something in here that compares new data to old data and makes sure the selected feature remains selected.
                }
            })    
        }, 20000);

        this.getMyCubeData(layer).then((data) => {
            if (data[0][0]['jsonb_build_object']['features']) {
                source.addFeatures(new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']))
            }
            this.vectorlayer = new ol.layer.Vector({ source: source, style: this.styleFunction(layer, 'load') })
            this.vectorlayer.setVisible(layer.layerON)
            this.mapConfig.map.addLayer(this.vectorlayer)
            this.mapConfig.layers.push(this.vectorlayer)
            this.mapConfig.sources.push(source)
            this.mapConfig.userpagelayers[index].loadOrder = this.mapConfig.layers.length
            if (init == false) {
                this.mapConfig.map.addLayer(this.vectorlayer)
            }
        })
        //source = new ol.source.Vector({ features: (new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })).readFeatures(data[0][0]['jsonb_build_object']) })}
    }
    
    private getMyCubeData(layer): Promise<any> {
        let source = new ol.source.Vector()
        let promise = new Promise ((resolve, reject) => {
            this.geojsonservice.GetAll(layer.layer.ID)
            .subscribe((data: GeoJSON.Feature<any>) => {
                //source = new ol.source.Vector()
                resolve(data)//source = new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })).readFeatures(data[0][0]['jsonb_build_object']) })                
            })
           
        })
        return promise
    }

    private styleFunction(layer: UserPageLayer, mode:string):ol.style.Style {
        let color: string
        let width: number
        if (layer.style) {color = layer.style[mode]['color'];width = layer.style[mode]['width']}
        else {color = layer.layer.defaultStyle[mode]['color']; width = layer.layer.defaultStyle[mode]['width']}
        let load = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: null,
                stroke: new ol.style.Stroke({color: color, width: width})
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: color,
                width: width
            }),
            text: new ol.style.Text({
                font: '12px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 1
                }),
            })
        });
        return load
    }
    private formLayerRequest(layer: UserPageLayer): string {
      switch (layer.layer.layerType) {
            case ('MapServer'): {
                let norest: string = layer.layer.server.serverURL.split('/rest/')[0] + '/' + layer.layer.server.serverURL.split('/rest/')[1];
                let url: string = norest + '/' + layer.layer.layerService + '/MapServer/WMSServer';
                return url;
            }
            case ('Geoserver'): {
                let url: string = layer.layer.server.serverURL
                return url;
            }
        }
    }

    private setCurrentLayer(layer: UserPageLayer, mapconfig: MapConfig): void {
        this.mapConfig = mapconfig
        this.mapConfig.editmode = false
        this.mapConfig.map.removeInteraction(this.modify)
        this.modify = null
        this.mapConfig.currentLayer = layer
        this.myCubeService.clearMyCubeData() //cleans the selected myCube data off the screen
        if (this.mapConfig.selectedFeature) {this.mapConfig.selectedFeature.setStyle(null)}  //fixes a selected feature's style
        this.mapConfig.currentLayerName = layer.layer.layerName  //Puts the current name in the component
        if (layer.layerON) {this.mapConfig.currentLayer = layer}
        this.mapConfig.userpagelayers.forEach(element => {
            if (element.layer.layerType == "MyCube") {
                this.mapConfig.layers[element.loadOrder-1].setStyle(this.styleFunction(element, 'load')) //resets all the feature styles to "load"
            }
        });
        let index = this.mapConfig.userpagelayers.findIndex(x => x == layer)
        for (let x of this.mapConfig.userpagelayers) {
            if (x == layer) {
                if (x.layerShown === true && x.layer.layerType == "MyCube") {
                    this.setCurrentMyCube(layer)
                }
                if (x.layerShown === true && x.layer.layerType != "MyCube") {
                    switch (x.layer.layerType) {
                        case ("MyCube"): { this.shown = true; break }
                        default: { this.shown = false }
                    }
                    if (this.evkey) { ol.Observable.unByKey(this.evkey)}
                    if (this.modkey) { ol.Observable.unByKey(this.modkey)} //removes the previous modify even if there was one.
                    this.evkey = this.createClick(layer, index)
                    this.mapConfig.currentLayerName = x.layer.layerName;
                    //this.getServer(layer.layer_.serverID);
                    this.noLayers = false;
                }
            }
        }
    }

    private createClick(layer, index) {
        let evkey = this.mapConfig.map.on('singleclick', (evt:any) => {
            let url2 = this.formLayerRequest(layer)
            let wmsSource = new ol.source.ImageWMS({
                url: url2,
                params: { 'LAYERS': layer.layer.layerIdent },
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

    private setLoadEvent(layer: UserPageLayer, source: ol.source.Source) {
        source.on('tileloadstart', () => {
            layer.loadStatus = "Loading"
            console.log(layer.layer.layerName + " loading")
        })
        source.on('tileloadend', () => {
            layer.loadStatus = "Loaded"
            console.log(layer.layer.layerName + " loaded")
        })
        source.on('tileloaderror', () => {
            console.log("error")
        })
        source.on('imageloadstart', () => {
            layer.loadStatus = "Loading"
            console.log(layer.layer.layerName + " loading")
        })
        source.on('imageloadend', () => {
            layer.loadStatus = "Loaded"
            console.log(layer.layer.layerName + " loaded")
        })
        source.on('imageloaderror', () => {
            console.log("error")
        })
    }
    private sendMessage(message: string): void {
        message = message.split("<body>")[1]
        message = message.split("</body>")[0]
        if (message.length < 10) {this.messageService.clearMessage()}
        else {this.messageService.sendMessage(message)};
    }

    private clearMessage(): void {
        this.messageService.clearMessage();
    }

    private setCurrentMyCube(layer: UserPageLayer) {
        this.featurelist = []
        this.shown = true
        this.mapConfig.editmode = layer.layerPermissions.edit
        this.mapConfig.map.removeInteraction(this.modify)
        this.modify = null
        if (this.evkey) { 
            ol.Observable.unByKey(this.evkey)
        }
        if (this.modkey) { 
            ol.Observable.unByKey(this.modkey) //removes the previous modify even if there was one.
        }
        this.mapConfig.layers[layer.loadOrder-1].setStyle(this.styleFunction(layer,'current'))
        this.getFeatureList()
        this.evkey = this.mapConfig.map.on('singleclick', (e) => {
            if (this.mapConfig.selectedFeature) {
                this.mapConfig.selectedFeature.setStyle(null)
            }
            var hit = false;
            this.mapConfig.map.forEachFeatureAtPixel(e.pixel, (feature: ol.Feature, selectedLayer: any) => {
                //if (this.mapConfig.selectedFeature != feature) {this.mapConfig.map.removeInteraction(this.modify)}
                this.selectedLayer = selectedLayer
                if (selectedLayer === this.mapConfig.layers[layer.loadOrder-1]) {
                    hit = true;
                    this.mapConfig.selectedFeature = feature};
                }, {
                    hitTolerance: 5
                });
                if (hit) {
                    this.selectFeature(layer)
                } else {
                   this.clearFeature(layer)
                }
          });

        this.myCubeService.prebuildMyCube(layer) //This needs a lot of work
         
    }

    private selectFeature(layer: UserPageLayer, refresh: boolean = false) {
        this.mapConfig.selectedFeature.setStyle(this.mapstyles.selected)
        if (refresh == false) {
        this.myCubeService.setMyCubeConfig(layer.layer.ID, layer.layerPermissions.edit);
        this.myCubeService.sendMyCubeData(layer.layer.ID, this.mapConfig.selectedFeature.getId());
        }
        this.mapConfig.selectedFeatures.clear()
        this.mapConfig.selectedFeatures.push(this.mapConfig.selectedFeature)
        if (layer.layerPermissions.edit == true) {
        if (!this.modify) {
        this.modify = new ol.interaction.Modify({features: this.mapConfig.selectedFeatures})
        this.mapConfig.map.addInteraction(this.modify)}
        this.modkey = this.modify.on('modifyend', (e: ol.interaction.Modify.Event) => {
            e.features.forEach(element => {
                this.mapConfig.selectedFeature = element
                let featurejson = new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature)
                    this.geojsonservice.updateGeometry(layer.layer.ID, JSON.parse(featurejson))
                    .subscribe()
            });
        })
    }
    }

    private clearFeature(layer: UserPageLayer) {
        if (this.mapConfig.selectedFeature) {
            this.mapConfig.selectedFeature.setStyle(null)
            this.mapConfig.selectedFeature = null
        }
        this.mapConfig.map.removeInteraction(this.modify)
        this.modify = null
        if (this.modkey) {
            ol.Observable.unByKey(this.modkey) //removes the previous modify even if there was one.
        }
        this.myCubeService.clearMyCubeData()
        this.mapConfig.layers[layer.loadOrder-1].setStyle(this.styleFunction(layer, 'current'))
    }

    private draw(mapconfig: MapConfig, featurety: any) {
        this.mapConfig = mapconfig
        if (this.modkey) { ol.Observable.unByKey(this.modkey)} //removes the previous modify even if there was one.
        this.mapConfig.map.removeInteraction(this.modify)
        this.modify = null
        let src = new ol.source.Vector()
        let vector = new ol.layer.Vector({
            source: src,
            style: this.mapstyles.selected
        });
        let draw = new ol.interaction.Draw({
            type: featurety,
            source: src,
        })
        this.mapConfig.map.addLayer(vector)
        this.modkey = this.mapConfig.map.addInteraction(draw)
        draw.once('drawend', (e) => {  
            let featurejson = new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(e.feature)
            
            this.sqlService.addRecord(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson))
                .subscribe((data) => {
                    console.log(data)
                    e.feature.setId(data[0].id)
                    e.feature.setProperties(data[0])
                    this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder-1].addFeature(e.feature)
                    this.getFeatureList()
                })
            this.mapConfig.map.removeLayer(vector)
            this.mapConfig.map.changed()
            ol.Observable.unByKey(this.modkey)
            this.mapConfig.map.removeInteraction(draw)
            
        })
    }
    private delete(mapconfig: MapConfig, featurety: any) {
        this.mapConfig.selectedFeatures.forEach((feat) => {
            mapconfig.sources[mapconfig.currentLayer.loadOrder-1].removeFeature(feat)
            this.sqlService.Delete(mapconfig.currentLayer.layer.ID, feat.getId())
                .subscribe((data) => {
                    if (this.modkey) {
                        ol.Observable.unByKey(this.modkey) //removes the previous modify even if there was one.
                    }
                    this.mapConfig.map.removeInteraction(this.modify)
                    this.modify = null
                })
            this.myCubeService.clearMyCubeData()
        })
        this.getFeatureList()
    }

    private getFeatureList(): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            this.getOID()
            .then(() => {
                this.sqlService
                    .getColumnCount(this.mapConfig.currentLayer.layerID)
                    .subscribe((result) => {
                        let bodyjson: JSON = JSON.parse(result._body)
                        let count: number = bodyjson[0][0].count
                        for (let i = 2; i <= count; i++) {
                            this.sqlService
                                .getIsLabel(this.oid, i)
                                .subscribe((result) => {
                                    let labeljson: JSON = JSON.parse(result._body)
                                    let labelName: string = labeljson[0][0].col_description
                                    if (labelName != null) {
                                        if (labelName.length > 0)
                                            //console.log("existing list length " + this.featurelist.length)
                                            //console.log("new list length " + this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder-1].getFeatures().length)                        
                                            //this.featurelist = this.featurelist.slice(0,this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder-1].length-1)
                                            this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder - 1].forEachFeature((x: ol.Feature) => {
                                                let i = this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder - 1].getFeatures().findIndex((j) => j == x)
                                                let fl = new featureList
                                                fl.label = x.get(labelName)
                                                fl.feature = x
                                                if (i > -1) {
                                                    this.featurelist[i] = fl
                                                }
                                                else { this.featurelist.push(fl) }
                                            }) 
                                    }
                                    this.featurelist.sort((a, b): number => {
                                        if (a.label > b.label) { return 1 }
                                        if (a.label < b.label) { return -1 }
                                        return 0
                                    })
                                })
                        }
                    })
            })
        })
        return promise
    }

    private getOID(): Promise<any> {
        let promise = new Promise((resolve, reject) => {
        this.sqlService
        .getOID(this.mapConfig.currentLayer.layerID)
        .subscribe((result) => {
            let body:string = result._body
            //body.split('"attrelid":')[1]
            let bodyjson:JSON = JSON.parse(result._body)
            this.oid = bodyjson[0][0].attrelid
            resolve()
        })
    })
    return promise
}
    private zoomToFeature(featurelist: featureList): void {
        this.clearFeature(this.mapConfig.currentLayer)
        let ext = featurelist.feature.getGeometry().getExtent();
        let center = ol.extent.getCenter(ext);
        this.mapConfig.view.fit(featurelist.feature.getGeometry().getExtent(), {
            duration: 1000,
            maxZoom: 18
        })
        this.mapConfig.selectedFeature = featurelist.feature
        this.selectFeature(this.mapConfig.currentLayer)
    }

    private zoomExtents(): void {
        console.log("zoomExtents")

        this.mapConfig.view.animate({zoom:13, center:ol.proj.transform([-86.1336, 40.4864], 'EPSG:4326', 'EPSG:3857')})
    }

    private toggleBasemap() {
        let aerial = new ol.source.BingMaps({
            key: 'AqG6nmU6MBeqJnfsjQ-285hA5Iw5wgEp3krxwvP9ZpE3-nwYqO050K5SJ8D7CkAw',
            imagerySet: 'AerialWithLabels',
            maxZoom: 19
          })
        let base = new ol.source.OSM()
        if (this.base == 'base') {
            this.base = 'aerial'
            this.mapConfig.layers[0].setSource(aerial)}
        else {
            this.base = 'base'
            this.mapConfig.layers[0].setSource(base)
        }
        //this.mapConfig.sources.push(new ol.source.BingMaps())
        //this.mapConfig.layers.push(osm_layer)
        //this.mapConfig.map.addLayer(osm_layer)
        
        }
    
    // public refreshLayers() {
    //      this.mapConfig.sources.forEach((x: ol.source.Vector) => {
    //          x.refresh()
    //      })
    // }
}

 
