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
import { geoJSONService } from './geoJSON.service';
import { WMSService } from './wms.service';
import { SQLService } from '../../../_services/sql.service';
import { StyleService } from './style.service'
import { FeatureModulesService } from "app/feature-modules/feature-modules.service";
import { Modify, Draw } from 'ol/interaction';
import { Vector as VectorSource, Stamen } from 'ol/source';
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
import { GeocodingService } from './geocoding.service'
import { DataFormService } from '../../shared.components/data-component/data-form.service'
import { DataFormConfig, DataField, LogFormConfig, LogField } from "app/shared.components/data-component/data-form.model";
import { click, shiftKeyOnly } from 'ol/events/condition'
import { style } from "@angular/animations";
import { newArray } from "@angular/compiler/src/util";
import { Heatmap as HeatmapLayer } from 'ol/layer'
import KML from "ol/format/KML";



@Injectable()
export class LayerConfigService {

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
        private dataFormService: DataFormService,     
    ) {
    }
    
    public loadGeoserverWMS(mapConfig: MapConfig, init: boolean, userpagelayer: UserPageLayer): Promise<any> {
        let promise = new Promise((resolve) => {
        let wmsSource = new TileWMS({
            url: this.wmsService.formLayerRequest(userpagelayer),
            params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
            projection: 'EPSG:4326',
            serverType: 'geoserver',
            crossOrigin: 'anonymous',
            cacheSize: environment.cacheSize
        });
        let wmsLayer: TileLayer = new TileLayer({ source: wmsSource });
        // wmsLayer.setZIndex(j)
        wmsLayer.setVisible(userpagelayer.defaultON);
        if (init) {
            mapConfig.baseLayers.push(wmsLayer);  //to delete
        }
        userpagelayer.olLayer = wmsLayer
        userpagelayer.source = wmsSource
        this.wmsService.setLoadStatus(userpagelayer);
        if (init == false) { //necessary during initialization only, as the map requires the layers in an array to start with.
            mapConfig.map.addLayer(wmsLayer);
        }
        // j++;
        if (userpagelayer.style['opacity']) { userpagelayer.olLayer.setOpacity(+userpagelayer.style['opacity'] / 100) }
        // if (j == mapConfig.userpagelayers.length) { resolve() }
        let diffWMS: ImageWMS
        diffWMS = new ImageWMS({
            url: this.wmsService.formLayerRequest(userpagelayer, true),
            params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
            projection: 'EPSG:4326',
            serverType: 'geoserver',
            crossOrigin: 'anonymous'
        })
        if (userpagelayer.layer.legendURL) { userpagelayer.layer.legendURL = diffWMS.getLegendUrl(2).split('&SCALE')[0] }
        resolve()
    })
return promise
    }
    public loadWMTS(mapConfig: MapConfig, init: boolean, userpagelayer: UserPageLayer): Promise<any> {
        let promise = new Promise((resolve) => {
            let url: string
            if (userpagelayer.layer.server.serverType == "ArcGIS WMTS") { //if the server is of type ArchGISWMTS
                url = userpagelayer.layer.server.serverURL + '/' + userpagelayer.layer.layerService + '/MapServer/WMTS/1.0.0/WMTSCapabilities.xml'
            }
            else {
                url = userpagelayer.layer.server.serverURL + '/gwc/service/wmts'
                console.log(url)
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
                    userpagelayer.olLayer = wmtsLayer
                    userpagelayer.source = wmtsSource
                    this.wmsService.setLoadStatus(userpagelayer);
                    if (init == false) {
                        mapConfig.map.addLayer(wmtsLayer);
                    }
                    resolve()
                })
        })
        return promise
    }
}