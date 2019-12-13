import { Injectable } from "@angular/core";
import { MapConfig, mapStyles, featureList } from '../models/map.model';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { UserPageInstanceService } from '../../../_services/_userPageInstance.service'
import { LayerPermission, UserPageLayer } from '../../../_models/layer.model';
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
import { defaults as defaultInteractions, Modify, Draw } from 'ol/interaction';
import { Vector as VectorSource } from 'ol/source';
import { environment } from 'environments/environment'
import { MatSnackBar } from '@angular/material/snack-bar';
import VectorLayer from "ol/layer/Vector";
import ImageWMS from 'ol/source/ImageWMS';
import ImageLayer from 'ol/layer/Image';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import TileWMS from 'ol/source/TileWMS';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import Observable from 'ol/Observable';
import GeometryCollection from 'ol/geom/GeometryCollection';
import Geometry from 'ol/geom/Geometry';
import { transform } from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import OSM from 'ol/source/OSM';
import BingMaps from 'ol/source/BingMaps';

@Injectable()
export class MapService {
    public modifyingobject: boolean = false
    public shown: boolean
    public mapConfig = new MapConfig;
    public vectorlayer = new VectorLayer();
    public modkey: any;
    public modkeystart: any;
    public modify: Modify;
    public selectedLayer: any;
    public editmode: boolean = false;
    public base: string = 'base';  //base layer
    private drawMode: boolean = false;
    private drawInteraction: any;
    public userID: number
    public LP = new LayerPermission

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
        private featuremodulesservice: FeatureModulesService,
        private snackBar: MatSnackBar
    ) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
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
    public loadLayers(mapConfig: MapConfig, init: boolean, single?: boolean): Promise<any> {
        this.mapConfig = mapConfig
        let j = 0;
        let promise = new Promise((resolve, reject) => {
            this.mapConfig.userpagelayers.forEach(userpagelayer => {
                if (single) { //If you're adding a single layer, under the "addLayer() from the map.component"
                    j++
                    if (j < this.mapConfig.userpagelayers.length) {
                        return
                    }
                }
                userpagelayer.layerShown = userpagelayer.defaultON;
                //this if is for layers that are connected to modules
                if (!userpagelayer.olLayer) {
                    if (this.featuremodulesservice.loadLayer(this.mapConfig, userpagelayer, init)) {
                        j++
                        if (j == this.mapConfig.userpagelayers.length) {
                            resolve();
                        }
                    }
                    else {
                        switch (userpagelayer.layer.layerType) {
                            case "GeoserverMosaic": {
                                {  //testing...
                                    let wmsSource = new ImageWMS({
                                        url: this.wmsService.formLayerRequest(userpagelayer),
                                        params: {
                                            'LAYERS': userpagelayer.layer.layerIdent,
                                            'FORMAT': 'image/png',
                                            'VERSION': '1.1.1',
                                            "exceptions": 'application/vnd.ogc.se_inimage'
                                        },
                                        ratio: 1,
                                        projection: 'EPSG:2965',
                                        serverType: 'geoserver',
                                        crossOrigin: 'anonymous',
                                    });
                                    let wmsLayer = new ImageLayer({
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
                                    break
                                }
                            }
                            case "ArcGISRest": {
                                let wmsSource = new ImageArcGISRest()
                                wmsSource.setUrl(userpagelayer.layer.server.serverURL + '/' + userpagelayer.layer.layerService + '/MapServer')
                                let wmsLayer = new ImageLayer({
                                    source: wmsSource
                                })
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
                                break
                            }
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
                                        let parser = new WMTSCapabilities();
                                        let result = parser.read(data);
                                        let options = optionsFromCapabilities(result, {
                                            layer: userpagelayer.layer.layerIdent,
                                            matrixSet: 'EPSG:3857',
                                            cacheSize: environment.cacheSize
                                        });
                                        let wmtsSource = new WMTS(options);
                                        let wmtsLayer = new TileLayer({
                                            opacity: 1,
                                            source: new WMTS(options)
                                        });
                                        wmtsLayer.setVisible(userpagelayer.defaultON);
                                        if (init) {
                                            this.mapConfig.layers.push(wmtsLayer);  //to delete
                                        }
                                        userpagelayer.olLayer = wmtsLayer
                                        userpagelayer.source = wmtsSource
                                        this.wmsService.setLoadStatus(userpagelayer);
                                        if (init == false) {
                                            mapConfig.map.addLayer(wmtsLayer);
                                        }
                                        j++;
                                        if (j == this.mapConfig.userpagelayers.length) {
                                            resolve();
                                        }
                                    })
                                break;
                            }
                            default: {  //this is the WMS load
                                let wmsSource = new TileWMS({
                                    url: this.wmsService.formLayerRequest(userpagelayer),
                                    params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
                                    projection: 'EPSG:4326',
                                    serverType: 'geoserver',
                                    crossOrigin: 'anonymous',
                                    cacheSize: environment.cacheSize
                                });
                                let wmsLayer = new TileLayer({
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
            }
            )
        })
        return promise;
    }

    public loadMyCube(layer: UserPageLayer) {
        let stylefunction = ((feature) => {
            return (this.styleService.styleFunction(feature, layer, "load"));
        })
        let source = new VectorSource({
            format: new GeoJSON()
        })
        layer.updateInterval = setInterval(() => {
            this.runInterval(layer);
        }, 20000);
        this.getMyCubeData(layer).then((data) => {
            if (data[0][0]['jsonb_build_object']['features']) {
                source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
            }
            this.vectorlayer = new VectorLayer({ source: source, style: stylefunction });
            this.vectorlayer.setVisible(layer.defaultON);
            this.mapConfig.map.addLayer(this.vectorlayer);
            layer.olLayer = this.vectorlayer
            layer.source = source
        })
    }

    //Reads index of layer in dropdown, layer, and if it is shown or not. Needs to remove a layer if a new one is selected
    public toggleLayers(layer: UserPageLayer): void {
        if (layer.olLayer) { layer.olLayer.setVisible(!layer.layerShown) }
        layer.layerShown = !layer.layerShown;
        if (layer.layerShown === false) { //turning a layer off
            this.featuremodulesservice.unloadLayer(this.mapConfig, layer)
            if (this.mapConfig.currentLayer == layer) {
                this.mapConfig.currentLayer = new UserPageLayer;
                this.mapConfig.currentLayerName = "";
                this.clearFeature()
                this.featuremodulesservice.unsetCurrentLayer(this.mapConfig, layer)
            }
            //could add something here that would move to the next layerShown=true.  Not sure.
            this.mapConfig.editmode = this.mapConfig.currentLayer.layerPermissions.edit  //not sure why I need this
        }
        else {
            this.setCurrentLayer(layer);
        }
    }

    public runInterval(layer: UserPageLayer) {
        this.getMyCubeData(layer).then((data) => {
            if (data[0]) {
                if (data[0][0]['jsonb_build_object']['features']) {
                    layer.source.clear();
                    layer.source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
                    let index = this.mapConfig.userpagelayers.findIndex(x => x == layer);
                    // layer.source.forEachFeature(feat => {
                    //     feat.setStyle(stylefunction);
                    // })
                    this.setStyle(layer)
                    if (this.mapConfig.currentLayer == layer) {
                        this.getFeatureList();
                        if (this.mapConfig.selectedFeature) {
                            this.mapConfig.selectedFeature = layer.source.getFeatureById(this.mapConfig.selectedFeature.getId());
                            if (this.mapConfig.selectedFeature) {
                                this.selectMyCubeFeature(layer, true)
                            } //need to make sure the feature still exists
                        }
                    }
                    //may need to add something in here that compares new data to old data and makes sure the selected feature remains selected.
                }
            }
        })
    }

    private setStyle(layer: UserPageLayer, st?: string) {
        if (st = null) { st = 'current' }
        let stylefunction = ((feature, resolution) => {
            if (this.mapConfig.currentLayer == layer) {
                return (this.styleService.styleFunction(feature, layer, "current"));
            }
            else {
                return (this.styleService.styleFunction(feature, layer, "load"));
            }
        })
        if(layer.layer.layerType == 'MyCube') {
            //console.log(layer.layer.layerName)
            layer.olLayer.setStyle(stylefunction)}
    }

    private getMyCubeData(layer): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            this.geojsonservice.GetAll(layer.layer.ID)
                .subscribe((data: any) => { //GeoJSON.Feature<any>
                    resolve(data);
                })
        })
        return promise;
    }

    public setCurrentLayer(layer: UserPageLayer): void {
        this.clearLayerConfig();  //
        this.mapConfig.currentLayer = layer;
        this.mapConfig.currentLayerName = layer.layer.layerName  //Puts the current name in the component
        
        if (this.featuremodulesservice.setCurrentLayer(this.mapConfig, layer)) {
            this.mapConfig.featureList = [];
            if (!this.featuremodulesservice.getFeatureList(this.mapConfig, layer)) {
                this.getFeatureList();
            }
            return
        }
        else {
            this.setStyle(layer)  //This gets the styling right.
            this.getFeatureList()
        }
        if (layer.layerShown === true && layer.layer.layerType == "MyCube") {
            this.mapConfig.editmode = layer.layerPermissions.edit;
        }
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
            //this.mapConfig.selectedFeature.setStyle(null); console.log('setting selected feature style to null')
        }
        this.mapConfig.userpagelayers.forEach(layer => {
            if (this.featuremodulesservice.unsetCurrentLayer(this.mapConfig, layer)) {
                return
            }
            if (layer.layer.layerType == "MyCube") {
               this.setStyle(layer, 'load')
            }
        });
    }

    public mapClickEvent(evt) {
        if (this.mapConfig.measureShow) {return}  //disables select/deselect when the measure tool is open.
        let layer = this.mapConfig.currentLayer
        switch (this.mapConfig.currentLayer.layer.layerType) {
            case ("Geoserver"): {
                let url2 = this.wmsService.formLayerRequest(layer);
                if (layer.layer.layerType == 'WMTS') {
                    let layerroot = layer.layer.server.serverURL.split('/gwc')[0]
                    url2 = layerroot + '/wms?'
                }
                let wmsSource = new ImageWMS({
                    url: url2,
                    params: { 'FORMAT': 'image/png', 'VERSION': '1.1.1', 'LAYERS': layer.layer.layerIdent, 'exceptions': 'application/vnd.ogc.se_inimage', tilesOrigin: 179999.975178479 + "," + 1875815.463803232 },
                    projection: 'EPSG:4326',
                    serverType: 'geoserver',
                    crossOrigin: 'anonymous'
                });
                let viewResolution = this.mapConfig.map.getView().getResolution();
                wmsSource.get;
                let url = wmsSource.getFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857', { 'INFO_FORMAT': 'text/html' });
                if (url) {
                    this.wmsService.getfeatureinfo(url, false)
                        .subscribe((data: any) => {
                            this.myCubeService.parseAndSendWMS(data);
                        });
                }
                break
            }
            case ("MapServer"): {
                let url2 = this.wmsService.formLayerRequest(layer);
                if (layer.layer.layerType == 'WMTS') {
                    let layerroot = layer.layer.server.serverURL.split('/gwc')[0]
                    url2 = layerroot + '/wms?'
                }
                let wmsSource = new ImageWMS({
                    url: url2,
                    params: { 'FORMAT': 'image/png', 'VERSION': '1.1.1', 'LAYERS': layer.layer.layerIdent, 'exceptions': 'application/vnd.ogc.se_inimage', tilesOrigin: 179999.975178479 + "," + 1875815.463803232 },
                    projection: 'EPSG:4326',
                    serverType: 'geoserver',
                    crossOrigin: 'anonymous'
                });
                let viewResolution = this.mapConfig.map.getView().getResolution();
                wmsSource.get;
                let url = wmsSource.getFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857', { 'INFO_FORMAT': 'text/html' });
                if (url) {
                    this.wmsService.getfeatureinfo(url, false)
                        .subscribe((data: any) => {
                            this.myCubeService.parseAndSendWMS(data);
                        });
                }
                break
            }
            case ("MyCube"): {
//                console.log("MyCubeClick")
                if (this.mapConfig.selectedFeature) {
                    if (!this.featuremodulesservice.unstyleSelectedFeature(this.mapConfig, layer)) {
                        this.clearFeature()
                    }
                }
                var hit = false;
                this.mapConfig.map.forEachFeatureAtPixel(evt.pixel, (feature: Feature, selectedLayer: any) => {
                    //this.selectedLayer = selectedLayer;
                    if (selectedLayer === layer.olLayer) {
                        hit = true;
                        this.mapConfig.selectedFeature = feature;
                    }
                    ;
                }, {
                    hitTolerance: 5
                });
                if (hit) {
                    this.selectMyCubeFeature(layer);
                }
                else {
                    //this.clearFeature();
                }
            }
        }

    }

    private selectMyCubeFeature(layer: UserPageLayer, refresh: boolean = false): void {
        if (this.featuremodulesservice.selectFeature(this.mapConfig, layer)) {
            return
        }
        if (this.featuremodulesservice.styleSelectedFeature(this.mapConfig, layer)) {
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
                this.modify = new Modify({ features: this.mapConfig.selectedFeatures });
                this.mapConfig.map.addInteraction(this.modify);
            }
            this.modkeystart = this.modify.on('modifystart', (e: any) => {  //need to get the right type
                this.modifyingobject = true
                clearInterval(layer.updateInterval)
            })
            this.modkey = this.modify.on('modifyend', (e: any) => {  //need to get the right type
                e.features.forEach(element => {
                    if (this.modifyingobject) {
                        this.mapConfig.selectedFeature = element;
                        let featurejson = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature);
                        let fjson2 = JSON.parse(featurejson)
                        let featureID = fjson2['id']
                        this.geojsonservice.updateGeometry(layer.layer.ID, JSON.parse(featurejson))
                            .subscribe((data) => {
                                this.myCubeService.createAutoMyCubeComment(true, "Geometry Modified", featureID, this.mapConfig.currentLayer.layer.ID, this.userID, JSON.parse(featurejson))
                                    .then(() => {
                                        this.myCubeService.loadComments(this.mapConfig.currentLayer.layer.ID, featureID)
                                        if (layer.userPageInstanceID == 0) {
                                            layer.updateInterval = this.runInterval(layer)
                                        }

                                    })
                            })
                        this.modifyingobject = false
                    }
                });
            })
        }
    }

    private clearFeature() {
        //console.log(this.mapConfig.currentLayer.layer.layerName)
        let stylefunction = ((feature) => {
            return (this.styleService.styleFunction(feature, this.mapConfig.currentLayer, "current"));
        })
        if (this.featuremodulesservice.clearFeature(this.mapConfig, this.mapConfig.currentLayer)) { return }
        if (this.mapConfig.selectedFeature) {
            this.mapConfig.selectedFeature.setStyle(stylefunction);
            this.mapConfig.selectedFeature = null;  //console.log('setting selected feature to null')
        }
        else {}
        this.mapConfig.map.removeInteraction(this.modify);
        this.modify = null;
        if (this.modkey) {
            let test = new Observable
            test.un("change", this.modkey); //removes the previous modify even if there was one.
        }
        this.myCubeService.clearMyCubeData();
    }

    public draw(featuretype: any) {
        let stylefunction = ((feature) => {
            return (this.styleService.styleFunction(feature, this.mapConfig.currentLayer, "current"));
        })
        let featureID: number
        this.clearFeature()
        if (this.drawMode == true) {
            let test = new Observable
            this.drawMode = false
            this.mapConfig.drawMode = ""
            test.un("change", this.modkey);
            this.mapConfig.map.removeInteraction(this.drawInteraction);
        }
        else {
            this.drawMode = true
            let src = new VectorSource();
            let vector = new VectorLayer({
                source: src,
                style: this.mapstyles.current
            });
            this.drawInteraction = new Draw({
                type: featuretype,
                source: src,
            })
            this.mapConfig.map.addLayer(vector);
            this.modkey = this.mapConfig.map.addInteraction(this.drawInteraction);
            this.drawInteraction.once('drawend', (e) => {
                let featurejson = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(e.feature);
                this.sqlService.addRecord(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson))
                    .subscribe((data) => {
                        //console.log(data)
                        try { featureID = data[0][0].id }
                        catch (e) {
                            this.sqlService.fixGeometry(this.mapConfig.currentLayer.layer.ID)
                                .subscribe((x) => {
                                    //console.log(x)
                                })
                        }
                        e.feature.setId(featureID);
                        e.feature.setProperties(data[0]);
                        this.mapConfig.currentLayer.source.addFeature(e.feature)
                        e.feature.setStyle(stylefunction)
                        this.getFeatureList();
                        this.myCubeService.createAutoMyCubeComment(true, "Object Created", featureID, this.mapConfig.currentLayer.layer.ID, this.userID, featurejson['geometry'])
                    })
                this.mapConfig.map.removeLayer(vector);
                this.mapConfig.map.changed();
                let test = new Observable
                test.un("change", this.modkey);
                this.mapConfig.map.removeInteraction(this.drawInteraction);
                this.mapConfig.drawMode = ""
                this.drawMode = false
            })
        }
    }

    public delete(mapconfig: MapConfig) {
        let didUndo: boolean = false
        this.mapConfig.selectedFeatures.forEach((feat) => {
            //console.log(feat)
            let snackBarRef = this.snackBar.open('Feature deleted.', 'Undo', {
                duration: 4000
            });
            snackBarRef.afterDismissed().subscribe((x) => {
                // console.log("Dismissed")
                // console.log(didUndo)
                if (!didUndo) {
                    mapconfig.currentLayer.source.removeFeature(feat)
                    this.sqlService.Delete(mapconfig.currentLayer.layer.ID, feat.getId())
                        .subscribe((data) => {
                            if (this.modkey) {
                                let test = new Observable
                                test.un("change", this.modkey); //removes the previous modify even if there was one.
                            }
                            this.mapConfig.map.removeInteraction(this.modify);
                            this.modify = null;
                            this.myCubeService.createAutoMyCubeComment(true, "Object Deleted", feat.getId(), mapconfig.currentLayer.layer.ID, this.userID)
                        })
                    this.myCubeService.clearMyCubeData();
                    this.getFeatureList();
                    this.mapConfig.selectedFeature = null
                }
            })
            snackBarRef.onAction().subscribe((x) => {
                let newSnackBarRef = this.snackBar.open("Undone", '', { duration: 4000 })
                didUndo = true
            })
        })
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
                this.mapConfig.currentLayer.source.forEachFeature((x: Feature) => {
                    let i = this.mapConfig.currentLayer.source.getFeatures().findIndex((j) => j == x);
                    let fl = new featureList;
                    if (this.styleService.filterFunction(x, this.mapConfig.currentLayer)) {
                        fl.label = x.get(labelName);
                        if (x.get(labelName) == null) {fl.label = '(blank)'}
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
        this.selectMyCubeFeature(this.mapConfig.currentLayer);
    }

    public zoomExtents(): void {
        this.mapConfig.view.animate({ zoom: environment.centerZoom, center: transform([environment.centerLong, environment.centerLat], 'EPSG:4326', 'EPSG:3857') })

    }

    public zoomToLayer(layer: UserPageLayer) {
        //this needs to be fed the layer and work with it instead of the featurelist.
        let collection = new GeometryCollection
        let feats = new Array<Geometry>()
        layer.source.forEachFeature((i) => {
            feats.push(i.getGeometry())
            //may want to filter this down to only visible features.
        })
        collection.setGeometries(feats)
        this.mapConfig.view.fit(collection.getExtent(), {
            duration: 1000,
            maxZoom: 18
        })
    }

    public toggleBasemap() {
        let aerial = new BingMaps({
            key: environment.BingMapsKey,
            imagerySet: 'AerialWithLabels',
            maxZoom: 19,
            cacheSize: environment.cacheSize
        })
        let base: any
        if (environment.MapBoxBaseMapUrl != '') {
            base = new XYZ({ "url": 'https://api.mapbox.com/styles/v1/careystranahan/ck0it1pm20hll1clmfheoupbq/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY2FyZXlzdHJhbmFoYW4iLCJhIjoiY2lobDZkaDNmMDZreXUyajd4OW85MG4yZCJ9.KWMtpJfoSPadPLeydp5W8g' });
        }
        else {
            base = new OSM({ cacheSize: environment.cacheSize });
        }
        if (this.base == 'base') {
            this.base = 'aerial';
            this.mapConfig.layers[0].setSource(aerial);
        }
        else {
            this.base = 'base';
            this.mapConfig.layers[0].setSource(base);
        }
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