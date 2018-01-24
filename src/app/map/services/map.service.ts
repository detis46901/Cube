import { Injectable } from "@angular/core";
import { MapConfig, mapStyles } from '../models/map.model'
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { LayerPermission, LayerAdmin, UserPageLayer, MyCubeField, MyCubeConfig } from '../../../_models/layer.model';
import { LayerPermissionService } from '../../../_services/_layerPermission.service';
import { geoJSONService } from './../services/geoJSON.service'
import { MyCubeService } from './../services/mycube.service'
import { WFSService } from './../services/wfs.service';
import { SQLService } from './../../../_services/sql.service'
import { MessageService } from '../../../_services/message.service'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class MapService {
    public map: L.Map; //needs to be removed once marker and pmmarker are removed.
    private userID: number;
    public noLayers: boolean;
    private shown: boolean = false
    public mapConfig: MapConfig;
    public vectorlayer= new ol.layer.Vector();
    public evkey: any;
    public modkey: any;
    public modify: ol.interaction.Modify;
    public selectedLayer: any
    public editmode: boolean = false

    constructor(
        private userPageLayerService: UserPageLayerService,
        private layerPermissionService: LayerPermissionService,
        private geojsonservice: geoJSONService,
        private myCubeService: MyCubeService,
        private wfsService: WFSService,
        private messageService: MessageService,
        private sqlService: SQLService,
        private mapstyles: mapStyles
         ) { }

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
            this.layerPermissionService
                .GetByUser(this.userID)
                .subscribe((data: LayerPermission[]) => {
                    this.mapConfig.layerpermission = data
                    resolve()
                })
        })
        return promise
    }

    //loadLayers will load during map init and load the layers that should come on by themselves with the "layerON" property set (in userPageLayers)
    public loadLayers(mapConfig: MapConfig, init: boolean): Promise<any> {
        if (this.evkey) { ol.Observable.unByKey(this.evkey)}  //removes the previous click event if there was one.
        if (this.modkey) { ol.Observable.unByKey(this.modkey)} //removes the previous modify even if there was one.
        this.myCubeService.clearMyCubeData()
        this.messageService.clearMessage()
        let promise = new Promise((resolve, reject) => {
            for (let i = 0; i < this.mapConfig.userpagelayers.length; i++) {
                if (this.mapConfig.userpagelayers[i].layer_admin.layerType == "MyCube") {
                    this.mapConfig.userpagelayers[i].layerShown = this.mapConfig.userpagelayers[i].layerON
                    this.loadMyCube(init,this.mapConfig.userpagelayers[i])  
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
        if (mapConfig.userpagelayers[index].layerShown === true) {
            mapConfig.layers[loadOrder - 1].setVisible(false)
            mapConfig.userpagelayers[index].layerShown = false
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
        this.geojsonservice.GetAll(layer.layer_admin.ID)
            .subscribe((data: GeoJSON.Feature<any>) => {
                let source = new ol.source.Vector({ features: (new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })).readFeatures(data[0][0]['jsonb_build_object']) })
                this.vectorlayer = new ol.layer.Vector({ source: source, style: this.mapstyles.load})
                this.vectorlayer.setVisible(layer.layerON)
                this.mapConfig.map.addLayer(this.vectorlayer)
                this.mapConfig.layers.push(this.vectorlayer)
                this.mapConfig.sources.push(source)
                this.mapConfig.userpagelayers[index].loadOrder = this.mapConfig.layers.length
                if (init == false) {
                    this.mapConfig.map.addLayer(this.vectorlayer)
                }
            })
    }

    private formLayerRequest(layer: UserPageLayer): string {
      switch (layer.layer_admin.layerType) {
            case ('MapServer'): {
                let norest: string = layer.layer_admin.server.serverURL.split('/rest/')[0] + '/' + layer.layer_admin.server.serverURL.split('/rest/')[1];
                let url: string = norest + '/' + layer.layer_admin.layerService + '/MapServer/WMSServer';
                //console.log(url);
                return url;
            }
            case ('Geoserver'): {
                let url: string = layer.layer_admin.server.serverURL
                return url;
            }
        }
    }

    private setCurrentLayer(layer: UserPageLayer, mapconfig: MapConfig): void {
        this.mapConfig = mapconfig
        this.mapConfig.currentLayer = layer
        this.myCubeService.clearMyCubeData() //cleans the selected myCube data off the screen
        if (this.mapConfig.selectedFeature) {this.mapConfig.selectedFeature.setStyle(null)}  //fixes a selected feature's style
        this.mapConfig.currentLayerName = layer.layer_admin.layerName  //Puts the current name in the component
        this.mapConfig.userpagelayers.forEach(element => {
            if (element.layer_admin.layerType == "MyCube") {
                this.mapConfig.layers[element.loadOrder-1].setStyle(this.mapstyles.load) //resets all the feature styles to "load"
            }
        });
        let index = this.mapConfig.userpagelayers.findIndex(x => x == layer)
        for (let x of this.mapConfig.userpagelayers) {
            if (x == layer) {
                if (x.layerShown === true && x.layer_admin.layerType == "MyCube") {
                    this.setCurrentMyCube(layer)
                }
                if (x.layerShown === true && x.layer_admin.layerType != "MyCube") {
                    switch (x.layer_admin.layerType) {
                        case ("MyCube"): { this.shown = true; break }
                        default: { this.shown = false }
                    }
                    if (this.evkey) { ol.Observable.unByKey(this.evkey); console.log(this.evkey + " is unned in setCurrentLayer")}
                    if (this.modkey) { ol.Observable.unByKey(this.modkey)} //removes the previous modify even if there was one.
                    this.evkey = this.createClick(layer, index)
                    this.mapConfig.currentLayerName = x.layer_admin.layerName;
                    //this.getServer(layer.layer_admin.serverID);
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
        this.shown = true
        this.mapConfig.map.removeInteraction(this.modify)
        this.mapConfig.map.getInteractions().forEach((e) => {console.log(e.getProperties())})
        if (this.evkey) { ol.Observable.unByKey(this.evkey), console.log(this.evkey + " is unned in setCurrentMyCube.")}
        if (this.modkey) { ol.Observable.unByKey(this.modkey)} //removes the previous modify even if there was one.
        this.mapConfig.layers[layer.loadOrder-1].setStyle(this.mapstyles.current)
        this.evkey = this.mapConfig.map.on('singleclick', (e) => {
            if (this.mapConfig.selectedFeature) {this.mapConfig.selectedFeature.setStyle(null)}
            var hit = false;
            this.mapConfig.map.forEachFeatureAtPixel(e.pixel, (feature: ol.Feature, selectedLayer: any) => {
                this.selectedLayer = selectedLayer
               if (selectedLayer === this.mapConfig.layers[layer.loadOrder-1]) {
                  hit = true;
                  this.mapConfig.selectedFeature = feature};
            }, {
              hitTolerance: 5
            });
            if (hit) {
              this.mapConfig.selectedFeature.setStyle(this.mapstyles.selected)
              this.editmode = true
              console.log(this.mapConfig.selectedFeature.getProperties())
              this.myCubeService.setMyCubeConfig(layer.layer_admin.ID, true); //need to fix the edit property
                this.myCubeService.sendMyCubeData(layer.layer_admin.ID, this.mapConfig.selectedFeature.getProperties().id);
                this.mapConfig.selectedFeatures.clear()
                this.mapConfig.selectedFeatures.push(this.mapConfig.selectedFeature)
                this.modify = new ol.interaction.Modify({features: this.mapConfig.selectedFeatures})
                this.mapConfig.map.addInteraction(this.modify)
                this.modkey = this.modify.on('modifyend', (e) => {
                            e.features.forEach(element => {
                                this.mapConfig.selectedFeature = element
                                let featurejson = new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature)
                                  this.geojsonservice.updateGeometry(layer.layer_admin.ID, JSON.parse(featurejson))
                                    .subscribe((data) => {console.log(data)})
                            });
                })
            } else {
                this.mapConfig.map.removeInteraction(this.modify)
                if (this.modkey) { ol.Observable.unByKey(this.modkey)} //removes the previous modify even if there was one.
                this.myCubeService.clearMyCubeData()
                this.mapConfig.layers[layer.loadOrder-1].setStyle(this.mapstyles.current)
            }
            this.mapConfig.selectedFeature.changed();
          });
    }
    private draw(mapconfig: MapConfig, featurety: any) {
        this.mapConfig = mapconfig
        if (this.modkey) { ol.Observable.unByKey(this.modkey)} //removes the previous modify even if there was one.
        this.mapConfig.map.removeInteraction(this.modify)
        let src = new ol.source.Vector()
        let vector = new ol.layer.Vector({
            source: src,
            style: this.mapstyles.selected
          });

        let draw = new ol.interaction.Draw(
            {type: featurety,
            source: src,
            }
        )
        this.mapConfig.map.addLayer(vector)
        this.modkey = this.mapConfig.map.addInteraction(draw)
        draw.once('drawend', (e) => {
            console.log(this.mapConfig.currentLayer.layer_admin.ID)   
            let featurejson = new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(e.feature)
            
            this.sqlService.addRecord(this.mapConfig.currentLayer.layer_admin.ID, JSON.parse(featurejson))
                .subscribe((data) => {
                    console.log(data[0].id)
                    e.feature.setId(data[0].id)
                    e.feature.setProperties(data[0])
                    console.log(e.feature.getProperties())
                    this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder-1].addFeature(e.feature)})
                
            this.mapConfig.map.removeLayer(vector)
            this.mapConfig.map.changed()
            ol.Observable.unByKey(this.modkey)
            this.mapConfig.map.removeInteraction(draw)
            
        })
    }
    private delete(mapconfig: MapConfig, featurety: any) {
        console.log("delete")
        this.mapConfig.selectedFeatures.forEach((feat) => {
            //console.log(feat.getId().toString)
            mapconfig.sources[mapconfig.currentLayer.loadOrder-1].removeFeature(feat)
            console.log(feat.getId())
            this.sqlService.Delete(mapconfig.currentLayer.layer_admin.ID, feat.getId())
                .subscribe((data) => {
                    console.log(data)
                    if (this.modkey) { ol.Observable.unByKey(this.modkey)} //removes the previous modify even if there was one.
                })
            this.myCubeService.clearMyCubeData()
        })
    }
    private cleanInteractions() {
        this.mapConfig.map.getInteractions().forEach((int) => {
            console.log(int.getKeys())
            this.mapConfig.map.removeInteraction(int)
        })
    }
}

