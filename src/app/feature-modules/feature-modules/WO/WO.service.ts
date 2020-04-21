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
import { Observable as Ob ,  Subject } from 'rxjs';
import { SQLService } from '../../../../_services/sql.service';
import { MyCubeService } from '../../../map/services/mycube.service'
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from "ol/layer/Vector";
import VectorSource from 'ol/source/Vector';
import { defaults as defaultInteractions, Modify, Draw } from 'ol/interaction';
import * as olProj from 'ol/proj';
import { GroupService } from '../../../../_services/_group.service';
import { UserService } from '../../../../_services/_user.service';
import Observable from 'ol/Observable';
import { Style } from 'ol/style';

@Injectable()
export class WOService {
  public mapConfig: MapConfig
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
    this.mapConfig = mapConfig
    let source = new VectorSource({
      format: new GeoJSON()
    })
    layer.source = source
    this.getWOData(layer).then((loadedLayer: UserPageLayer) => {
      // var clusterSource = new ol.source.Cluster({
      //   distance: 90,
      //   source: source
      // });
      loadedLayer.source.forEachFeature((x) => {
        x.setStyle(this.styleFunction(x, layer))
      })
      let vectorlayer = new VectorLayer({source: source});
      vectorlayer.setVisible(layer.defaultON);
      this.mapConfig.map.addLayer(vectorlayer);
      layer.olLayer = vectorlayer
      layer.source = source
      this.createInterval(layer)
    })
    return true
  }

  public unloadLayer(layer: UserPageLayer): boolean {
    return true
  }

  public setCurrentLayer(layer: UserPageLayer): boolean {
    this.reloadLayer(layer)
    return true
  }

  public unsetCurrentLayer(layer: UserPageLayer): boolean {
    this.reloadLayer(layer)
    return true
  }

  public styleSelectedFeature(layer: UserPageLayer): boolean {
    this.mapConfig.selectedFeature.setStyle(this.styleService.styleFunction(this.mapConfig.selectedFeature, 'selected'))
    return true
  }

  public selectFeature(layer: UserPageLayer): Promise<workOrder> {
    let promise = new Promise<workOrder>((resolve) => {
      this.sqlService.GetSingle('mycube.t' + layer.layerID, this.mapConfig.selectedFeature.get('id'))
      .subscribe((data) => {
        //stuff is going to go in here.
        resolve(data[0][0])
      })
    this.mapConfig.selectedFeature.setStyle(this.styleService.styleFunction(this.mapConfig.selectedFeature, 'selected'))
    // this.myCubeService.getComments(layer.layerID, this.mapConfig.selectedFeature.get('id'))
    //   .subscribe((data) => {
    //     this.WOConfig.selectedWOComments = data[0]
    // })
    // clearInterval(layer.updateInterval)
    // layer.updateInterval = null
      })
    return promise
  }

  public getFeatureList(layer, sortType?: sortType): boolean {
    // if (!sortBy) { this.WOConfig.sortType.name = 'address'; this.WOConfig.sortType.field = 'address' }
    let k: number = 0;
    let tempList = new Array<featureList>();
    try {
      layer.source.forEachFeature((x: Feature) => {
        let i = layer.source.getFeatures().findIndex((j) => j == x);
        let fl = new featureList;
        fl.id = x.get('id')
        fl.label = x.get(sortType.field)
        fl.feature = x
        if (i > -1 && fl != null) {
          tempList.push(fl)
          k += 1
        }
      })
      this.mapConfig.featureList = tempList.slice(0, k)
      this.sortByFunction(sortType)
    } catch (error) {
      console.error(error);
      clearInterval(this.WOConfig.layer.updateInterval);
    }
    return true
  }

  public clearFeature(layer: UserPageLayer): boolean {
    this.createInterval(layer)
    if (this.mapConfig.selectedFeature && this.WOConfig.Mode == "None") {
      this.WOConfig.selectedWO = new workOrder
      this.WOConfig.tab = "Closed"
      this.mapConfig.selectedFeature = null
    }
    if(this.mapConfig.currentLayer.olLayer) {this.mapConfig.currentLayer.source.forEachFeature((x: Feature) => {
      x.setStyle(this.styleFunction(x, layer))
    })
  }
    return true
  }

  public unstyleSelectedFeature(layer: UserPageLayer): boolean {
    if (this.mapConfig.selectedFeature) {this.mapConfig.selectedFeature.setStyle(this.styleService.styleFunction(this.mapConfig.selectedFeature, 'current'))}
    return true
  }

  public draw(layer: UserPageLayer, featuretype: any): boolean {
    console.log('draw in WOservice')
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
    this.mapConfig.map.addLayer(lyr);
    let modkey: any = this.mapConfig.map.addInteraction(drawInteraction);
    drawInteraction.once('drawend', (e) => {
      //this.WOConfig.Mode = "Add"
      this.mapConfig.drawMode = ''
      this.mapConfig.selectedFeature = e.feature
      this.mapConfig.selectedFeatures.clear()
      this.mapConfig.selectedFeatures.push(e.feature)
      this.fillAddress()
      this.styleService.styleFunction(this.mapConfig.selectedFeature, 'selected')
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

//nonstandard functions
private createPoint(layer:UserPageLayer): boolean {
    console.log('WO createPoint')
    this.WOConfig.Mode = "Add"
    this.mapConfig.drawMode = ''
    this.mapConfig.searchResultSource.forEachFeature((x) => {
      this.mapConfig.selectedFeature = x.clone()
      this.mapConfig.selectedFeatures.clear()
      this.mapConfig.selectedFeatures.push(x)
      this.fillAddress()
      x.setStyle(this.styleService.styleFunction(this.mapConfig.selectedFeature, 'selected'))
      this.WOConfig.modify = new Modify({ features: this.mapConfig.selectedFeatures });
      this.mapConfig.map.addInteraction(this.WOConfig.modify);
      this.WOConfig.selectedWO = new workOrder
      this.WOConfig.selectedWO.createdBy = this.mapConfig.user.ID
      this.WOConfig.selectedWO.feature = x
      this.WOConfig.tab = "Details"
    })
    return true
  }
  public createInterval(layer: UserPageLayer) {
    if (layer.updateInterval) {clearInterval(layer.updateInterval)}
    layer.updateInterval = setInterval(() => {
      this.reloadLayer(layer);
    }, 20000);
  }

  public reloadLayer(layer: UserPageLayer) {
      let version : string = 'load'
      this.getWOData(layer).then((loadedLayer: UserPageLayer) => {
            layer.source.forEachFeature((feat: Feature) => {
              feat.setStyle(this.styleFunction(feat, layer));
            })
      })
  
  }

  public styleFunction (feature: Feature, layer:UserPageLayer): Style {
    let version: string = 'load'
    if (layer == this.mapConfig.currentLayer) {version = 'current'}
    if (this.mapConfig.selectedFeature == feature) {version = 'selected'}
    return (this.styleService.styleFunction(feature, version));
  }

  public checkSearch(layer:UserPageLayer): string { //not sure what this is
    console.log("Checking search in WO")
    return "Create Work Order"
  }

  private getWOData(layer: UserPageLayer): Promise<any> {
    let source = new VectorSource({format: new GeoJSON()})
    let promise = new Promise((resolve, reject) => {
      this.geojsonservice.GetSome(layer.layer.ID, this.WOConfig.filter)
        .subscribe((data: any) => {
          if (data[0][0]['jsonb_build_object']['features']) {
            layer.source.clear()
            layer.source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
          }
          resolve(layer);
        })
    })
    return promise;
  }

  public createWorkOrder(SelectedWO: workOrder, complete?:boolean): Promise<workOrder> {
      let promise = new Promise<any>((resolve) => {
        let featureID: number
        let featurejson = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(SelectedWO.feature);
        this.sqlService.addRecord(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson))
          .subscribe((data) => {
            try { SelectedWO.id = data[0][0].id }
            catch (e) {
              this.sqlService.fixGeometry(this.mapConfig.currentLayer.layer.ID)
                .subscribe((x) => {
                })
            }
            this.mapConfig.selectedFeature.setId(SelectedWO.id);
            this.mapConfig.selectedFeature.set('id', SelectedWO.id)
            this.mapConfig.selectedFeature.setProperties(data[0]);
            resolve(SelectedWO)
            this.updateFields(SelectedWO, featurejson, "Work Order Created")
            let snackBarRef = this.snackBar.open('Work order was inserted.', '', {
              duration: 4000
            });
          })

      })
    
        return promise
  }

  private updateFields(selectedWO: workOrder, featurejson, comment?: string) {
    console.log('updateFields')
    if (!comment) { comment = 'Object Created' }
    this.myCubeService.createAutoMyCubeComment(true, comment, selectedWO.id, this.mapConfig.currentLayer.layer.ID, this.mapConfig.user.ID, featurejson['geometry'])
    let mcf = new MyCubeField
    mcf.field = "createdBy"
    mcf.type = "text"
    mcf.value = this.mapConfig.user.ID
    this.updateField(selectedWO.id, mcf);
    mcf.field = "description"
    mcf.value = selectedWO.description
    if (mcf.value) { this.updateField(selectedWO.id, mcf) };
    mcf.field = "assignedTo"
    mcf.value = selectedWO.assignedTo
    if (mcf.value) { this.updateField(selectedWO.id, mcf) }
    mcf.field = "address"
    mcf.value = selectedWO.address
    if (mcf.value) { this.updateField(selectedWO.id, mcf) }
    mcf.field = "WOTypeID"
    mcf.value = selectedWO.WOTypeID
    if (mcf.value) { this.updateField(selectedWO.id, mcf) }
    mcf.field = "priority"
    mcf.value = selectedWO.priority
    if (mcf.value) { this.updateField(selectedWO.id, mcf) }
    let currentYear = (new Date()).getFullYear()
    this.geojsonservice.GetSome(this.mapConfig.currentLayer.layer.ID, `"WONumber" Like '` + currentYear + `%25'`)
      .subscribe((data: any) => {
        let array = new Array<any>()
        array = data[0][0]['jsonb_build_object']['features']
        let latestWO: string = array.slice(array.length - 1, array.length)[0]['properties']['WONumber']
        let currentWONumber: number = +latestWO.split('-')[1] + 1
        mcf.field = "WONumber"
        mcf.value = currentYear + "-" + currentWONumber
        this.updateField(selectedWO.id, mcf)
        //   this.mapConfig.selectedFeatures.clear()
        // this.clearFeature(this.mapConfig.currentLayer)
      })
    if (!selectedWO.created) {
      mcf.field = "created"
      mcf.type = "integer"
      mcf.value = "NOW() AT TIME ZONE 'America/New_york'"
      this.updateField(selectedWO.id, mcf)
    }
  }


  public cancelEditWorkOrder() {
    console.log('cancelEditWorkOrder')
    this.mapConfig.map.removeInteraction(this.WOConfig.modify)
    this.mapConfig.currentLayer.source.removeFeature(this.mapConfig.selectedFeature)
    this.mapConfig.currentLayer.source.addFeature(this.WOConfig.editWO.feature)
    this.WOConfig.Mode = "None"
    this.clearFeature(this.mapConfig.currentLayer)
    this.reloadLayer(this.mapConfig.currentLayer)
  }

  public saveWorkOrder(selectedWO: workOrder) {
    let featurejson = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature);
    this.geojsonservice.updateGeometry(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson)).subscribe((data) => { })
    this.updateFields(selectedWO, featurejson, "Work Order Updated")
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
    this.selectFeature(this.mapConfig.currentLayer)
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

  completeWorkOrder(workOrder:workOrder) {
    let didUndo: boolean = false
    let snackBarRef = this.snackBar.open('Word Order Completed', 'Undo', {
      duration: 4000
    });
    let feat: Feature = workOrder.feature
    console.log(feat)
    snackBarRef.afterDismissed().subscribe((x) => {
      if (!didUndo) {
        if (this.WOConfig.editWO.assignNote) { this.myCubeService.createAutoMyCubeComment(true, this.WOConfig.selectedWO.assignNote, this.WOConfig.selectedWO.id, this.mapConfig.currentLayer.layerID, this.mapConfig.user.ID) }
        this.WOConfig.Mode = 'None'
        let mcf = new MyCubeField
        mcf.field = "completed"
        mcf.type = "integer"
        mcf.value = "NOW() AT TIME ZONE 'America/New_york'"
        this.updateField(+feat.getId(), mcf)
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
        this.reloadLayer(this.mapConfig.currentLayer)
      });
  }

  public fillAddress(): Promise<string> {
    let promise = new Promise<string>((resolve) => {
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
          resolve(x['results'][0]['address_components'][0]['short_name'] + ' ' + x['results'][0]['address_components'][1]['short_name'])
        })
    })
    
    return promise
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

  

  public sortByFunction(sortType: sortType) {
    if (sortType.name == "Address") {
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
    if (sortType.name == "Priority") {
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
    if (sortType.name == "Work Order") {
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
