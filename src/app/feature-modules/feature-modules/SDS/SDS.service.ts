import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField, MyCubeConstraint } from '_models/layer.model';
import { MapConfig, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
import { SDSConfig, SDSStyles } from './SDS.model'
import { StyleService } from './style.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import { SQLService } from '../../../../_services/sql.service';
import { Subject } from 'rxjs/Subject';
import { MyCubeService } from '../../../map/services/mycube.service'
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from "ol/layer/Vector";
import VectorSource from 'ol/source/Vector';
import { transform } from 'ol/proj';
import { environment } from '../../../../environments/environment'

@Injectable()
export class SDSService {
  public vectorlayer = new VectorLayer()
  public mapConfig: MapConfig
  public layer: UserPageLayer
  public filter: string = 'closed IS Null'
  private expanded = new Subject<boolean>();
  public sortBy: string = "Address"
  public showSortBy: Boolean
  public layerState: string
  public SDSConfig = new SDSConfig

  constructor(private geojsonservice: geoJSONService,
    protected _http: HttpClient,
    private styleService: StyleService,
    private sqlService: SQLService,
    private myCubeService: MyCubeService,
    private locateStyles: SDSStyles,
    private snackBar: MatSnackBar) { }
  public SDSUpdateInterval: any


  //loads the SDS Layer
  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.layer = layer
    this.layerState = 'load'
    this.mapConfig = mapConfig
    this.clearFeature(this.mapConfig, this.layer)
    //Need to provide for clustering if the number of objects gets too high

    let stylefunction = ((feature: Feature) => {
      return (this.styleService.styleFunction(feature, 'load'));
    })
    let source = new VectorSource({
      format: new GeoJSON()
    })

    this.getMyFeatureData(layer).then((data) => {
      if (data[0][0]['jsonb_build_object']['features']) {
        source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
      }
      // var clusterSource = new ol.source.Cluster({
      //   distance: 90,
      //   source: source
      // });
      this.vectorlayer = new VectorLayer({
        source: source,
        style: stylefunction
      });
      this.vectorlayer.setVisible(layer.defaultON);
      mapConfig.map.addLayer(this.vectorlayer);
      layer.olLayer = this.vectorlayer
      layer.source = source
    })
    if (this.SDSUpdateInterval == null) {
      this.SDSUpdateInterval = setInterval(() => {
        console.log('loadLayer')
        this.reloadLayer();
      }, 20000);
    }
    return true
  }

  public reloadLayer() {
    //this.clearFeature(this.mapConfig, this.layer)  //check to see if it's a problem not to have this
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, this.layerState));
    })
    this.getMyFeatureData(this.layer).then((data) => {
      this.layer.source.clear();
      if (data[0][0]['jsonb_build_object']['features']) {
        this.setData(data).then(() => {
          this.layer.source.forEachFeature((feat: Feature) => {
            feat.setStyle(stylefunction);
          })
          if (this.layer == this.mapConfig.currentLayer) {
            this.getFeatureList(this.mapConfig, this.layer)
          }
        })
      }
    })
  }

  private setData(data): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.layer.source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']))
      resolve()
    })
    return promise;
  }

  public saveSDS(): any {
    console.log('Saving Record')
    this.sqlService.addAnyRecord('modules', 'm' + this.SDSConfig.moduleInstanceID + 'data', this.SDSConfig.linkedField, this.mapConfig.selectedFeature.get('id'))
      .subscribe((x) => {
        console.log(x[0][0])
        let id = x[0][0]['id']
        this.SDSConfig.itemData.forEach((x) => {
          if (x.type != 'id') {
            this.sqlService.UpdateAnyRecord('modules', 'm' + this.SDSConfig.moduleInstanceID + 'data', id, x)
              .subscribe((z) => {
                console.log(z)
                this.selectFeature(this.mapConfig, this.layer)
                let snackBarRef = this.snackBar.open('Record saved', '', {
                  duration: 4000
                });
              })
          }
        })
      })
  }

  public updateSDS(): any {
    console.log(this.SDSConfig.itemData)
    this.SDSConfig.itemData.forEach((x) => {
      if (x.type != 'id') {
        this.sqlService.UpdateAnyRecord('modules', 'm' + this.SDSConfig.moduleInstanceID + 'data', this.SDSConfig.itemData[0].value, x)
          .subscribe((z) => {
            console.log(z)
            this.selectFeature(this.mapConfig, this.layer)
            let snackBarRef = this.snackBar.open('Record updated', '', {
              duration: 4000
            });
          })
      }
    })
  }

  public deleteSDS(): any {
    this.sqlService.deleteAnyRecord('modules', 'm' + this.SDSConfig.moduleInstanceID + 'data', this.SDSConfig.itemData[0].value)
      .subscribe((x) => {
        console.log(x)
        this.selectFeature(this.mapConfig, this.layer)
        let snackBarRef = this.snackBar.open('Record deleted', '', {
          duration: 4000
        });
      })
  }

  private getFeatureList(mapConfig?, layer?: UserPageLayer): boolean {
    //this has issues, as the "name" needs to be dinamic.  This really needs to be able to return false so map.service can create the featurelist.
    let k: number = 0;
    let tempList = new Array<featureList>();
    try {
      layer.source.forEachFeature((x: Feature) => {
        let i = layer.source.getFeatures().findIndex((j) => j == x);

        let fl = new featureList;
        fl.id = x.get('id')
        fl.label = x.get("name") //need to make this dynamic
        fl.feature = x
        if (i > -1 && fl != null) {
          tempList.push(fl)
          k += 1
        }
      })
      mapConfig.featureList = tempList.slice(0, k)
      this.sortByFunction()
    } catch (error) {
      console.error(error);
      clearInterval(this.SDSUpdateInterval);
    }
    return true
  }

  public setCurrentLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.showSortBy = true
    this.layerState = 'current'
    this.reloadLayer()
    this.sendexpanded(true)
    this.mapConfig.editmode = true
    return true
  }

  public unsetCurrentLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.layerState = 'load'
    this.reloadLayer()
    this.sendexpanded(false)
    this.showSortBy = false
    return true
  }

  public unloadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    clearInterval(this.SDSUpdateInterval)
    return true
  }

  public selectFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    //This will only work for myCube layers.  Another method will need to be created for WMS layers.
    this.mapConfig.userpageinstances.forEach((x) => {
      if (x.module_instance.module.identity = "SDS") {
        console.log(mapConfig.selectedFeature.get('id'))
        console.log(this.SDSConfig.moduleSettings['settings'][2]['setting']['value'])
        this.sqlService.GetAnySingle('modules.m' + x.moduleInstanceID + 'data', this.SDSConfig.moduleSettings['settings'][2]['setting']['value'], mapConfig.selectedFeature.get('id'))
          .subscribe((data: any) => {
            console.log(data)
            this.SDSConfig.list = data[0]
            this.SDSConfig.list.forEach((x) => {
              console.log(x[this.SDSConfig.label])
              if (x[this.SDSConfig.label] == null) {
                x[this.SDSConfig.label] = "(blank)"
              }
            })
            this.SDSConfig.list.sort()  //this needs to be fixed.
            this.SDSConfig.tab = 'List'
          })
      }
    })
    this.mapConfig.selectedFeature.setStyle(this.locateStyles.selected)
    return false
  }

  public clearFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, 'current'));
    })
    this.SDSConfig.list = null
    this.myCubeService.clearMyCubeData()
    this.SDSConfig.tab = 'List'
    if (mapConfig.selectedFeature) { this.mapConfig.selectedFeature.setStyle(stylefunction); mapConfig.selectedFeature = null; this.SDSConfig.selectedItem = null }
    return true
  }

  public styleSelectedFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    console.log('styleSelectedFeature')
    clearInterval(this.SDSUpdateInterval)
    return true
  }

  public unstyleSelectedFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, 'current'));
    })
    this.mapConfig.selectedFeature.setStyle(stylefunction)
    if (!this.SDSUpdateInterval == null) {
      this.SDSUpdateInterval = setInterval(() => {
        console.log(this.SDSUpdateInterval)
        this.reloadLayer();
      }, 20000);
    }
    return true
  }

  public styleFunction(styleToUse: ol.style.Style): ol.style.Style {
    let style = styleToUse
    return style;

  }

  getExpanded(): Observable<any> {
    return this.expanded.asObservable();
  }

  sendexpanded(expanded: boolean) {
    this.expanded.next(expanded)
  }

  public getData(table, id): Promise<any> {
    this.SDSConfig.tab = 'Item'
    let promise = new Promise(resolve => {
      console.log("Getting Schema")
      this.getsingle('modules.m' + table + 'data', id).then(() => { resolve(this.SDSConfig.itemData) })

    })
    return promise
  }

  public findLinkedID(element: MyCubeField, index, array) {
    console.log(this.SDSConfig)
    return (element.value == this.SDSConfig.moduleSettings['settings'][2]['setting']['value'])
  }

  getSchema(schema, table): Promise<MyCubeField[]> {
    let promise = new Promise<MyCubeField[]>(resolve => {
      console.log(table)
      this.sqlService.GetSchema('modules', 'm' + table + 'data')
        .subscribe((data) => {
          console.log(data)
          this.SDSConfig.itemData = data[0]
          this.sqlService.getConstraints('modules', 'm' + table + 'data')
            .subscribe((constraints) => {
              this.SDSConfig.itemData = this.myCubeService.setConstraints(this.SDSConfig.itemData, constraints)
              resolve(this.SDSConfig.itemData)
            })
        })

    })
    return promise
  }

  getsingle(table, id): Promise<any> {
    let promise = new Promise(resolve => {
      this.sqlService.GetSingle(table, id)
        .subscribe((sdata: JSON) => {
          console.log(sdata)
          let z = 0
          for (var key in sdata[0][0]) {
            if (sdata[0][0].hasOwnProperty(key)) {
              if (z != 0) { this.SDSConfig.itemData[z].value = sdata[0][0][key] }
              if (this.SDSConfig.itemData[z].type == 'date') {
                console.log('fixing date')
                this.SDSConfig.itemData[z].value += environment.localez
              } //this is required because the datepicker converts a date (with no locale) to local and it will lose a day with this. 
              z++
            }
          }
          resolve()
        })
    })
    return promise
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

  public flipSortBy() {
    switch (this.sortBy) {
      case "Priority": {
        this.sortBy = "Address"
        break
      }
      case "Address": {
        this.sortBy = "Contractor"
        break
      }
      case "Contractor": {
        this.sortBy = "Priority"
      }
    }
    this.sortByFunction()
  }

  public sortByFunction() {
    if (this.sortBy == "Address") { //this is really by priority
      this.mapConfig.featureList.sort((a, b): number => {
        if (a.label > b.label) {
          return 1;
        }
        if (a.label < b.label) {
          return -1;
        }
        return 0;
      })
    }
    if (this.sortBy == "Priority") { //this is really by address
      this.mapConfig.featureList.sort((a, b): number => {
        if (a.feature.get('sdate') + ' ' + a.feature.get('stime') > b.feature.get('sdate') + ' ' + b.feature.get('stime')) {
          return 1;
        }
        if (a.feature.get('sdate') + ' ' + a.feature.get('stime') < b.feature.get('sdate') + ' ' + b.feature.get('stime')) {
          return -1;
        }
        return 0;
      })
    }
    if (this.sortBy == "Contractor") {
      this.mapConfig.featureList.sort((a, b): number => {
        if (a.feature.get('company') > b.feature.get('company')) {
          return 1;
        }
        if (a.feature.get('company') < b.feature.get('company')) {
          return -1;
        }
        return 0;
      })
    }
  }
}