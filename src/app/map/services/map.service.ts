import { Injectable } from "@angular/core";
import { MapConfig, mapStyles, featureList } from '../models/map.model';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { LayerPermission, Layer, UserPageLayer, MyCubeField, MyCubeConfig, MyCubeComment } from '../../../_models/layer.model';
import { LayerPermissionService } from '../../../_services/_layerPermission.service';
import { geoJSONService } from './../services/geoJSON.service';
import { MyCubeService } from './../services/mycube.service';
import { WMSService } from './wms.service';
import { SQLService } from './../../../_services/sql.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { StyleService } from '../services/style.service'

@Injectable()
export class MapService {
    public modifyingobject: boolean = false
    public shown: boolean
    public mapConfig: MapConfig;
    public vectorlayer = new ol.layer.Vector();
    public evkey: any;
    public modkey: any;
    public modkeystart: any;
    public modify: ol.interaction.Modify;
    public selectedLayer: any;
    public editmode: boolean = false;
    public featurelist = new Array<featureList>();
    public base: string = 'base';  //base layer
    private drawMode: boolean = false;
    private drawInteraction: any;
    public userID: number

    constructor(
        private userPageLayerService: UserPageLayerService,
        private layerPermissionService: LayerPermissionService,
        private geojsonservice: geoJSONService,
        private myCubeService: MyCubeService,
        private wmsService: WMSService,
        private sqlService: SQLService,
        private mapstyles: mapStyles,
        private styleService: StyleService,
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
                .then(() => this.getLayerPerms())
                .then(() => this.loadLayers(this.mapConfig, true).then(() => {
                    this.mapConfig.view = new ol.View({
                        projection: 'EPSG:3857',
                        center: ol.proj.transform([-86.1336, 40.4864], 'EPSG:4326', 'EPSG:3857'),
                        zoom: 13,
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
                    })
                    resolve();
                })
        })
        return promise;
    }

    //loadLayers will load during map init and load the layers that should come on by themselves with the "defaultON" property set (in userPageLayers)
    public loadLayers(mapConfig: MapConfig, init: boolean): Promise<any> {
        let j = 0;
        if (this.evkey) {
            ol.Observable.unByKey(this.evkey);
        }  //removes the previous click event if there was one.
        if (this.modkey) {
            ol.Observable.unByKey(this.modkey);
        } //removes the previous modify even if there was one.
        this.myCubeService.clearMyCubeData();
        this.myCubeService.clearWMS();
        let promise = new Promise((resolve, reject) => {
            this.mapConfig.userpagelayers.forEach(userpagelayer => {
                userpagelayer.layerShown = userpagelayer.defaultON;
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
                        console.log("At WMTS")
                        this.wmsService.getCapabilities(userpagelayer.layer.server.serverURL)
                            .subscribe((data) => {
                                let parser = new ol.format.WMTSCapabilities();
                                let result = parser.read(data);
                                let options = ol.source.WMTS.optionsFromCapabilities(result, {
                                    layer: userpagelayer.layer.layerIdent,
                                    matrixSet: 'EPSG:3857'
                                });
                                let wmsSource = new ol.source.WMTS(options);
                                this.wmsService.setLoadEvent(userpagelayer, wmsSource);
                                let wmsLayer = new ol.layer.Tile({
                                    opacity: 1,
                                    source: new ol.source.WMTS(options)
                                });
                                wmsLayer.setVisible(userpagelayer.defaultON);
                                userpagelayer.olLayer = wmsLayer
                                userpagelayer.source = wmsSource
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
                    default: {

                        let url = this.wmsService.formLayerRequest(userpagelayer);
                        let wmsSource = new ol.source.TileWMS({
                            url: url,
                            params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
                            projection: 'EPSG:4326',
                            serverType: 'geoserver',
                            crossOrigin: 'anonymous'
                        });
                        this.wmsService.setLoadEvent(userpagelayer, wmsSource);
                        let wmsLayer = new ol.layer.Tile({
                            source: wmsSource
                        });
                        wmsLayer.setVisible(userpagelayer.defaultON);
                        this.mapConfig.layers.push(wmsLayer);  //to delete
                        userpagelayer.olLayer = wmsLayer
                        //this.mapConfig.sources.push(wmsSource); //to delete
                        userpagelayer.source = wmsSource
                        userpagelayer.loadOrder = this.mapConfig.layers.length;  //to delete
                        if (init == false) {
                            mapConfig.map.addLayer(wmsLayer);
                        }
                        j++;
                        if (j == this.mapConfig.userpagelayers.length) {
                            resolve();
                        }

                    }
                }
            }
            )

        })
        return promise;
    }

    //Reads index of layer in dropdown, layer, and if it is shown or not. Needs to remove a layer if a new one is selected
    private toggleLayers(layer: UserPageLayer): void {
        layer.olLayer.setVisible(!layer.layerShown)
        layer.layerShown = !layer.layerShown;
        if (layer.layerShown === false) {
            if (this.mapConfig.currentLayer == layer) {
                this.mapConfig.currentLayer = new UserPageLayer;
                this.mapConfig.currentLayerName = "";
                this.clearFeature()
            }
            //could add something here that would move to the next layerShown=true.  Not sure.
            this.mapConfig.editmode = this.mapConfig.currentLayer.layerPermissions.edit
        }
        else {
            this.setCurrentLayer(layer);
        }
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
            this.runInterval(layer, source);
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

    public runInterval(layer: UserPageLayer, source: ol.source.Vector) {
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
                    source.clear();
                    source.addFeatures(new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
                    let index = this.mapConfig.userpagelayers.findIndex(x => x == layer);
                    //this.mapConfig.layers[index].setStyle(stylefunction) 
                    source.forEachFeature(feat => {
                        //console.log("runInterval and feat = " + feat.getId())
                        feat.setStyle(stylefunction);
                    })
                    //this.filterFunction(layer, source)
                    if (this.mapConfig.currentLayer == layer) {
                        this.getFeatureList();
                        if (this.mapConfig.selectedFeature) {
                            this.mapConfig.selectedFeature = source.getFeatureById(this.mapConfig.selectedFeature.getId());
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
                    //source = new ol.source.Vector()
                    resolve(data);//source = new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })).readFeatures(data[0][0]['jsonb_build_object']) })                
                })
        })
        return promise;
    }

    public setCurrentLayer(layer: UserPageLayer): void {
        this.clearLayerConfig();
        this.mapConfig.currentLayer = layer;
        this.mapConfig.currentLayerName = layer.layer.layerName  //Puts the current name in the component
       if (layer.layerShown === true && layer.layer.layerType == "MyCube") {
            this.setCurrentMyCube(layer)
        }
        if (layer.layerShown === true && layer.layer.layerType != "MyCube") {
            if (this.evkey) {
                ol.Observable.unByKey(this.evkey);
            }
            if (this.modkey) {
                ol.Observable.unByKey(this.modkey);
            } //removes the previous modify even if there was one.
            this.evkey = this.createClick(layer);
            this.mapConfig.currentLayerName = layer.layer.layerName;
        }
    }

    private clearLayerConfig() {
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
        this.mapConfig.userpagelayers.forEach(element => {
            if (element.layer.layerType == "MyCube") {
                let stylefunction = ((feature) => {
                    return (this.styleService.styleFunction(feature, element, "load"));
                })
                element.olLayer.setStyle(stylefunction)
            }
        });
    }

    private createClick(layer) {
        let evkey = this.mapConfig.map.on('click', (evt: any) => {
            console.log("click")
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
        return evkey;
    }


    private setCurrentMyCube(layer: UserPageLayer) {
        let stylefunction = ((feature) => {
            return (this.styleService.styleFunction(feature, layer, "current"));
        })
        try {
            if (layer.style['filter']['column']) {
                this.mapConfig.filterOn = true;
            }
            else {
                this.mapConfig.filterOn = false;
            }
        }
        catch (e) {
            console.log('No Filter');
        }

        this.featurelist = [];
        this.shown = true;
        this.mapConfig.editmode = layer.layerPermissions.edit;
        this.mapConfig.map.removeInteraction(this.modify);
        this.modify = null;
        if (this.evkey) {
            ol.Observable.unByKey(this.evkey);
        }
        if (this.modkey) {
            ol.Observable.unByKey(this.modkey); //removes the previous modify even if there was one.
        }
        //this.mapConfig.layers[layer.loadOrder - 1].setStyle(stylefunction);
        layer.olLayer.setStyle(stylefunction);
        this.getFeatureList();
        this.evkey = this.mapConfig.map.on('click', (e) => {
            if (this.mapConfig.selectedFeature) {
                this.mapConfig.selectedFeature.setStyle(null);
            }
            var hit = false;
            this.mapConfig.map.forEachFeatureAtPixel(e.pixel, (feature: ol.Feature, selectedLayer: any) => {
                this.selectedLayer = selectedLayer;
                if (selectedLayer === layer.olLayer) {
                    hit = true;
                    this.mapConfig.selectedFeature = feature;
                };
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

        this.myCubeService.prebuildMyCube(layer); //This needs a lot of work
    }

    private selectFeature(layer: UserPageLayer, refresh: boolean = false) {
        this.mapConfig.selectedFeature.setStyle(this.mapstyles.selected);
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
                console.log(e.features.getArray().length)
                e.features.forEach(element => {
                    if (this.modifyingobject) {
                        console.log(element)
                        this.mapConfig.selectedFeature = element;
                        let featurejson = new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature);
                        let fjson2 = JSON.parse(featurejson)
                        let featureID = fjson2['id']
                        this.geojsonservice.updateGeometry(layer.layer.ID, JSON.parse(featurejson))
                            .subscribe((data) => {
                                console.log("Geometry updated")
                                let comment = new MyCubeComment()
                                comment.table = this.mapConfig.currentLayer.layer.ID
                                comment.geom = featurejson['geometry']
                                comment.auto = true
                                comment.comment = "Geometry Modified"
                                comment.featureID = featureID
                                comment.geom = JSON.parse(featurejson)
                                comment.userID = this.userID
                                this.sqlService.addCommentWithGeom(comment)
                                    .subscribe((data) => {
                                        this.myCubeService.loadComments(this.mapConfig.currentLayer.layer.ID, featureID)
                                        layer.updateInterval = this.runInterval(layer, layer.source)
                                    })
                            })
                        this.modifyingobject = false

                    }
                });

            })
        }
    }

    private clearFeature() {
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
        //this.mapConfig.layers[layer.loadOrder - 1].setStyle(this.styleService.styleFunction("", layer, 'current'))
    }

    private draw(featurety: any) {
        let featureID: number
        if (this.modkey) {
            ol.Observable.unByKey(this.modkey);
        } //removes the previous modify even if there was one.
        this.mapConfig.map.removeInteraction(this.modify);
        this.modify = null;

        if (this.drawMode == true) {
            console.log("Repressed")
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
                type: featurety,
                source: src,
            })

            this.mapConfig.map.addLayer(vector);
            this.modkey = this.mapConfig.map.addInteraction(this.drawInteraction);
            this.drawInteraction.once('drawend', (e) => {
                let featurejson = new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(e.feature);
                this.sqlService.addRecord(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson))
                    .subscribe((data) => {
                        console.log(data)
                        try { featureID = data[0].id }
                        catch (e) {
                            this.sqlService.fixGeometry(this.mapConfig.currentLayer.layer.ID)
                                .subscribe((data) => {
                                    console.log(data)

                                })
                        }
                        e.feature.setId(featureID);
                        e.feature.setProperties(data[0]);
                        //this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder - 1].addFeature(e.feature);
                        this.mapConfig.currentLayer.source.addFeature(e.feature)
                        this.getFeatureList();
                        let comment = new MyCubeComment()
                        comment.table = this.mapConfig.currentLayer.layer.ID
                        comment.geom = featurejson['geometry']
                        comment.auto = true
                        comment.comment = "Object Created"
                        comment.featureID = featureID
                        comment.geom = JSON.parse(featurejson)
                        comment.userID = this.userID
                        this.sqlService.addCommentWithGeom(comment)
                            .subscribe((data) => {
                            })
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

    private delete(mapconfig: MapConfig, featurety: any) {
        this.mapConfig.selectedFeatures.forEach((feat) => {
            // mapconfig.sources[mapconfig.currentLayer.loadOrder - 1].removeFeature(feat);
            mapconfig.currentLayer.source.removeFeature(feat)
            this.sqlService.Delete(mapconfig.currentLayer.layer.ID, feat.getId())
                .subscribe((data) => {
                    if (this.modkey) {
                        ol.Observable.unByKey(this.modkey); //removes the previous modify even if there was one.
                    }
                    this.mapConfig.map.removeInteraction(this.modify);
                    this.modify = null;
                    let comment = new MyCubeComment()
                    comment.auto = true
                    comment.comment = 'Object deleted'
                    comment.featureID = feat.getId()
                    comment.table = mapconfig.currentLayer.layer.ID
                    comment.userID = this.userID
                    this.myCubeService.addCommentWithoutGeom(comment)
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
            let labelName: string = this.mapConfig.currentLayer.layer.defaultStyle['listLabel'];
            if (this.mapConfig.currentLayer.style['listLabel'] != null) {
                labelName = this.mapConfig.currentLayer.style['listLabel'];
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
                    this.featurelist = tempList.slice(0, k);
                })
            }

            this.featurelist.sort((a, b): number => {
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

    private zoomToFeature(featurelist: featureList): void {
        this.clearFeature();
        let ext = featurelist.feature.getGeometry().getExtent();
        let center = ol.extent.getCenter(ext);
        this.mapConfig.view.fit(featurelist.feature.getGeometry().getExtent(), {
            duration: 1000,
            maxZoom: 18
        })
        this.mapConfig.selectedFeature = featurelist.feature;
        this.selectFeature(this.mapConfig.currentLayer);
    }

    //required (called from html)
    private zoomExtents(): void {
        this.mapConfig.view.animate({ zoom: 13, center: ol.proj.transform([-86.1336, 40.4864], 'EPSG:4326', 'EPSG:3857') })
    }

    //required (called from html)
    private toggleBasemap() {
        let aerial = new ol.source.BingMaps({
            key: 'AqG6nmU6MBeqJnfsjQ-285hA5Iw5wgEp3krxwvP9ZpE3-nwYqO050K5SJ8D7CkAw',
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
                console.log(data)
            })
    }
}