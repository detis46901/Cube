import { Injectable } from "@angular/core";
import { MapConfig, mapStyles, featureList } from '../models/map.model';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { UserPageInstanceService } from '../../../_services/_userPageInstance.service'
import { LayerPermission, Layer, UserPageLayer, MyCubeField, MyCubeConfig, MyCubeComment } from '../../../_models/layer.model';
import { UserPageInstance, ModulePermission } from '../../../_models/module.model'
import { LayerPermissionService } from '../../../_services/_layerPermission.service';
import { ModulePermissionService } from '../../../_services/_modulePermission.service'
import { geoJSONService } from './../services/geoJSON.service';
import { MyCubeService } from './../services/mycube.service';
import { WMSService } from './wms.service';
import { SQLService } from './../../../_services/sql.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { StyleService } from '../services/style.service'
import { FeatureModulesService } from "app/feature-modules/feature-modules.service";
import * as ol from 'openlayers';
import { environment } from 'environments/environment'

@Injectable()
export class MapService {
    public modifyingobject: boolean = false
    public shown: boolean
    public mapConfig: MapConfig;
    public vectorlayer = new ol.layer.Vector();
    public modkey: any;
    public modkeystart: any;
    public modify: ol.interaction.Modify;
    public selectedLayer: any;
    public editmode: boolean = false;
    //public featurelist = new Array<featureList>();
    public base: string = 'base';  //base layer
    private drawMode: boolean = false;
    private drawInteraction: any;
    public userID: number

    constructor(
        private userPageLayerService: UserPageLayerService,
        private userPageInstanceService: UserPageInstanceService,
        private layerPermissionService: LayerPermissionService,
        private modulePermissionService: ModulePermissionService,
        private geojsonservice: geoJSONService,
        private myCubeService: MyCubeService,
        private wmsService: WMSService,
        private sqlService: SQLService,
        private mapstyles: mapStyles,
        private styleService: StyleService,
        private featuremodulesservice: FeatureModulesService
    ) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
    }

    public initMap(mapConfig: MapConfig): Promise<any> {
        this.mapConfig = mapConfig;
        //sets the base layer
        this.mapConfig.layers = [];
        let osm_layer: any = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        osm_layer.setVisible(true);
        this.mapConfig.sources.push(new ol.source.OSM());
        this.mapConfig.layers.push(osm_layer);
        //continues the initialization
        let promise = new Promise((resolve) => {
            this.getUserPageLayers(this.mapConfig)  //only sending an argument because I have to.
                .then(() => this.getUserPageInstances(this.mapConfig))
                .then(() => this.getLayerPerms())
                .then(() => this.getModulePerms())
                .then(() => this.loadLayers(this.mapConfig, true).then(() => {
                    this.mapConfig.view = new ol.View({
                        projection: 'EPSG:3857',
                        center: ol.proj.transform([environment.centerLong, environment.centerLat], 'EPSG:4326', 'EPSG:3857'),
                        zoom: environment.centerZoom,
                        enableRotation: false
                    })
                    this.mapConfig.map = new ol.Map({
                        layers: this.mapConfig.layers,
                        view: this.mapConfig.view,
                        controls: ol.control.defaults({
                            attribution: false,
                            zoom: null
                        })
                    });
                    resolve(this.mapConfig);
                })
                )
        })
        return promise;
    }

    public getUserPageLayers(mapConfig): Promise<any> {
        this.mapConfig = mapConfig; //only necessary on changed page
        let promise = new Promise((resolve, reject) => {
            this.userPageLayerService
                .GetPageLayers(this.mapConfig.currentpage.ID)
                .subscribe((data: UserPageLayer[]) => {
                    this.mapConfig.userpagelayers = data;
                    if (data.length == 0) {
                        this.mapConfig.currentLayer = new UserPageLayer;
                        this.mapConfig.currentLayerName = "";
                    }
                    resolve();
                });
        })
        return promise;
    }

    public getUserPageInstances(mapConfig): Promise<any> {
        this.mapConfig = mapConfig; //only necessary on changed page
        let promise = new Promise((resolve, reject) => {
            this.userPageInstanceService
                .GetPageInstances(this.mapConfig.currentpage.ID)
                .subscribe((data: UserPageInstance[]) => {
                    this.mapConfig.userpageinstances = data;
                    if (data.length == 0) {
                    }
                    resolve();
                });
        })
        return promise;
    }

    public getLayerPerms(): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            this.layerPermissionService
                .GetByUserGroups(this.mapConfig.userID)
                .subscribe((data: LayerPermission[]) => {
                    this.mapConfig.layerpermission = data;
                    this.mapConfig.userpagelayers.forEach((userpagelayer) => {
                        let j = this.mapConfig.layerpermission.findIndex((x) => x.layerID == userpagelayer.layerID);
                        if (j >= 0) {
                            userpagelayer.layerPermissions = this.mapConfig.layerpermission[j];
                            //need to make sure the maximum permissions get provided.  probably need to use foreach instead of findIndex  It uses the first one instead of the most liberal.
                        }
                        else {
                            //if there isn't an entry for the layer, it allows the viewing, but not anything else.  This is necessary because I'm not adding permissions to layers required by a module.
                            //The module should define the layer permissions
                            userpagelayer.layerPermissions = new LayerPermission
                            userpagelayer.layerPermissions.edit = false
                        }
                    })
                    resolve();
                })
        })
        return promise;
    }

    public getModulePerms(): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            this.modulePermissionService
                .GetByUserGroups(this.mapConfig.userID)
                .subscribe((data: ModulePermission[]) => {
                    this.mapConfig.modulepermission = data;
                    this.mapConfig.userpagelayers.forEach((userpagelayer) => {
                        let j = this.mapConfig.modulepermission.findIndex((x) => x.moduleInstanceID == userpagelayer.userPageInstanceID);
                        if (j >= 0) {
                            userpagelayer.modulePermissions = this.mapConfig.modulepermission[j];
                            //need to make sure the maximum permissions get provided.  probably need to use foreach instead of findIndex  It uses the first one instead of the most liberal.
                        }
                    })
                    resolve();
                })
        })
        return promise;
    }

    //loadLayers will load during map init and load the layers that should come on by themselves with the "defaultON" property set (in userPageLayers)
    public loadLayers(mapConfig: MapConfig, init: boolean): Promise<any> {
        let j = 0;
        if (mapConfig.evkey) { //removes the previous click event if there wasn't one.
            ol.Observable.unByKey(mapConfig.evkey);
        }
        if (this.modkey) { //removes the previous modify even if there wasn't one.
            ol.Observable.unByKey(this.modkey);
        }
        let promise = new Promise((resolve, reject) => {
            this.mapConfig.userpagelayers.forEach(userpagelayer => {
                userpagelayer.layerShown = userpagelayer.defaultON;
                //this if is for layers that are connected to modules
                if (userpagelayer.userPageInstanceID > 0) {
                    if (this.featuremodulesservice.loadLayer(this.mapConfig, userpagelayer)) {
                        j++
                        if (j == this.mapConfig.userpagelayers.length) {
                            resolve();
                        }
                    }
                }
                else {
                    switch (userpagelayer.layer.layerType) {
                        case "MyCube": {
                            this.loadMyCube(userpagelayer);
                            j++;
                            if (j == this.mapConfig.userpagelayers.length) {
                                resolve();
                            }
                            break;
                        }
                        case "WMTS": {
                            this.wmsService.getCapabilities(userpagelayer.layer.server.serverURL)
                                .subscribe((data) => {
                                    let parser = new ol.format.WMTSCapabilities();
                                    let result = parser.read(data);
                                    let options = ol.source.WMTS.optionsFromCapabilities(result, {
                                        layer: userpagelayer.layer.layerIdent,
                                        matrixSet: 'EPSG:3857'
                                    });
                                    let wmsSource = new ol.source.WMTS(options);
                                    let wmsLayer = new ol.layer.Tile({
                                        opacity: 1,
                                        source: new ol.source.WMTS(options)
                                    });
                                    wmsLayer.setVisible(userpagelayer.defaultON);
                                    userpagelayer.olLayer = wmsLayer
                                    userpagelayer.source = wmsSource
                                    this.wmsService.setLoadStatus(userpagelayer);
                                    if (init == false) {
                                        mapConfig.map.addLayer(wmsLayer);
                                    }
                                    j++;
                                    if (j == this.mapConfig.userpagelayers.length) {
                                        resolve();
                                    }
                                })
                            break;
                        }
                        default: {  //this is the WMS load
                            let wmsSource = new ol.source.TileWMS({
                                url: this.wmsService.formLayerRequest(userpagelayer),
                                params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
                                projection: 'EPSG:4326',
                                serverType: 'geoserver',
                                crossOrigin: 'anonymous'
                            });
                            let wmsLayer = new ol.layer.Tile({
                                source: wmsSource
                            });
                            wmsLayer.setVisible(userpagelayer.defaultON);
                            if (init) {
                                this.mapConfig.layers.push(wmsLayer);  //to delete
                            }
                            userpagelayer.olLayer = wmsLayer
                            userpagelayer.source = wmsSource
                            this.wmsService.setLoadStatus(userpagelayer);
                            if (init == false) { //necessary during initialization only, as the map requires the layers in an array to start with.
                                mapConfig.map.addLayer(wmsLayer);
                            }
                            j++;
                            if (j == this.mapConfig.userpagelayers.length) {
                                resolve();
                            }
                        }
                    }
                }
            }
            )
        })
        return promise;
    }

    public loadMyCube(layer: UserPageLayer) {
        let stylefunction = ((feature) => {
            return (this.styleService.styleFunction(feature, layer, "load"));
        })
        let source = new ol.source.Vector({
            format: new ol.format.GeoJSON()
        })

        this.styleService.setDefaultStyleandFilter(layer)

        layer.updateInterval = setInterval(() => {
            this.runInterval(layer);
        }, 20000);

        this.getMyCubeData(layer).then((data) => {
            if (data[0][0]['jsonb_build_object']['features']) {
                source.addFeatures(new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
            }
            this.vectorlayer = new ol.layer.Vector({ source: source, style: stylefunction });
            this.vectorlayer.setVisible(layer.defaultON);
            this.mapConfig.map.addLayer(this.vectorlayer);
            layer.olLayer = this.vectorlayer
            layer.source = source
        })
    }

    //Reads index of layer in dropdown, layer, and if it is shown or not. Needs to remove a layer if a new one is selected
    public toggleLayers(layer: UserPageLayer): void {
        if (layer.olLayer) {layer.olLayer.setVisible(!layer.layerShown)}
        layer.layerShown = !layer.layerShown;   
        if (layer.layerShown === false) {
            if (layer.userPageInstanceID > 0) {
                this.featuremodulesservice.unloadLayer(this.mapConfig, layer)
            }
            if (this.mapConfig.currentLayer == layer) {
                this.mapConfig.currentLayer = new UserPageLayer;
                this.mapConfig.currentLayerName = "";
                this.clearFeature()
                if (layer.userPageInstanceID > 0) {
                    this.featuremodulesservice.unsetCurrentLayer(this.mapConfig, layer)
                }
            }
            //could add something here that would move to the next layerShown=true.  Not sure.
            this.mapConfig.editmode = this.mapConfig.currentLayer.layerPermissions.edit
        }
        else {
            this.setCurrentLayer(layer);
        }
    }

    public runInterval(layer: UserPageLayer) {
        let stylefunction = ((feature, resolution) => {
            if (this.mapConfig.currentLayer == layer) {
                return (this.styleService.styleFunction(feature, layer, "current"));
            }
            else {
                return (this.styleService.styleFunction(feature, layer, "load"));
            }
        })
        this.getMyCubeData(layer).then((data) => {
            if (data[0]) {
                if (data[0][0]['jsonb_build_object']['features']) {
                    //clearInterval(this.interval)
                    //need to put something in here so that when an object is being edited, it doesn't update...
                    //might just be that the layer doesn't update unless something has changed.
                    layer.source.clear();
                    layer.source.addFeatures(new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
                    let index = this.mapConfig.userpagelayers.findIndex(x => x == layer);
                    //this.mapConfig.layers[index].setStyle(stylefunction) 
                    layer.source.forEachFeature(feat => {
                        feat.setStyle(stylefunction);
                    })
                    //this.filterFunction(layer, source)
                    if (this.mapConfig.currentLayer == layer) {
                        this.getFeatureList();
                        if (this.mapConfig.selectedFeature) {
                            this.mapConfig.selectedFeature = layer.source.getFeatureById(this.mapConfig.selectedFeature.getId());
                            if (this.mapConfig.selectedFeature) {
                                this.selectFeature(layer, true)
                            } //need to make sure the feature still exists
                            //source.getFeatureById(this.mapConfig.selectedFeature.getId()).setStyle(this.mapstyles.selected)
                            //this.mapConfig.selectedFeature.setStyle(this.mapstyles.selected)
                        }
                    }
                    //may need to add something in here that compares new data to old data and makes sure the selected feature remains selected.
                }
            }
        })
    }

    private getMyCubeData(layer): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            this.geojsonservice.GetAll(layer.layer.ID)
                .subscribe((data: GeoJSON.Feature<any>) => {
                    resolve(data);
                })
        })
        return promise;
    }

    public setCurrentLayer(layer: UserPageLayer): void {
        this.clearLayerConfig();
        this.mapConfig.currentLayer = layer;
        this.mapConfig.currentLayerName = layer.layer.layerName  //Puts the current name in the component
        if (layer.userPageInstanceID > 0) {
            if (this.featuremodulesservice.setCurrentLayer(this.mapConfig, layer)) {
                this.mapConfig.featureList = [];
                if (!this.featuremodulesservice.getFeatureList(this.mapConfig, layer)) {
                    this.getFeatureList();
                }
                if (layer.layer.layerType == "MyCube") {this.createMyCubeClickEvent(layer)}
                return
            }
        }       
        if (layer.layerShown === true && layer.layer.layerType == "MyCube") {
            this.setCurrentMyCube(layer)
        }
        if (layer.layerShown === true && layer.layer.layerType != "MyCube") {
            this.createClick(layer);
        }
    }

    private setCurrentMyCube(layer: UserPageLayer) {
        let stylefunction = ((feature) => {
            return (this.styleService.styleFunction(feature, layer, "current"));
        })

        try {
            if (layer.style.filter.column) {
                this.mapConfig.filterOn = true;
            }
            else {
                this.mapConfig.filterOn = false;
            }
        }
        catch (e) {
        }
        this.mapConfig.editmode = layer.layerPermissions.edit;
        this.mapConfig.featureList = [];

        layer.olLayer.setStyle(stylefunction);
        this.getFeatureList();
        this.createMyCubeClickEvent(layer);

        this.myCubeService.prebuildMyCube(layer); //This needs a lot of work
    }

    private createMyCubeClickEvent(layer: UserPageLayer) {
        this.mapConfig.evkey = this.mapConfig.map.on('click', (e:any) => {
            if (this.mapConfig.selectedFeature) {
                if (layer.userPageInstanceID > 0 ) {
                    if (!this.featuremodulesservice.unstyleSelectedFeature(this.mapConfig, layer)) {
                        this.mapConfig.selectedFeature.setStyle(null);
                    }
                }
                else {this.mapConfig.selectedFeature.setStyle(null);}
               
            }
            var hit = false;
            this.mapConfig.map.forEachFeatureAtPixel(e.pixel, (feature: ol.Feature, selectedLayer: any) => {
                this.selectedLayer = selectedLayer;
                if (selectedLayer === layer.olLayer) {
                    hit = true;
                    this.mapConfig.selectedFeature = feature;
                }
                ;
            }, {
                    hitTolerance: 5
                });
            if (hit) {
                this.selectFeature(layer);
            }
            else {
                this.clearFeature();
            }
        });
    }

    private clearLayerConfig(): void {
        this.mapConfig.filterOn = false;
        this.mapConfig.filterShow = false;
        this.mapConfig.styleShow = false;
        this.mapConfig.editmode = false;
        this.mapConfig.map.removeInteraction(this.modify);
        this.modify = null;
        this.clearFeature();
        if (this.mapConfig.selectedFeature) {
            this.mapConfig.selectedFeature.setStyle(null);
        }
        if (this.mapConfig.evkey) {
            ol.Observable.unByKey(this.mapConfig.evkey);
        }
        if (this.modkey) {
            ol.Observable.unByKey(this.modkey); //removes the previous modify even if there was one.
        }
        this.mapConfig.userpagelayers.forEach(layer => {
            if (layer.userPageInstanceID > 0) {
                if (this.featuremodulesservice.unsetCurrentLayer(this.mapConfig, layer)) {
                    return
                }
            }
            if (layer.layer.layerType == "MyCube") {
                let stylefunction = ((feature) => {
                    return (this.styleService.styleFunction(feature, layer, "load"));
                })
                layer.olLayer.setStyle(stylefunction)
            }
        });

    }

    private createClick(layer) { //this is for WMS layers
        this.mapConfig.evkey = this.mapConfig.map.on('click', (evt: any) => {
            let url2 = this.wmsService.formLayerRequest(layer);
            let wmsSource = new ol.source.ImageWMS({
                url: url2,
                params: { 'LAYERS': layer.layer.layerIdent },
                projection: 'EPSG:4326',
                serverType: 'geoserver',
                crossOrigin: 'anonymous'
            });
            let viewResolution = this.mapConfig.map.getView().getResolution();
            let url = wmsSource.getGetFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:3857',
                { 'INFO_FORMAT': 'text/html' });
            if (url) {
                this.wmsService.getfeatureinfo(url, false)
                    .subscribe((data: any) => {
                        this.myCubeService.parseAndSendWMS(data);
                    });
            }
        });
    }

    private selectFeature(layer: UserPageLayer, refresh: boolean = false): void {
        if (layer.userPageInstanceID > 0) {
            if (this.featuremodulesservice.selectFeature(this.mapConfig, layer)) {
                return
            }
            if (this.featuremodulesservice.styleSelectedFeature(this.mapConfig, layer)) {
            }
            else {
                this.mapConfig.selectedFeature.setStyle(this.mapstyles.selected);
            }
        }
        else {
            this.mapConfig.selectedFeature.setStyle(this.mapstyles.selected);
        }
       
        if (refresh == false) {
            this.mapConfig.myCubeConfig = this.myCubeService.setMyCubeConfig(layer.layer.ID, layer.layerPermissions.edit);
            this.myCubeService.getAndSendMyCubeData(layer.layer.ID, this.mapConfig.selectedFeature).then(data => {
                this.mapConfig.myCubeData = data
                this.mapConfig.featureDataShow = true;
            })
        }
        this.mapConfig.selectedFeatures.clear();
        this.mapConfig.selectedFeatures.push(this.mapConfig.selectedFeature);
        if (layer.layerPermissions.edit == true) {
            if (!this.modify) {
                this.modify = new ol.interaction.Modify({ features: this.mapConfig.selectedFeatures });
                this.mapConfig.map.addInteraction(this.modify);
            }
            this.modkeystart = this.modify.on('modifystart', (e: ol.interaction.Modify.Event) => {
                this.modifyingobject = true
                clearInterval(layer.updateInterval)
            })
            this.modkey = this.modify.on('modifyend', (e: ol.interaction.Modify.Event) => {
                e.features.forEach(element => {
                    if (this.modifyingobject) {
                        this.mapConfig.selectedFeature = element;
                        let featurejson = new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature);
                        let fjson2 = JSON.parse(featurejson)
                        let featureID = fjson2['id']
                        this.geojsonservice.updateGeometry(layer.layer.ID, JSON.parse(featurejson))
                            .subscribe((data) => {
                                this.myCubeService.createAutoMyCubeComment(true, "Geometry Modified", featureID, this.mapConfig.currentLayer.layer.ID, this.userID, JSON.parse(featurejson))
                                    .then(() => {
                                        this.myCubeService.loadComments(this.mapConfig.currentLayer.layer.ID, featureID)
                                        layer.updateInterval = this.runInterval(layer)
                                    })
                            })
                        this.modifyingobject = false
                    }
                });
            })
        }
    }

    private clearFeature() {
        if (this.mapConfig.currentLayer.userPageInstanceID > 0) {
            if (this.featuremodulesservice.clearFeature(this.mapConfig, this.mapConfig.currentLayer)) {return}
        }
        if (this.mapConfig.selectedFeature) {
            this.mapConfig.selectedFeature.setStyle(null);
            this.mapConfig.selectedFeature = null;
        }
        this.mapConfig.map.removeInteraction(this.modify);
        this.modify = null;
        if (this.modkey) {
            ol.Observable.unByKey(this.modkey); //removes the previous modify even if there was one.
        }
        this.myCubeService.clearMyCubeData();
    }

    public draw(featuretype: any) {
        let featureID: number
        this.clearFeature()
        if (this.drawMode == true) {
            this.drawMode = false
            this.mapConfig.drawMode = ""
            ol.Observable.unByKey(this.modkey);
            this.mapConfig.map.removeInteraction(this.drawInteraction);
        }
        else {
            this.drawMode = true
            let src = new ol.source.Vector();
            let vector = new ol.layer.Vector({
                source: src,
                style: this.mapstyles.selected
            });
            this.drawInteraction = new ol.interaction.Draw({
                type: featuretype,
                source: src,
            })
            this.mapConfig.map.addLayer(vector);
            this.modkey = this.mapConfig.map.addInteraction(this.drawInteraction);
            this.drawInteraction.once('drawend', (e) => {
                let featurejson = new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(e.feature);
                this.sqlService.addRecord(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson))
                    .subscribe((data) => {
                        try { featureID = data[0][0].id }
                        catch (e) {
                            this.sqlService.fixGeometry(this.mapConfig.currentLayer.layer.ID)
                                .subscribe(() => {
                                })
                        }
                        e.feature.setId(featureID);
                        e.feature.setProperties(data[0]);
                        this.mapConfig.currentLayer.source.addFeature(e.feature)
                        this.getFeatureList();
                        this.myCubeService.createAutoMyCubeComment(true, "Object Created", featureID, this.mapConfig.currentLayer.layer.ID, this.userID, featurejson['geometry'])
                    })
                this.mapConfig.map.removeLayer(vector);
                this.mapConfig.map.changed();
                ol.Observable.unByKey(this.modkey);
                this.mapConfig.map.removeInteraction(this.drawInteraction);
                this.mapConfig.drawMode = ""
                this.drawMode = false
            })
        }
    }

    public delete(mapconfig: MapConfig) {
        this.mapConfig.selectedFeatures.forEach((feat) => {
            mapconfig.currentLayer.source.removeFeature(feat)
            this.sqlService.Delete(mapconfig.currentLayer.layer.ID, feat.getId())
                .subscribe((data) => {
                    if (this.modkey) {
                        ol.Observable.unByKey(this.modkey); //removes the previous modify even if there was one.
                    }
                    this.mapConfig.map.removeInteraction(this.modify);
                    this.modify = null;
                    this.myCubeService.createAutoMyCubeComment(true, "Object Deleted", feat.getId(), mapconfig.currentLayer.layer.ID, this.userID)
                })
            this.myCubeService.clearMyCubeData();
        })
        this.getFeatureList();
        this.mapConfig.selectedFeature = null
    }

    private getFeatureList() {
        let k: number = 0;
        let tempList = new Array<featureList>();
        try {
            let labelName: string = this.mapConfig.currentLayer.layer.defaultStyle.listLabel;
            if (this.mapConfig.currentLayer.style.listLabel != null) {
                labelName = this.mapConfig.currentLayer.style.listLabel;
            }
            if (labelName != null && labelName.length != 0) {
                this.mapConfig.currentLayer.source.forEachFeature((x: ol.Feature) => {
                    let i = this.mapConfig.currentLayer.source.getFeatures().findIndex((j) => j == x);
                    let fl = new featureList;
                    if (this.styleService.filterFunction(x, this.mapConfig.currentLayer)) {
                        fl.label = x.get(labelName);
                        fl.feature = x;
                        if (i > -1 && fl != null) {
                            tempList.push(fl);
                            k += 1;
                        }
                    }
                    this.mapConfig.featureList = tempList.slice(0, k);
                })
            }
            this.mapConfig.featureList.sort((a, b): number => {
                if (a.label > b.label) {
                    return 1;
                }
                if (a.label < b.label) {
                    return -1;
                }
                return 0;
            })
        } catch (error) {
            console.error(error);
            clearInterval(this.mapConfig.currentLayer.updateInterval);
        }
    }

    public zoomToFeature(featurelist: featureList): void {
        this.clearFeature();
        this.mapConfig.view.fit(featurelist.feature.getGeometry().getExtent(), {
            duration: 1000,
            maxZoom: 18
        })
        this.mapConfig.selectedFeature = featurelist.feature;
        this.selectFeature(this.mapConfig.currentLayer);
    }

    //required (called from html)
    public zoomExtents(): void {
        this.mapConfig.view.animate({ zoom: environment.centerZoom, center: ol.proj.transform([environment.centerLong, environment.centerLat], 'EPSG:4326', 'EPSG:3857') })

    }

    public zoomToLayer() {
        //this needs to be fed the layer and work with it instead of the featurelist.
        let collection = new ol.geom.GeometryCollection
        let feats = new Array<ol.geom.Geometry>()
        for (let i of this.mapConfig.featureList) {
            feats.push(i.feature.getGeometry())

        }
        collection.setGeometries(feats)
        this.mapConfig.view.fit(collection.getExtent(), {
            duration: 1000,
            maxZoom: 18
        })
    }

    //required (called from html)
    public toggleBasemap() {
        let aerial = new ol.source.BingMaps({
            key: environment.BingMapsKey,
            imagerySet: 'AerialWithLabels',
            maxZoom: 19
        })
        let base = new ol.source.OSM();
        if (this.base == 'base') {
            this.base = 'aerial';
            this.mapConfig.layers[0].setSource(aerial);
        }
        else {
            this.base = 'base';
            this.mapConfig.layers[0].setSource(base);
        }
    }

    public stopInterval() {
        this.mapConfig.userpagelayers.forEach((UPL) => {
            clearInterval(UPL.updateInterval)
        })
    }

    public isolate(layer: UserPageLayer) {
        this.mapConfig.userpagelayers.forEach((x) => {
            if (x.ID != layer.ID) {
                x.olLayer.setVisible(false)
                x.layerShown = false;
            }
        })
    }

    public toggleDefaultON(layer: UserPageLayer) {
        layer.defaultON = !layer.defaultON
        let templayer = new UserPageLayer
        templayer.ID = layer.ID
        templayer.defaultON = layer.defaultON
        this.userPageLayerService
            .Update(templayer)
            .subscribe((data) => {
            })
    }
}