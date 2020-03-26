import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField, MyCubeConstraint, MyCubeComment } from '_models/layer.model';
import { MapConfig, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
import { SDSConfig, SDSStyles } from './SDS.model'
import { StyleService } from './style.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Observable ,  Subject ,  interval } from 'rxjs';
import { SQLService } from '../../../../_services/sql.service';
import { MyCubeService } from '../../../map/services/mycube.service'
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from "ol/layer/Vector";
import VectorSource from 'ol/source/Vector';
import { transform } from 'ol/proj';
import { environment } from '../../../../environments/environment'
import { ModuleInstance } from '_models/module.model';

@Injectable()
export class SDSService {
  public vectorlayer = new VectorLayer()
  public mapConfig: MapConfig
  public layer: UserPageLayer
  public filter: string = 'closed IS Null'
  private expanded = new Subject<boolean>();
  private SDSConfigSubject = new Subject<SDSConfig[]>();
  public sortBy: string = "Address"
  public showSortBy: Boolean
  public layerState: string
  public SDSConfig = new Array<SDSConfig>()
  public userID: number

  constructor(private geojsonservice: geoJSONService,
    protected _http: HttpClient,
    private styleService: StyleService,
    private sqlService: SQLService,
    private myCubeService: MyCubeService,
    private locateStyles: SDSStyles,
    private snackBar: MatSnackBar) {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userID = currentUser && currentUser.userID;
  }
  public SDSUpdateInterval: any


  //loads the SDS Layer
  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.mapConfig = mapConfig
    this.layer = layer
    this.layerState = 'load'
    switch (layer.layer.layerType) {
      case "MyCube": {
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
          this.mapConfig.map.addLayer(this.vectorlayer);
          layer.olLayer = this.vectorlayer
          layer.source = source
        })
        break
      }
      case "Geoserver": {
        return false
      }
    }
    return true
  }

  public styleLayer(layer: UserPageLayer, feature, mode):boolean {
    let stylefunction = ((feature: Feature) => {
      return (this.styleService.styleFunction(feature, mode));
    })
    return true
  }
  // public setReload(SDSConfigID) {
  //   if (this.SDSConfig[SDSConfigID].updateInterval == null) {
  //     this.SDSConfig[SDSConfigID].updateInterval = setInterval(() => {
  //       console.log('reloadLayer Interval')
  //       this.reloadLayer(this.SDSConfig[SDSConfigID].layer);
  //     }, 20000);
  //   }
  // }

  public getLayerfromSDSConfigID(SDSConfig:SDSConfig):UserPageLayer {
    console.log(SDSConfig)
    console.log(this.mapConfig)
    let layer: UserPageLayer
    this.mapConfig.userpagelayers.forEach((x) => {
      console.log(x)
      if(x.userpageinstance.moduleInstanceID == SDSConfig.moduleInstanceID)
      console.log(layer)
      SDSConfig.layer = x
    })
    return layer
  }

  public reloadLayer(layer: UserPageLayer) {
    // console.log('reloadLayer')
    // console.log(layer)
    let layerState: string = 'load'
      if (layer == this.mapConfig.currentLayer) {layerState = 'current'}
      // console.log(layerState)  
    //this.clearFeature(this.mapConfig, this.layer)  //check to see if it's a problem not to have this
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, layerState));
    })
    this.getMyFeatureData(layer).then((data) => {
      this.layer.source.clear();
      if (data[0][0]['jsonb_build_object']['features']) {
        this.setData(data).then(() => {
          this.layer.source.forEachFeature((feat: Feature) => {
            feat.setStyle(stylefunction);
          })
          if (this.layer == this.mapConfig.currentLayer) {
            this.getFeatureList(this.layer)
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

  public saveSDS(SDSConfigID: number): any {
    this.sqlService.addAnyRecord('modules', 'm' + this.SDSConfig[SDSConfigID].moduleInstanceID + 'data', this.SDSConfig[SDSConfigID].linkedField, this.mapConfig.selectedFeature.get('id'))
      .subscribe((x) => {
        let id = x[0][0]['id']
        this.SDSConfig[SDSConfigID].itemData.forEach((x) => {
          if (x.type != 'id' && x.value != null) {
            this.sqlService.UpdateAnyRecord('modules', 'm' + this.SDSConfig[SDSConfigID].moduleInstanceID + 'data', id, x)
              .subscribe((z) => {
                console.log(z)
                this.selectFeature(this.mapConfig.currentLayer, true)
                let snackBarRef = this.snackBar.open('Record saved', '', {
                  duration: 2000
                })
          x.value = null
              })
          }
        })
        let comment = new MyCubeComment
        comment.auto = true
        comment.comment = "Record added by " + this.mapConfig.user.firstName + ' ' + this.mapConfig.user.lastName
        comment.featureid = id
        comment.userid = this.mapConfig.user.ID
        comment.table = 'modules.m' + this.SDSConfig[SDSConfigID].moduleInstanceID + 'log'
        this.SDSLog(comment)
      })
  }

  public updateSDS(SDSConfigID: number): any {
    this.SDSConfig[SDSConfigID].itemData.forEach((x) => {
      if (x.type != 'id') {
        this.sqlService.UpdateAnyRecord('modules', 'm' + this.SDSConfig[SDSConfigID].moduleInstanceID + 'data', this.SDSConfig[SDSConfigID].itemData[0].value, x)
          .subscribe((z) => {
            this.selectFeature(this.mapConfig.currentLayer, true)
            let snackBarRef = this.snackBar.open('Record updated', '', {
              duration: 4000
            });
          })
      }
    })
    let comment = new MyCubeComment
    comment.auto = true
    comment.comment = "Record updated by " + this.mapConfig.user.firstName + ' ' + this.mapConfig.user.lastName
    comment.featureid = this.SDSConfig[SDSConfigID].itemData[0].value
    comment.userid = this.mapConfig.user.ID
    comment.table = 'modules.m' + this.SDSConfig[SDSConfigID].moduleInstanceID + 'log'
    this.SDSLog(comment)
  }

  public deleteSDS(SDSConfigID: number): any {
    this.sqlService.deleteAnyRecord('modules', 'm' + this.SDSConfig[SDSConfigID].moduleInstanceID + 'data', this.SDSConfig[SDSConfigID].itemData[0].value)
      .subscribe((x) => {
        console.log(x)
        this.selectFeature(this.mapConfig.currentLayer)
        let snackBarRef = this.snackBar.open('Record deleted', '', {
          duration: 4000
        });
        this.SDSConfig[SDSConfigID].tab = 'List'
      })
    let comment = new MyCubeComment
    comment.auto = true
    comment.comment = "Record deleted by " + this.mapConfig.user.firstName + ' ' + this.mapConfig.user.lastName
    comment.featureid = this.SDSConfig[SDSConfigID].itemData[0].value
    comment.userid = this.mapConfig.user.ID
    comment.table = 'modules.m' + this.SDSConfig[SDSConfigID].moduleInstanceID + 'log'
    this.SDSLog(comment)
  }

  private getFeatureList(layer?: UserPageLayer): boolean {
    //this has issues, as the "name" needs to be dinamic.  This really needs to be able to return false so map.service can create the featurelist.
    switch (layer.layer.layerType) {
      case "MyCube": {
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
          this.mapConfig.featureList = tempList.slice(0, k)
          this.sortByFunction()
        } catch (error) {
          console.error(error);
          clearInterval(this.SDSUpdateInterval);
        }
        break
      }
    }
    return true
  }

  public setCurrentLayer(layer: UserPageLayer): boolean {
    this.showSortBy = true
    // this.layerState = 'current'
    switch (layer.layer.layerType) {
      case "MyCube": {
        this.reloadLayer(layer)
        this.mapConfig.editmode = true //probably need to set this as a permission and not always true
        break
      }
    }
    //Set the expanded tag
    this.SDSConfig.forEach((x) => {
      if (x.moduleSettings['settings'][0]['setting']['value'] == layer.layer.ID) {
        x.expanded = true
        x.visible = true
      }
    })
    return true
  }

  public unsetCurrentLayer(layer: UserPageLayer): boolean {
    // this.layerState = 'load'
    // switch (layer.layer.layerType) {
    //   case "MyCube": {
    //     this.reloadLayer(layer)
    //     this.showSortBy = false
    //   }
    // }
    this.SDSConfig.forEach((x) => {
      console.log(x)
      if (x.moduleSettings['settings'][0]['setting']['value'] == layer.layer.ID) {
        x.expanded = false
        x.visible = false
        x.layerState = "load"
    switch (layer.layer.layerType) {
      case "MyCube": {
        this.reloadLayer(layer)
        this.showSortBy = false
      }
    }
      }
    })
    // this.sendexpanded(false)
    return true
  }

  public unloadLayer(layer: UserPageLayer): boolean {
    clearInterval(this.SDSUpdateInterval)
    return true
  }

  public selectFeature(layer: UserPageLayer, aftersave?: boolean): boolean {
    this.mapConfig.showDeleteButton = true
    let instanceID: number
    this.mapConfig.userpageinstances.forEach((x) => {
      if (layer.userPageInstanceID == x.ID) {
          instanceID = x.moduleInstanceID
      }
    })
    if (this.mapConfig.selectedFeature) {
      let SDSConfigID: number
      let i: number = 0
      this.SDSConfig.forEach((x) => {
        if (x.moduleInstanceID == instanceID) { SDSConfigID = i }
        i = i + 1
      })
      this.clearForm(SDSConfigID)
      this.sqlService.GetAnySingle('modules.m' + this.SDSConfig[SDSConfigID].moduleInstanceID + 'data', this.SDSConfig[SDSConfigID].moduleSettings['settings'][2]['setting']['value'], this.mapConfig.selectedFeature.get('id'))
        .subscribe((data: any) => {
          console.log(data)
          this.SDSConfig[SDSConfigID].list = data[0]
          this.SDSConfig[SDSConfigID].list.forEach((x) => {
            if (x[this.SDSConfig[SDSConfigID].label] == null) {
              x[this.SDSConfig[SDSConfigID].label] = "(blank)"
            }
          })
          //this.SDSConfig[SDSConfigID].list.sort()  //this needs to be fixed.
          if (aftersave) {
            this.SDSConfig[SDSConfigID].tab = 'List'
          }
          else{
            this.SDSConfig[SDSConfigID].tab = 'Input'
          }
        })
    }
    if (layer.layer.layerType == "MyCube") { this.mapConfig.selectedFeature.setStyle(this.locateStyles.selected) }
    return false
  }

  public clearForm(SDSConfigID: number) {
    this.SDSConfig[SDSConfigID].selectedItem = null
    this.SDSConfig[SDSConfigID].editRecordDisabled = true
    this.SDSConfig[SDSConfigID].itemData.forEach((x) => {
      x.value = null
    })
  }

  public clearFeature(layer: UserPageLayer): boolean {
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, 'current'));
    })
    let instanceID: number
    this.mapConfig.userpageinstances.forEach((x) => {
      if (layer.userPageInstanceID == x.ID) {
        instanceID = x.moduleInstanceID
      }
    })
    let SDSConfigID: number
    let i: number = 0
    this.SDSConfig.forEach((x) => {
      if (x.moduleInstanceID == instanceID) { SDSConfigID = i }
      i = i + 1
    })
    //fix this stuff below..
    this.SDSConfig[SDSConfigID].list = null
    this.myCubeService.clearMyCubeData()
    this.SDSConfig[SDSConfigID].tab = 'List'
    this.clearForm(SDSConfigID)

    if (this.mapConfig.selectedFeature) { this.mapConfig.selectedFeature.setStyle(stylefunction); this.mapConfig.selectedFeature = null; this.SDSConfig[0].selectedItem = null }
    return true
  }

  public styleSelectedFeature(layer: UserPageLayer): boolean {
    clearInterval(this.SDSUpdateInterval)
    return true
  }

  public unstyleSelectedFeature(layer: UserPageLayer): boolean {
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, 'current'));
    })
    this.mapConfig.selectedFeature.setStyle(stylefunction)
    if (!this.SDSUpdateInterval == null) {
      this.SDSUpdateInterval = setInterval(() => {
        this.reloadLayer(layer);
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

  getSDSConfig(): Observable<any> {
    return this.SDSConfigSubject.asObservable();
  }

  sendSDSConfig() {
    this.SDSConfigSubject.next(this.SDSConfig)
  }
  sendexpanded(expanded: boolean) {
    this.expanded.next(expanded)
  }

  getSchema(schema, table, SDSConfig: SDSConfig): Promise<MyCubeField[]> {
    let promise = new Promise<MyCubeField[]>(resolve => {
      this.sqlService.GetSchema('modules', 'm' + table + 'data')
        .subscribe((data) => {
          SDSConfig.itemData = data[0]
          this.sqlService.getConstraints('modules', 'm' + table + 'data')
            .subscribe((constraints) => {
              SDSConfig.itemData = this.myCubeService.setConstraints(SDSConfig.itemData, constraints)
              resolve(SDSConfig.itemData)
            })
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
  SDSLog(comment: MyCubeComment) {
    this.sqlService.addAnyCommentWithoutGeom(comment)
      .subscribe((x) => {
      })
  }

  getSDSLog(SDSConfigID: number, table:string, id:string) {
    let SDSLog: MyCubeComment[]
    this.sqlService.GetAnySingle(table, 'featureid', id)
    .subscribe((x) => {
      this.SDSConfig[SDSConfigID].selectedItemLog = x[0]
    })
  }
}
