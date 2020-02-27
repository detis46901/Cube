import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField } from '_models/layer.model';
import { Group } from '_models/group.model'
import { ModuleInstance } from '_models/module.model'
import { MapConfig, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
import { workOrder, WOConfig, sortType } from './WO.model'
import { StyleService } from './style.service'
import { MatSnackBar } from '@angular/material/snack-bar';
//http dependancies
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse, HttpParams, HttpRequest } from '@angular/common/http'
import { Observable as Ob } from 'rxjs/Observable';
import { SQLService } from '../../../../_services/sql.service';
import { Subject } from 'rxjs/Subject';
import { MyCubeService } from '../../../map/services/mycube.service'
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from "ol/layer/Vector";
import VectorSource from 'ol/source/Vector';
import { User } from '_models/user.model';
import { defaults as defaultInteractions, Modify, Draw } from 'ol/interaction';
import * as olProj from 'ol/proj';
import { GroupService } from '../../../../_services/_group.service';
import { UserService } from '../../../../_services/_user.service';
import Observable from 'ol/Observable';
import { cloneDeep } from 'lodash'

@Injectable()
export class WOService {
  public mapConfig: MapConfig
  private expanded = new Subject<boolean>();
  public WOConfig = new WOConfig
  public tempfeat: Feature
  public priority: string[] = ['Normal', 'Emergency', 'High', 'Low']



  constructor(private geojsonservice: geoJSONService,
    protected _http: HttpClient,
    private styleService: StyleService,
    private sqlService: SQLService,
    private myCubeService: MyCubeService,
    private snackBar: MatSnackBar,
    private groupService: GroupService,
    private userService: UserService) { }

  //loads the work order data
  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.WOConfig.layer = layer
    this.WOConfig.layerState = 'load'
    this.mapConfig = mapConfig
    this.clearFeature(this.mapConfig, this.WOConfig.layer)
    //Need to provide for clustering if the number of objects gets too high
    let stylefunction = ((feature: Feature) => {
      return (this.styleService.styleFunction(feature, 'load'));
    })
    let source = new VectorSource({
      format: new GeoJSON()
    })
    this.getWOData(layer).then((data) => {
      if (data[0][0]['jsonb_build_object']['features']) {
        source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
      }
      // var clusterSource = new ol.source.Cluster({
      //   distance: 90,
      //   source: source
      // });
      let vectorlayer = new VectorLayer({
        source: source,
        style: stylefunction
      });
      vectorlayer.setVisible(layer.defaultON);
      mapConfig.map.addLayer(vectorlayer);
      layer.olLayer = vectorlayer
      layer.source = source
    })
    return true
  }

  public getConfig(instance: ModuleInstance) {
    this.WOConfig.WOTypes = instance.settings['settings'][0]['setting']['WOType']
    this.WOConfig.assignedTo = instance.settings['settings'][1]['setting']['AssignedTo']
    this.WOConfig.assignedTo.forEach((x) => {
      if (x.name.startsWith('G') == true) {
        this.groupService.GetSingle(+x.name.substr(1))
          .subscribe((y: Group) => {
            x.fullName = y.name
          })
      }
      else {
        this.userService.GetSingle(+x.name.substr(1))
          .subscribe((y: User) => {
            x.fullName = y.firstName + " " + y.lastName
          })
      }
    })
  }

  private createInterval() {
    clearInterval(this.WOConfig.layer.updateInterval)
    this.WOConfig.layer.updateInterval = setInterval(() => {
      this.reloadLayer();
    }, 20000);
  }

  public reloadLayer() {
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, this.WOConfig.layerState));
    })
    this.getWOData(this.WOConfig.layer).then((data) => {
      this.WOConfig.layer.source.clear();
      if (data[0][0]['jsonb_build_object']['features']) {
        this.setData(data).then(() => {
          this.WOConfig.layer.source.forEachFeature((feat: Feature) => {
            feat.setStyle(stylefunction);
            if (this.mapConfig.selectedFeature && feat.get('id') == this.mapConfig.selectedFeature.get('id')) {feat.setStyle(this.styleService.styleFunction(feat, 'selected'))}
          })
          if (this.WOConfig.layer == this.mapConfig.currentLayer) {
            this.getFeatureList(this.mapConfig, this.WOConfig.layer)
          }
        })
      }
    })
  }

  private setData(data): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.WOConfig.layer.source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']))
      resolve()
    })
    return promise;
  }

  private getFeatureList(mapConfig?, layer?): boolean {
    if (!this.WOConfig.sortType.name) { this.WOConfig.sortType.name = 'address'; this.WOConfig.sortType.field = 'address' }
    let k: number = 0;
    let tempList = new Array<featureList>();
    try {
      layer.source.forEachFeature((x: Feature) => {
        let i = layer.source.getFeatures().findIndex((j) => j == x);
        let fl = new featureList;
        fl.id = x.get('id')
        fl.label = x.get(this.WOConfig.sortType.field)
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
      clearInterval(this.WOConfig.layer.updateInterval);
    }
    return true
  }

  public setCurrentLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.WOConfig.layerState = 'current'
    this.reloadLayer()
    this.sendexpanded(true)
    this.mapConfig.editmode = true
    this.mapConfig.showStyleButton = false
    return true
  }

  public unsetCurrentLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.WOConfig.layerState = 'load'
    this.reloadLayer()
    this.sendexpanded(false)
    return true
  }

  public unloadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    return true
  }

  public selectFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    if (this.WOConfig.Mode == "Add") { return true }
    if (this.WOConfig.Mode == "Edit") { return true }
    clearInterval(this.WOConfig.layer.updateInterval)
    this.WOConfig.layer.updateInterval = null
    this.sqlService.GetSingle('mycube.t' + this.WOConfig.layer.layerID, mapConfig.selectedFeature.get('id'))
      .subscribe((data) => {
        //stuff is going to go in here.
        this.WOConfig.selectedWO = data[0][0]
        this.WOConfig.tab = "Details"
      })
    this.mapConfig.selectedFeature.setStyle(this.styleService.styleFunction(this.mapConfig.selectedFeature, "selected"))
    this.myCubeService.getComments(this.WOConfig.layer.layerID, mapConfig.selectedFeature.get('id'))
      .subscribe((data) => {
        this.WOConfig.selectedWOComments = data[0]
      })
    return true
  }

  public clearFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    if (this.WOConfig.Mode == "Add") { return true }
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, 'current'));
    })
    this.createInterval()
    this.myCubeService.clearMyCubeData()
    if(mapConfig.currentLayer.olLayer) {mapConfig.currentLayer.source.forEachFeature((x: Feature) => {
      x.setStyle(stylefunction)
    })
  }
    if (mapConfig.selectedFeature && this.WOConfig.Mode == "None") {
      this.mapConfig.selectedFeature.setStyle(stylefunction)
      this.WOConfig.selectedWO = new workOrder
      this.WOConfig.tab = "Closed"
      this.mapConfig.selectedFeature = null
    }
    return true
  }

  public styleSelectedFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.mapConfig.selectedFeature.setStyle(this.styleService.styleFunction(this.mapConfig.selectedFeature, 'selected'))
    return true
  }

  public unstyleSelectedFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    // let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
    //   return (this.styleService.styleFunction(feature, 'current'));
    // })
    // this.mapConfig.selectedFeature.setStyle(stylefunction)
    // this.mapConfig.selectedFeature = null
    return false
  }

  public draw(mapConfig: MapConfig, layer: UserPageLayer, featuretype: any): boolean {
    if (this.WOConfig.Mode == "Add") { return true }
    this.WOConfig.Mode = "Add"
    let src = new VectorSource();
    let lyr = new VectorLayer({
      source: src
    });
    let drawInteraction = new Draw({
      type: featuretype,
      source: src,
    })
    this.WOConfig.vectorSource = src
    this.WOConfig.vectorLayer = lyr
    this.mapConfig.map.addLayer(this.WOConfig.vectorLayer);
    let modkey: any = this.mapConfig.map.addInteraction(drawInteraction);
    drawInteraction.once('drawend', (e) => {
      this.WOConfig.Mode = "Add"
      this.mapConfig.drawMode = ''
      this.mapConfig.selectedFeature = e.feature
      this.mapConfig.selectedFeatures.clear()
      this.mapConfig.selectedFeatures.push(e.feature)
      this.fillAddress()
      e.feature.setStyle(this.styleService.styleFunction(this.mapConfig.selectedFeature, 'selected'))
      this.WOConfig.modify = new Modify({ features: this.mapConfig.selectedFeatures });
      this.mapConfig.map.addInteraction(this.WOConfig.modify);
      this.WOConfig.selectedWO = new workOrder
      this.WOConfig.selectedWO.createdBy = this.mapConfig.user.ID
      this.WOConfig.selectedWO.feature = e.feature
      this.WOConfig.tab = "Details"
      this.WOConfig.modkey = this.WOConfig.modify.on('modifyend', (e: any) => {
        this.fillAddress()
      })
      this.mapConfig.map.removeInteraction(drawInteraction);
    })
    return true
  }

  createWorkOrder(complete?:boolean) {
      let featureID: number
      let featurejson = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.WOConfig.selectedWO.feature);
      this.sqlService.addRecord(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson))
        .subscribe((data) => {
          try { featureID = data[0][0].id }
          catch (e) {
            this.sqlService.fixGeometry(this.mapConfig.currentLayer.layer.ID)
              .subscribe((x) => {
              })
          }
          this.mapConfig.selectedFeature.setId(featureID);
          this.mapConfig.selectedFeature.set('id', featureID)
          this.mapConfig.selectedFeature.setProperties(data[0]);
          this.updateFields(featureID, featurejson, "Work Order Created")
          let snackBarRef = this.snackBar.open('Work order was inserted.', '', {
            duration: 4000
          });
        })
  }

  public updateFields(featureID, featurejson, comment?: string) {
    if (!comment) { comment = 'Object Created' }
    this.myCubeService.createAutoMyCubeComment(true, comment, featureID, this.mapConfig.currentLayer.layer.ID, this.mapConfig.user.ID, featurejson['geometry'])
    let mcf = new MyCubeField
    mcf.field = "createdBy"
    mcf.type = "text"
    mcf.value = this.mapConfig.user.ID
    this.updateField(featureID, mcf);
    mcf.field = "description"
    mcf.value = this.WOConfig.selectedWO.description
    if (mcf.value) { this.updateField(featureID, mcf) };
    mcf.field = "assignedTo"
    mcf.value = this.WOConfig.selectedWO.assignedTo
    if (mcf.value) { this.updateField(featureID, mcf) }
    mcf.field = "address"
    mcf.value = this.WOConfig.selectedWO.address
    if (mcf.value) { this.updateField(featureID, mcf) }
    mcf.field = "WOTypeID"
    mcf.value = this.WOConfig.selectedWO.WOTypeID
    if (mcf.value) { this.updateField(featureID, mcf) }
    mcf.field = "priority"
    mcf.value = this.WOConfig.selectedWO.priority
    if (mcf.value) { this.updateField(featureID, mcf) }
    let currentYear = (new Date()).getFullYear()
    this.geojsonservice.GetSome(this.mapConfig.currentLayer.layer.ID, `"WONumber" Like '` + currentYear + `%25'`)
      .subscribe((data: any) => {
        let array = new Array<any>()
        array = data[0][0]['jsonb_build_object']['features']
        let latestWO: string = array.slice(array.length - 1, array.length)[0]['properties']['WONumber']
        let currentWONumber: number = +latestWO.split('-')[1] + 1
        mcf.field = "WONumber"
        mcf.value = currentYear + "-" + currentWONumber
        this.updateField(featureID, mcf)
          this.mapConfig.map.removeLayer(this.WOConfig.vectorLayer)
          this.WOConfig.vectorSource = new VectorSource
          this.WOConfig.vectorLayer = new VectorLayer
          this.WOConfig.Mode = "None"
          this.mapConfig.selectedFeatures.clear()
        this.clearFeature(this.mapConfig, this.mapConfig.currentLayer)
        this.getFeatureList(this.mapConfig, this.mapConfig.currentLayer);
      })
    if (!this.WOConfig.selectedWO.created) {
      mcf.field = "created"
      mcf.type = "integer"
      mcf.value = "NOW() AT TIME ZONE 'America/New_york'"
      this.updateField(featureID, mcf)
    }
    //this.reloadLayer()
    this.mapConfig.map.removeInteraction(this.WOConfig.modify)
  }

  public cancelAddWorkOrder() {
    this.mapConfig.map.removeLayer(this.WOConfig.vectorLayer)
    this.mapConfig.map.removeInteraction(this.WOConfig.modify)
    this.WOConfig.vectorSource = new VectorSource
    this.WOConfig.vectorLayer = new VectorLayer
    this.WOConfig.Mode = "None"
    this.mapConfig.selectedFeatures.clear()
    this.clearFeature(this.mapConfig, this.mapConfig.currentLayer)
  }

  public editWorkOrder() {
    this.WOConfig.Mode = "Edit"
    this.mapConfig.selectedFeatures.clear()
    this.WOConfig.editWO = cloneDeep(this.WOConfig.selectedWO)
    this.WOConfig.editWO.feature = this.mapConfig.selectedFeature.clone()
    this.mapConfig.selectedFeatures.push(this.mapConfig.selectedFeature)
    this.WOConfig.modify = new Modify({ features: this.mapConfig.selectedFeatures });
    this.WOConfig.modkey = this.WOConfig.modify.on('modifyend', (e: any) => {
      this.fillAddress()
    })
    this.mapConfig.map.addInteraction(this.WOConfig.modify);
  }

  public cancelEditWorkOrder() {
    this.mapConfig.map.removeInteraction(this.WOConfig.modify)
    this.mapConfig.currentLayer.source.removeFeature(this.mapConfig.selectedFeature)
    this.mapConfig.currentLayer.source.addFeature(this.WOConfig.editWO.feature)
    this.WOConfig.Mode = "None"
    this.clearFeature(this.mapConfig, this.mapConfig.currentLayer)
    this.reloadLayer()
  }

  public saveWorkOrder() {
    this.WOConfig.Mode = "None"
    let featureID = this.mapConfig.selectedFeature.getId()
    let featurejson = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature);
    this.geojsonservice.updateGeometry(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson)).subscribe((data) => { })
    this.updateFields(featureID, featurejson, "Work Order Updated")
    let snackBarRef = this.snackBar.open('Work order was updated.', '', {
      duration: 4000
    });
  }

  public assignWorkOrder() {
    this.WOConfig.tab = "Details"
    this.WOConfig.Mode = "None"
    let featureID = +this.mapConfig.selectedFeature.getId()
    let featurejson = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature);
    this.geojsonservice.updateGeometry(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson)).subscribe((data) => {})
    let mcf = new MyCubeField
    mcf.field = "assignedTo"
    mcf.type = "text"
    mcf.value = this.WOConfig.selectedWO.assignedTo
    let assignedtoName = this.WOConfig.assignedTo.find((x) => x.name == this.WOConfig.selectedWO.assignedTo)
    this.updateField(featureID, mcf)
    if (this.WOConfig.selectedWO.assignNote) { this.myCubeService.createAutoMyCubeComment(true, this.WOConfig.selectedWO.assignNote, featureID, this.mapConfig.currentLayer.layerID, this.mapConfig.user.ID).then((x) => {}) }
    this.myCubeService.createAutoMyCubeComment(true, "Work Order assigned to " + assignedtoName.fullName, featureID, this.mapConfig.currentLayer.layerID, this.mapConfig.user.ID)
    let snackBarRef = this.snackBar.open('Work order was assigned.', '', {
      duration: 4000
    });
    this.selectFeature(this.mapConfig, this.mapConfig.currentLayer)
  }

  public deleteWorkOrder() {
    let didUndo: boolean = false
    let snackBarRef = this.snackBar.open('Word Order Deleted', 'Undo', {
      duration: 4000
    });
    let feat: Feature = this.mapConfig.selectedFeature
    this.mapConfig.currentLayer.source.removeFeature(this.mapConfig.selectedFeature)
    snackBarRef.afterDismissed().subscribe((x) => {
      if (!didUndo) {
        this.myCubeService.Delete(this.mapConfig.currentLayer.layer.ID, feat.getId()).subscribe((x) => {
          //this.reloadLayer()
          //this.clearFeature(this.mapConfig, this.mapConfig.currentLayer)
        })
        this.myCubeService.createAutoMyCubeComment(true, this.WOConfig.selectedWO.assignNote, this.WOConfig.selectedWO.id, this.mapConfig.currentLayer.layerID, this.mapConfig.user.ID)
        this.WOConfig.Mode = 'None'
      }
      else {
        this.WOConfig.tab = "Details"
      }
    })
    snackBarRef.onAction().subscribe((x) => {
      let newSnackBarRef = this.snackBar.open("Undone", '', { duration: 4000 })
      didUndo = true
      this.mapConfig.currentLayer.source.addFeature(feat)
    })
    this.WOConfig.Mode = 'None'
    this.WOConfig.tab = "Closed"
  }

  CreateCompleteWorkOrder() {

  }

  completeWorkOrder() {
    // this.WOConfig.editWO = cloneDeep(this.WOConfig.selectedWO)
    // this.WOConfig.editWO.feature = this.mapConfig.selectedFeature.clone()
    // console.log(this.WOConfig.editWO.feature.getId())
    // console.log(this.mapConfig.selectedFeature.getId())
    let didUndo: boolean = false
    let snackBarRef = this.snackBar.open('Word Order Completed', 'Undo', {
      duration: 4000
    });
    let feat: Feature = this.mapConfig.selectedFeature
    this.mapConfig.currentLayer.source.removeFeature(this.mapConfig.selectedFeature)
    snackBarRef.afterDismissed().subscribe((x) => {
      if (!didUndo) {
        if (this.WOConfig.editWO.assignNote) { this.myCubeService.createAutoMyCubeComment(true, this.WOConfig.selectedWO.assignNote, this.WOConfig.selectedWO.id, this.mapConfig.currentLayer.layerID, this.mapConfig.user.ID) }
        this.WOConfig.Mode = 'None'
        let mcf = new MyCubeField
        mcf.field = "completed"
        mcf.type = "integer"
        mcf.value = "NOW() AT TIME ZONE 'America/New_york'"
        this.updateField(+feat.getId(), mcf)
        //this.reloadLayer()
      }
      else {
        this.WOConfig.tab = "Complete"
      }
    })
    this.WOConfig.tab = "Closed"
    snackBarRef.onAction().subscribe((x) => {
      let newSnackBarRef = this.snackBar.open("Undone", '', { duration: 4000 })
      didUndo = true
      this.mapConfig.currentLayer.source.addFeature(feat)
    })
  }

  private updateField(featureID: number, mcf: MyCubeField) {
    this.sqlService.UpdateAnyRecord('mycube', 't' + this.mapConfig.currentLayer.layerID, featureID.toString(), mcf)
      .subscribe((x) => {
        this.reloadLayer()
      });
  }

  getExpanded(): Ob<any> {
    return this.expanded.asObservable();
  }

  sendexpanded(expanded: boolean) {
    this.expanded.next(expanded)
  }

  private getWOData(layer): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.geojsonservice.GetSome(layer.layer.ID, this.WOConfig.filter)
        .subscribe((data: any) => {
          resolve(data);
        })
    })
    return promise;
  }

  public fillAddress() {
    let httpP = new HttpParams()
    let latlng: string
    let coord = new Array<number>()
    coord.push(this.mapConfig.selectedFeature.getGeometry().getExtent()[0])
    coord.push(this.mapConfig.selectedFeature.getGeometry().getExtent()[1])
    let lonlat = olProj.transform(coord, 'EPSG:3857', 'EPSG:4326');
    latlng = lonlat[1].toString() + ',' + lonlat[0].toString()
    httpP = httpP.append("latlng", latlng)
    httpP = httpP.append("key", "AIzaSyDAaLEIXTo6am6x0-QlegzxDnZLIN3mS-o")
    this.reverseGeocode(httpP)
      .subscribe((x) => {
        this.WOConfig.selectedWO.address = x['results'][0]['address_components'][0]['short_name'] + ' ' + x['results'][0]['address_components'][1]['short_name']
      })
  }

  public reverseGeocode = (params: HttpParams): Ob<string> => {
    let options: any = {
      headers: new HttpHeaders({
        'Content-Type': 'text/xml',
        'Accept': 'text/xml',
      })
    }
    return this._http.get<string>('https://maps.googleapis.com/maps/api/geocode/json?', { params: params, headers: options })
  }

  public flipSortBy() {
    switch (this.WOConfig.sortType.name) {
      case "Priority": {
        this.WOConfig.sortType.name = "Address"
        this.WOConfig.sortType.field = 'address'
        this.getFeatureList(this.mapConfig, this.mapConfig.currentLayer)
        break
      }
      case "Address": {
        this.WOConfig.sortType.name = "Work Order"
        this.WOConfig.sortType.field = 'WONumber'
        this.getFeatureList(this.mapConfig, this.mapConfig.currentLayer)
        break
      }
      case "Work Order": {
        this.WOConfig.sortType.name = "Priority"
        this.WOConfig.sortType.field = "WONumber"
      }
    }
  }

  public sortByFunction() {
    if (this.WOConfig.sortType.name == "Address") {
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
    if (this.WOConfig.sortType.name == "Priority") {
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
    if (this.WOConfig.sortType.name == "Work Order") {
      this.mapConfig.featureList.sort((a, b): number => {
        if (a.feature.getId() > b.feature.getId()) {
          return 1;
        }
        if (a.feature.getId() < b.feature.getId()) {
          return -1;
        }
        return 0;
      })
    }
  }
}
