import { Injectable } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
import { PaserConfig, PaserStyles, PaserRecord } from './paser.model'
import { StyleService } from './style.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http'
import { SQLService } from '../../../../_services/sql.service';
import { MyCubeService } from '../../../map/services/mycube.service'
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { transform } from 'ol/proj';
import { DataFormService } from '../../../shared.components/data-component/data-form.service'
import { DataFormConfig } from 'app/shared.components/data-component/data-form.model';

@Injectable()
export class PaserService {
  public mapConfig: MapConfig
  public SDSConfig = new Array<PaserConfig>()
 
  constructor(private geojsonservice: geoJSONService,
    protected _http: HttpClient,
    private styleService: StyleService,
    private sqlService: SQLService) {
  }

  //loads the SDS Layer
  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.mapConfig = mapConfig
    return false
  }
  
  public reloadLayer(layer: UserPageLayer) {
    this.getMyFeatureData(layer).then((data) => {
     if (layer.source) { layer.source.clear() };
     if (data[0][0]['jsonb_build_object']['features']) {
         layer.source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']))
         this.styleMyCube(layer)
     }
   })
 }

  public styleMyCube(layer: UserPageLayer, layerState?: string): boolean {
    if (layerState) {
      layer.source.forEachFeature((x: Feature) => {
        x.setStyle(this.styleService.styleFunction(x, layerState))
      })
    }
    else {
      {layerState = 'load'}
      layer.source.forEachFeature((x: Feature) => {
        if (layer == this.mapConfig.currentLayer) { layerState = 'current' }
        if (x == this.mapConfig.selectedFeature) {layerState = 'selected'}
        x.setStyle(this.styleService.styleFunction(x, layerState))
      })
    }
    return true
  }

  
  public setCurrentLayer(layer: UserPageLayer): boolean {
    switch (layer.layer.layerType) {
      case "MyCube": {
        this.mapConfig.editmode = true //probably need to set this as a permission and not always true
        this.styleMyCube(layer)
        break
      }
    }
    return true
  }

  public unsetCurrentLayer(layer: UserPageLayer): boolean {
    switch (layer.layer.layerType) {
      case "MyCube": {
        this.styleMyCube(layer, 'load')
      }
    }
        return true
  }

  public unloadLayer(layer: UserPageLayer): boolean {
    return true
  }

  public styleSelectedFeature(layer: UserPageLayer): boolean {
    if (layer.layer.layerType == "MyCube") {this.styleMyCube(layer)}
    return true
  }

  public unstyleSelectedFeature(layer: UserPageLayer): boolean {
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, 'current'));
    })
    if(this.mapConfig.selectedFeature) {this.mapConfig.selectedFeature.setStyle(stylefunction)}
    return true
  }

  public styleFunction(styleToUse: ol.style.Style): ol.style.Style {
    let style = styleToUse
    return style;
  }

  private getMyFeatureData(layer): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.geojsonservice.GetAll(layer.layer.ID)
        .subscribe((data: GeoJSON) => {
          resolve(data);
        })
    })
    return promise;
  }

  public addRecord(table, geometry: JSON) {
    this.sqlService.addRecord(table, geometry)
      .subscribe(data => {
        //need to add code to store new records here.
      })
  }

  public zoomToFeature(id: number, geometry: JSON) {
    this.mapConfig.view.animate({ zoom: 17, center: transform([geometry['geometry']['coordinates'][0], geometry['geometry']['coordinates'][1]], 'EPSG:4326', 'EPSG:3857') })
  }

  public getSDSRecords(dataFormConfig: DataFormConfig, linkedField: string):Promise<Array<any>> {
    console.log(dataFormConfig)
    console.log(linkedField)
    let promise = new Promise<Array<PaserRecord>>((resolve) => {
      console.log(dataFormConfig.schema, dataFormConfig.dataTable, linkedField, dataFormConfig.rowID)
      this.sqlService.GetAnySingle(dataFormConfig.schema, dataFormConfig.dataTable, linkedField, dataFormConfig.rowID)
        .subscribe((x)=> {
          // console.log(x)
          resolve (x[0])
        })
    })
    return promise
  }
}
