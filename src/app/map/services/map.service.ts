import { Injectable } from "@angular/core";
import { MapConfig, mapStyles, featureList } from '../models/map.model';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { UserPageService } from '../../../_services/_userPage.service';
import { UserPageInstanceService } from '../../../_services/_userPageInstance.service'
import { LayerPermission, UserPageLayer } from '../../../_models/layer.model';
import { UserPageInstance, ModulePermission } from '../../../_models/module.model'
import { UserPage } from '../../../_models/user.model';
import { LayerPermissionService } from '../../../_services/_layerPermission.service';
import { ModulePermissionService } from '../../../_services/_modulePermission.service'
import { geoJSONService } from './../services/geoJSON.service';
import { WMSService } from './wms.service';
import { SQLService } from './../../../_services/sql.service';
import { StyleService } from '../services/style.service'
import { FeatureModulesService } from "app/feature-modules/feature-modules.service";
import { Modify, Draw } from 'ol/interaction';
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
import XYZ from 'ol/source/XYZ';
import OSM from 'ol/source/OSM';
import BingMaps from 'ol/source/BingMaps';
import { GeocodingService } from '../services/geocoding.service'
import { DataFormService } from '../../shared.components/data-component/data-form.service'
import { DataFormConfig, DataField, LogFormConfig, LogField } from "app/shared.components/data-component/data-form.model";

@Injectable()
export class MapService {
    public modifyingobject: boolean = false
    public mapConfig = new MapConfig;
    public modkey: any;
    public modkeystart: any;
    public modify: Modify;
    public base: string = 'base';  //base layer
    private drawInteraction: any;


    constructor(
        private userPageLayerService: UserPageLayerService,
        private userPageService: UserPageService,
        private userPageInstanceService: UserPageInstanceService,
        private layerPermissionService: LayerPermissionService,
        private modulePermissionService: ModulePermissionService,
        private geojsonservice: geoJSONService,
        private wmsService: WMSService,
        private sqlService: SQLService,
        private mapstyles: mapStyles,
        private styleService: StyleService,
        private featuremodulesservice: FeatureModulesService,
        private snackBar: MatSnackBar,
        private dataFormService: DataFormService
    ) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.mapConfig.userID = currentUser && currentUser.userID;
    }

    public getUserPageLayers(): Promise<any> {
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

    public getUserPageInstances(): Promise<any> {
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
                .GetByUserGroups(this.mapConfig.user.ID)
                .subscribe((data: LayerPermission[]) => {
                    this.mapConfig.layerpermission = data;
                    this.mapConfig.userpagelayers.forEach((userpagelayer) => {
                        let j = this.mapConfig.layerpermission.findIndex((x) => x.layerID == userpagelayer.layerID);
                        if (j >= 0) {
                            userpagelayer.layerPermissions = this.mapConfig.layerpermission[j];
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
                        }
                    })
                    resolve();
                })
        })
        return promise;
    }

    public loadARCGISRest(mapConfig: MapConfig, userpagelayer: UserPageLayer, init: boolean, j: number) {
        let wmsSource = new ImageArcGISRest()
        wmsSource.setUrl(userpagelayer.layer.server.serverURL + '/' + userpagelayer.layer.layerService + '/MapServer')
        let wmsLayer: ImageLayer = new ImageLayer({
            source: wmsSource
        })
        wmsLayer.setZIndex(j)
        wmsLayer.setVisible(userpagelayer.defaultON);
        if (userpagelayer.style['opacity']) { wmsLayer.setOpacity(userpagelayer.style['opacity']) }
        if (init) {
            //this.mapConfig.layers.push(wmsLayer);  //to delete
        }
        userpagelayer.olLayer = wmsLayer
        userpagelayer.source = wmsSource
        this.wmsService.setLoadStatus(userpagelayer);
        if (init == false) { //necessary during initialization only, as the map requires the layers in an array to start with.
            mapConfig.map.addLayer(wmsLayer);
        }
    }

    public loadWMTS(mapConfig: MapConfig, userpagelayer: UserPageLayer, init: boolean) {
        let url: string
        let diffWMS: ImageWMS
        diffWMS = new ImageWMS({
            url: this.wmsService.formLayerRequest(userpagelayer, true),
            params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
            projection: 'EPSG:4326',
            serverType: 'geoserver',
            crossOrigin: 'anonymous'
        })

        userpagelayer.layer.legendURL = diffWMS.getLegendUrl(23)
        if (userpagelayer.layer.server.serverType == "ArcGIS WMTS") {
            url = userpagelayer.layer.server.serverURL + '/' + userpagelayer.layer.layerService + '/ImageServer/WMTS/1.0.0/WMTSCapabilities.xml'
        }
        else {
            url = userpagelayer.layer.server.serverURL
        }
        this.wmsService.getCapabilities(url)
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
                    //this.mapConfig.layers.push(wmtsLayer);  //to delete
                }
                userpagelayer.olLayer = wmtsLayer
                userpagelayer.source = wmtsSource
                this.wmsService.setLoadStatus(userpagelayer);
                if (init == false) {
                    mapConfig.map.addLayer(wmtsLayer);
                }
                if (userpagelayer.style['opacity']) { userpagelayer.olLayer.setOpacity(+userpagelayer.style['opacity'] / 100) }
            })
    }

    public loadMyCube(layer: UserPageLayer, order?: number): Promise<any> {
        let promise = new Promise<any> ((resolve) => {
            let source = new VectorSource({
                format: new GeoJSON()
            })
            this.getMyCubeData(layer).then((data) => {
                if (data[0][0]['jsonb_build_object']['features']) {
                    source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
                }
                let vectorlayer = new VectorLayer({ source: source});
                vectorlayer.setVisible(layer.defaultON);
                if (order) { vectorlayer.setZIndex(order) }
                try {
                    this.mapConfig.map.addLayer(vectorlayer);
                }
                catch (e) {
                    console.log('Theres an error, for some reason')
                    console.log('reloading the layer')
                }
                layer.olLayer = vectorlayer
                layer.source = source
                // this.styleMyCube(layer)
                resolve(layer)
            })
        })
        return promise
    }

    public loadWMS(mapConfig: MapConfig, userpagelayer: UserPageLayer, init: boolean, j: number) {
        let wmsSource = new TileWMS({
            url: this.wmsService.formLayerRequest(userpagelayer),
            params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
            projection: 'EPSG:4326',
            serverType: 'geoserver',
            crossOrigin: 'anonymous',
            cacheSize: environment.cacheSize
        });
        let wmsLayer: TileLayer = new TileLayer({
            source: wmsSource
        });
        wmsLayer.setZIndex(j)
        wmsLayer.setVisible(userpagelayer.defaultON);
        if (init) {
            this.mapConfig.baseLayers.push(wmsLayer);  //to delete
        }
        userpagelayer.olLayer = wmsLayer
        userpagelayer.source = wmsSource
        this.wmsService.setLoadStatus(userpagelayer);
        if (init == false) { //necessary during initialization only, as the map requires the layers in an array to start with.
            mapConfig.map.addLayer(wmsLayer);
        }

        if (userpagelayer.style['opacity']) { userpagelayer.olLayer.setOpacity(+userpagelayer.style['opacity'] / 100) }
        let diffWMS: ImageWMS
        diffWMS = new ImageWMS({
            url: this.wmsService.formLayerRequest(userpagelayer, true),
            params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
            projection: 'EPSG:4326',
            serverType: 'geoserver',
            crossOrigin: 'anonymous'
        })
        if (userpagelayer.layer.legendURL) { userpagelayer.layer.legendURL = diffWMS.getLegendUrl(2).split('&SCALE')[0] }
    }

    public runInterval(layer: UserPageLayer): Promise<any> {
        let promise = new Promise<any>((resolve) => {
            this.getMyCubeData(layer).then((data) => {
                if (data[0]) {
                    if (data[0][0]['jsonb_build_object']['features']) {
                        layer.source.clear();
                        layer.source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
                        //this.setStyle(layer)
                        if (this.mapConfig.currentLayer == layer) {
                            this.getFeatureList();
                            if (this.mapConfig.selectedFeature) {
                                this.mapConfig.selectedFeature = layer.source.getFeatureById(this.mapConfig.selectedFeature.getId());
                                if (this.mapConfig.selectedFeature) {
                                    this.mapConfig.selectedFeature.setStyle(this.mapstyles.selected);
                                    this.selectMyCubeFeature(layer, true)
                                } //need to make sure the feature still exists
                            }
                        }
                        //may need to add something in here that compares new data to old data and makes sure the selected feature remains selected.
                    }
                }
                resolve()
            })
           
        })
        return promise
    }

    public setStyle(layer: UserPageLayer, st?: string) {
        if (st = null) { st = 'current' }
        let stylefunction = ((feature, resolution) => {
            if (this.mapConfig.currentLayer == layer) {
                if (feature == this.mapConfig.selectedFeature) {
                    return (this.styleService.styleFunction(feature, layer, "selected"))
                }
                else {
                    return (this.styleService.styleFunction(feature, layer, "current"));
                }
            }
            else {
                return (this.styleService.styleFunction(feature, layer, "load"));
            }
        })
        if (layer.layer.layerType == 'MyCube') {
            layer.olLayer.setStyle(stylefunction)
        }
    }

    private getMyCubeData(layer): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            this.geojsonservice.GetAll(layer.layer.ID)
                .subscribe((data: any) => { //This response contains geoJSON data
                    resolve(data);
                })
        })
        return promise;
    }
    
    public setCurrentLayer(layer: UserPageLayer): void {
            this.mapConfig.currentLayer = layer
            this.setStyle(layer)  //This gets the styling right.

            if (layer.layerShown === true && layer.layer.layerType == "MyCube") {
                this.mapConfig.editmode = layer.layerPermissions.edit;
                this.mapConfig.showFilterButton = true
                this.mapConfig.showStyleButton = true
                this.mapConfig.showDeleteButton = true
            }
            if (layer.layer.layerType == "MyCube" && layer.style.filter.column) {
                this.mapConfig.filterOn = true
            }
            this.mapConfig.showStyleButton = true
            this.getFeatureList()
    }
   
    public parseAndSendWMS(WMS: string): void { 
        WMS = WMS.split("<body>")[1];
        WMS = WMS.split("</body>")[0];
        if (WMS.length < 10) {
            this.mapConfig.WMSFeatureData = ""
        }
        else {
            this.mapConfig.WMSFeatureData = WMS; //This allows the service to render the actual HTML unsanitized
        }
    }

    public selectMyCubeFeature(layer: UserPageLayer, refresh: boolean = false): void {
        if (refresh == false) {
            this.dataFormService.setDataFormConfig('mycube', 't' + layer.layer.ID, this.mapConfig.selectedFeature.getId()).then((dataFormConfig: DataFormConfig) => {
                dataFormConfig.visible = true
                dataFormConfig.dataTableTitle = "Feature Data"
                dataFormConfig.editMode = layer.layerPermissions.edit
                dataFormConfig.logTable = 'c' + layer.layer.ID
                dataFormConfig.userID = this.mapConfig.user.ID
                this.mapConfig.myCubeConfig = dataFormConfig
                this.mapConfig.myCubeConfig.dataForm.find(x => x.field == 'id').visible = false
            })
            this.loadLogConfig(layer);
        }
        if (this.mapConfig.selectedFeatures) { this.mapConfig.selectedFeatures.clear(); }
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
                                let logField = new LogField
                                logField.auto = true
                                logField.comment = "Geometry Modified"
                                logField.featureid = featureID
                                logField.geom = JSON.parse(featurejson)
                                logField.logTable = 'c' + this.mapConfig.currentLayer.layer.ID
                                logField.schema = 'mycube'
                                logField.userid = this.mapConfig.user.ID
                                this.sqlService.addAnyComment(logField)
                                    .subscribe((x) => {
                                        this.loadLogConfig(this.mapConfig.currentLayer)
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

    public loadLogConfig(layer: UserPageLayer) {
        this.dataFormService.setLogConfig('mycube', 'c' + layer.layer.ID, this.mapConfig.selectedFeature.getId()).then((logFormConfig: LogFormConfig) => {
            this.renderLogConfig(logFormConfig);
        });
    }

    public renderLogConfig(logFormConfig: LogFormConfig) {
        if (logFormConfig.logForm) {
            logFormConfig.logTableTitle = "Comments (" + logFormConfig.logForm.length + ")"
            logFormConfig.visible = true;
            logFormConfig.logForm.forEach((x) => {
                if (x.userid == this.mapConfig.user.ID) {
                    x.canDelete = true;
                }
            });
        };
        logFormConfig.userID = this.mapConfig.user.ID;
        this.mapConfig.myCubeComment = logFormConfig;
    }

    public clearFeature() {
        if (this.mapConfig.selectedFeature) { this.mapConfig.selectedFeatureSource.clear() }
        if (this.mapConfig.selectedFeature) {
            // this.mapConfig.selectedFeature.setStyle(null);
            this.mapConfig.selectedFeature = null;
        }
        this.mapConfig.map.removeInteraction(this.modify);
        this.modify = null;
        if (this.modkey) {
            let test = new Observable
            test.un("change", this.modkey); //removes the previous modify even if there was one.
        }
        this.mapConfig.myCubeConfig = new DataFormConfig
        this.mapConfig.myCubeComment = new LogFormConfig
    }

    public drawFeature(featuretype: any) {
        //this looks like it still needs to go to mapComponent
        let stylefunction = ((feature) => {
            return (this.styleService.styleFunction(feature, this.mapConfig.currentLayer, "current"));
        })
        let featureID: number
        this.clearFeature()
        if (this.mapConfig.drawMode != "") {
            let test = new Observable
            // this.drawMode = false
            this.mapConfig.drawMode = ""
            test.un("change", this.modkey);
            this.mapConfig.map.removeInteraction(this.drawInteraction);
        }
        else {
            //this is the reason it needs to move
            if (this.featuremodulesservice.draw(this.mapConfig, this.mapConfig.currentLayer, featuretype)) {
                return
            }
            else {
                this.mapConfig.drawMode = featuretype
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
                            //need to get an error check to fix if the MyCube has been jacked up by QGIS (3Dvs2D)
                            try { featureID = data[0][0].id }
                            catch (e) {
                                this.sqlService.fixGeometry(this.mapConfig.currentLayer.layer.ID)
                                    .subscribe((x) => {
                                    })
                            }
                            e.feature.setId(featureID);
                            e.feature.setProperties(data[0]);
                            this.mapConfig.currentLayer.source.addFeature(e.feature)
                            e.feature.setStyle(stylefunction)
                            this.getFeatureList();
                            let logField = new LogField
                            logField.auto = true
                            logField.comment = "Object Created"
                            logField.featureid = featureID
                            logField.geom = featurejson['geometry']
                            logField.logTable = 'c' + this.mapConfig.currentLayer.layer.ID
                            logField.schema = 'mycube'
                            logField.userid = this.mapConfig.user.ID
                            this.sqlService.addAnyComment(logField)
                                .subscribe((x) => {
                                })
                        })
                    this.mapConfig.map.removeLayer(vector);
                    this.mapConfig.map.changed();
                    let test = new Observable
                    test.un("change", this.modkey);
                    this.mapConfig.map.removeInteraction(this.drawInteraction);
                    this.mapConfig.drawMode = ""
                    // this.drawMode = false
                })
            }
        }
    }

    public deleteFeature() {
        let didUndo: boolean = false
        let feat: Feature = this.mapConfig.selectedFeature
        this.mapConfig.currentLayer.source.removeFeature(this.mapConfig.selectedFeature)
        this.mapConfig.selectedFeature = null
        this.mapConfig.myCubeConfig = new DataFormConfig
        this.mapConfig.myCubeComment = new LogFormConfig
        this.getFeatureList();
        this.mapConfig.map.removeInteraction(this.modify);
        let snackBarRef = this.snackBar.open('Feature deleted.', 'Undo', {
            duration: 4000
        });
        snackBarRef.afterDismissed().subscribe((x) => {
            if (!didUndo) {
                this.sqlService.Delete(this.mapConfig.currentLayer.layer.ID, feat.getId())
                    .subscribe((data) => {
                        if (this.modkey) {
                            let test = new Observable
                            test.un("change", this.modkey); //removes the previous modify even if there was one.
                        }
                        this.modify = null;
                        let logField = new LogField
                        logField.auto = true
                        logField.comment = "Object Deleted"
                        logField.featureid = feat.getId()
                        logField.logTable = 'c' + this.mapConfig.currentLayer.layer.ID
                        logField.schema = 'mycube'
                        logField.userid = this.mapConfig.user.ID
                        this.sqlService.addAnyComment(logField)
                            .subscribe((x) => {
                            })
                    })

            }
        })
        snackBarRef.onAction().subscribe((x) => {
            let newSnackBarRef = this.snackBar.open("Undone", '', { duration: 4000 })
            didUndo = true
            this.mapConfig.selectedFeature = feat
            this.mapConfig.currentLayer.source.addFeature(this.mapConfig.selectedFeature)
            this.selectMyCubeFeature(this.mapConfig.currentLayer, false)
        })
    }

    public getFeatureList() {
        let k: number = 0;
        let tempList = new Array<featureList>();
        try {
            let labelName: string = this.mapConfig.currentLayer.layer.defaultStyle.listLabel;
            if (this.mapConfig.currentLayer.style != null) {
                if (this.mapConfig.currentLayer.style.listLabel != null) {
                    labelName = this.mapConfig.currentLayer.style.listLabel;
                }
            }
            if (labelName != null && labelName.length != 0) {
                this.mapConfig.currentLayer.source.forEachFeature((x: Feature) => {
                    let i = this.mapConfig.currentLayer.source.getFeatures().findIndex((j) => j == x);
                    let fl = new featureList;
                    if (this.styleService.filterFunction(x, this.mapConfig.currentLayer)) {
                        fl.label = x.get(labelName);
                        if (x.get(labelName) == null) { fl.label = '(blank)' }
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
            base = new XYZ({ "url": environment.MapBoxBaseMapUrl });
        }
        else {
            base = new OSM({ cacheSize: environment.cacheSize });
        }
        if (this.base == 'base') {
            this.base = 'aerial';
            this.mapConfig.baseLayers[0].setSource(aerial);
        }
        else {
            this.base = 'base';
            this.mapConfig.baseLayers[0].setSource(base);
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

    public toggleDefaultOn(layer: UserPageLayer) {
        layer.defaultON = !layer.defaultON
        let templayer = new UserPageLayer
        templayer.ID = layer.ID
        templayer.defaultON = layer.defaultON
        templayer.style = layer.style  //This is a stupid hack.
        this.userPageLayerService
            .Update(templayer)
            .subscribe((data) => {
            })
    }

    public cleanPage(): void {
        // The tempUPL is set up so that the expansion panel can immediately get cleared while the page is cleaning.
        this.mapConfig.disableCurrentLayer = true
        let tempUPL: UserPageLayer[]
        tempUPL = this.mapConfig.userpagelayers
        this.mapConfig.userpagelayers = []
        tempUPL.forEach((x) => {
            this.mapConfig.map.removeLayer(x.olLayer)
            this.mapConfig.currentLayerName = "";
            this.mapConfig.featureList = []
            if (x.layer.layerType == "MyCube") {
                clearInterval(x.updateInterval)
                x.source.clear(true)
            }
        })
        this.mapConfig.editmode = false
        this.mapConfig.filterOn = false;
        this.mapConfig.filterShow = false;
        this.mapConfig.styleShow = false
        this.mapConfig.showDeleteButton = false
        this.mapConfig.showFilterButton = false
        this.mapConfig.showStyleButton = false
        this.mapConfig.WMSFeatureData = ""
        this.mapConfig.selectedFeatureSource.clear()
        this.mapConfig.myCubeConfig = new DataFormConfig
        this.mapConfig.myCubeComment = new LogFormConfig
    }

    public addUserPageLayer(UPL: UserPageLayer) {
        let newUPL = new UserPageLayer
        newUPL.userPageID = this.mapConfig.currentpage.ID
        newUPL.userID = this.mapConfig.user.ID;
        newUPL.defaultON = UPL.layerShown;
        newUPL.style = UPL.style
        newUPL.serverID = UPL.serverID
        newUPL.userID = UPL.userID
        newUPL.layerID = UPL.layer.ID
        this.userPageLayerService
            .Add(newUPL)
            .subscribe((result: UserPageLayer) => {
                UPL.ID = result.ID
            });
    }

    public deleteUserPageLayer(userPageLayer: UserPageLayer): void {
        this.mapConfig.map.removeLayer(userPageLayer.olLayer)
        this.mapConfig.userpagelayers.splice(this.mapConfig.userpagelayers.findIndex((x) => x == userPageLayer), 1)
        this.userPageLayerService
            .Delete(userPageLayer.ID)
            .subscribe(() => {});
    }

    public setDefaultPage(userPage: UserPage) {
        this.mapConfig.defaultpage.default = false;
        this.userPageService
            .Update(this.mapConfig.defaultpage)
            .subscribe();
        userPage.default = true;
        this.userPageService
            .Update(userPage)
            .subscribe((data) => {
                this.mapConfig.defaultpage = userPage;
            })
    }

    public setDefaultPageLayer() { //not being used right now.
        this.mapConfig.userpagelayers.forEach((userpagelayer) => {
            if (this.mapConfig.currentpage.defaultLayer == userpagelayer.ID) {
                this.setCurrentLayer(userpagelayer)
            }
        })
    }

    public setCurrentMyCube(layer: UserPageLayer): void {
        this.setStyle(layer)  //This gets the styling right.
        this.getFeatureList()
        if (layer.layerShown === true && layer.layer.layerType == "MyCube") {
            this.mapConfig.editmode = layer.layerPermissions.edit;
            this.mapConfig.showFilterButton = true
            this.mapConfig.showStyleButton = true
            this.mapConfig.showDeleteButton = true
        }
        if (layer.layer.layerType == "MyCube" && layer.style.filter.column) {
            this.mapConfig.filterOn = true
        }
        this.mapConfig.showStyleButton = true
    }
}
