import { Injectable } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
import { WorkOrder, WOConfig, SortType } from './WO.model'
import { StyleService } from './style.service'
import { MatSnackBar } from '@angular/material/snack-bar';
//http dependancies
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Observable as Ob } from 'rxjs';
import { SQLService } from '../../../../_services/sql.service';
import { MyCubeService } from '../../../map/services/mycube.service'
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from "ol/layer/Vector";
import VectorSource from 'ol/source/Vector';
import { Modify, Draw } from 'ol/interaction';
import * as olProj from 'ol/proj';
import { Style } from 'ol/style';
import { LogField, DataField, DataFormConfig } from 'app/shared.components/data-component/data-form.model';
import { DataFormService } from '../../../shared.components/data-component/data-form.service'

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
    private dataFormService: DataFormService) { }

  //loads the work order data
  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.mapConfig = mapConfig
    this.getWOData(layer).then((source: VectorSource) => {
      // var clusterSource = new ol.source.Cluster({
      //   distance: 90,
      //   source: source
      // });
      source.forEachFeature((x) => {
        x.setStyle(this.styleFunction(x, layer))
      })
      let ly = new VectorLayer({source: source});
      layer.olLayer = ly
      layer.olLayer.setVisible(layer.defaultON);
      this.mapConfig.map.addLayer(layer.olLayer);
      // layer.olLayer = vectorlayer
      layer.source = source
      this.createInterval(layer, 'completed IS Null', new SortType)
    })
    return true
  }

  
  public unloadLayer(layer: UserPageLayer): boolean {
    return true
  }

  public setCurrentLayer(layer: UserPageLayer, filter: string, sortType: SortType): boolean {
    this.reloadLayer(layer, filter, sortType)
    return true
  }

  public unsetCurrentLayer(layer: UserPageLayer, filter: string, sortType: SortType): boolean {
    this.reloadLayer(layer, filter, sortType)
    return true
  }

  public styleSelectedFeature(layer: UserPageLayer): boolean {
    this.mapConfig.selectedFeature.setStyle(this.styleService.styleFunction(this.mapConfig.selectedFeature, 'selected'))
    return true
  }

  public selectFeature(layer: UserPageLayer): Promise<WorkOrder> {
    let promise = new Promise<WorkOrder>((resolve) => {
      this.sqlService.GetSingle('mycube.t' + layer.layerID, this.mapConfig.selectedFeature.get('id'))
      .subscribe((data) => {
        console.log(data)
        resolve(data[0][0])
      })
    this.mapConfig.selectedFeature.setStyle(this.styleService.styleFunction(this.mapConfig.selectedFeature, 'selected'))
      })
    return promise
  }

  public getFeatureList(layer, sortType: SortType): boolean {
    if (!sortType) {
      sortType = new SortType
      sortType.name = 'address'
      sortType.field = 'address'
    }
    let k: number = 0;
    let tempList = new Array<featureList>();
      layer.olLayer.getSource().forEachFeature((x: Feature) => {
        let i = layer.olLayer.getSource().getFeatures().findIndex((j) => j == x);
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
      if (sortType) {this.sortByFunction(sortType)}
    return true
  }

  public createInterval(layer: UserPageLayer, filter:string, sortType: SortType) { //this.is only used during loadlayer
    if (layer.updateInterval) {clearInterval(layer.updateInterval)}
    layer.updateInterval = setInterval(() => {
      this.reloadLayer(layer, filter, sortType);
    }, 20000);
  }

  public clearFeature(layer: UserPageLayer): boolean {
    if (this.mapConfig.selectedFeature && this.WOConfig.Mode == "None") {
      // this.WOConfig.selectedWO = new WorkOrder
      // this.WOConfig.tab = "Closed"
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
      this.mapConfig.drawMode = ''
      this.mapConfig.selectedFeature = e.feature
      this.mapConfig.selectedFeatures.clear()
      this.mapConfig.selectedFeatures.push(e.feature)
      this.fillAddress()
      this.styleService.styleFunction(this.mapConfig.selectedFeature, 'selected')
      this.WOConfig.modify = new Modify({ features: this.mapConfig.selectedFeatures,
        // deleteCondition: ((event) => {if (event.originalEvent.button == 1) {return true} else {return false} })
      });
      this.mapConfig.map.addInteraction(this.WOConfig.modify);
      this.WOConfig.selectedWO = new WorkOrder
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

  public reloadLayer(layer: UserPageLayer, filter: string, sortType: SortType) {
      let version : string = 'load'
      this.getWOData(layer, filter).then((source: VectorSource) => {
            layer.olLayer.setSource(source)
            layer.olLayer.getSource().forEachFeature((feat: Feature) => {
              feat.setStyle(this.styleFunction(feat, layer));
            })
            this.getFeatureList(layer, sortType)
      })
  }

  public styleFunction (feature: Feature, layer:UserPageLayer): Style {
    let version: string = 'load'
    if (layer == this.mapConfig.currentLayer) {version = 'current'}
    if (this.mapConfig.selectedFeature == feature) {version = 'selected'}
    return (this.styleService.styleFunction(feature, version));
  }

  public checkSearch(layer:UserPageLayer): string { //this will be used to create a work order based on a search
    console.log("Checking search in WO")
    return "Create Work Order"
  }

  private getWOData(layer: UserPageLayer, filter?:string): Promise<any> {
    if (!filter) {filter = `"completed" IS Null`}
    let source = new VectorSource({format: new GeoJSON()})
    let promise = new Promise((resolve, reject) => {
      this.geojsonservice.GetSome(layer.layer.ID, filter)
        .subscribe((data: any) => {
          if (data[0][0]['jsonb_build_object']['features']) {
            source.addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
          }
          resolve(source);
        })
    })
    return promise;
  }

  public createWorkOrder(SelectedWO: WorkOrder, complete?:boolean): Promise<WorkOrder> {
      let promise = new Promise<any>((resolve) => {
        let featurejson = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(SelectedWO.feature);
        this.sqlService.addRecord(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson))
          .subscribe((data) => {
            try { SelectedWO.id = data[0][0].id }
            catch (e) {
              this.sqlService.fixGeometry(this.mapConfig.currentLayer.layer.ID)
                .subscribe((x) => {})
            }
            this.mapConfig.selectedFeature.setId(SelectedWO.id);
            this.mapConfig.selectedFeature.set('id', SelectedWO.id)
            this.mapConfig.selectedFeature.setProperties(data[0]);
            console.log(SelectedWO)
            this.updateFields(SelectedWO, featurejson, "Work Order Created").then((y) => {
              console.log('resolving')
              resolve(SelectedWO)
            })
            let snackBarRef = this.snackBar.open('Work order was inserted.', '', {
              duration: 4000
            });
          })
      })
        return promise
  }

  private updateFields(selectedWO: WorkOrder, featurejson, comment?: string): Promise<any> {
    let promise = new Promise((resolve) => {
      console.log('updateFields')
      if (!comment) { comment = 'Object Created' }
      let mcf = new DataField
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
      if (!selectedWO.WONumber) {
        let currentYear = (new Date()).getFullYear()
        this.geojsonservice.GetSome(this.mapConfig.currentLayer.layer.ID, `"WONumber" Like '` + currentYear + `%25'`)
          .subscribe((data: any) => {
            let array = new Array<any>()
            array = data[0][0]['jsonb_build_object']['features']
            console.log(array)
            if (!array) {mcf.value = currentYear + '-1'}
            else {
              let latestWO: string = array.slice(array.length - 1, array.length)[0]['properties']['WONumber']
              let currentWONumber: number = +latestWO.split('-')[1] + 1  
              mcf.value = currentYear + "-" + currentWONumber
            }
            mcf.type = "text"
            mcf.field = 'WONumber'
            this.updateField(selectedWO.id, mcf)
            resolve()
          })
      }
  
      if (!selectedWO.created) {
        mcf.field = "created"
        mcf.type = "integer"
        mcf.value = "NOW() AT TIME ZONE 'America/New_york'"
        this.updateField(selectedWO.id, mcf)
      }
    })
    return promise
  }

  public cancelEditWorkOrder() {
    
  }

  public saveWorkOrder(selectedWO: WorkOrder) {
    let featurejson = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).writeFeature(this.mapConfig.selectedFeature);
    this.geojsonservice.updateGeometry(this.mapConfig.currentLayer.layer.ID, JSON.parse(featurejson)).subscribe((data) => { })
    this.updateFields(selectedWO, featurejson, "Work Order Updated")
    console.log(selectedWO.id)
    this.addLogItem('Work order edited', selectedWO.id.toString()).then((x) => {
      console.log(selectedWO)
        this.dataFormService.updateLogConfig(selectedWO.WOLog)
    })
    let snackBarRef = this.snackBar.open('Work order was updated.', '', {
      duration: 4000
    });
  }

  public assignWorkOrder(WOConfig: WOConfig):Promise<string> {
    let promise = new Promise<string>((resolve) => {
      let featureID = +this.mapConfig.selectedFeature.getId()
      let mcf = new DataField
      mcf.field = "assignedTo"
      mcf.type = "text"
      mcf.value = WOConfig.selectedWO.assignedTo
      let assignedtoName = WOConfig.assignedTo.find((x) => x.name == WOConfig.selectedWO.assignedTo)
      this.updateField(featureID, mcf)
      let snackBarRef = this.snackBar.open('Work order was assigned.', '', {
        duration: 4000
      });
      this.addLogItem('Work order assigned to ' + assignedtoName.fullName, WOConfig.selectedWO.id.toString())
      if (WOConfig.selectedWO.assignNote) {this.addLogItem(WOConfig.selectedWO.assignNote, this.mapConfig.selectedFeature.getId().toString())}
      resolve(assignedtoName.fullName)
    })
    return promise
  }

  public deleteWorkOrder(WOConfig: WOConfig) {
    let didUndo: boolean = false
    let snackBarRef = this.snackBar.open('Word Order Deleted', 'Undo', {
      duration: 4000
    });
    let feat: Feature = this.mapConfig.selectedFeature
    this.mapConfig.currentLayer.olLayer.getSource().forEachFeature((y) => {
      if (y.getId() == feat.get('id')) {
        this.mapConfig.currentLayer.olLayer.getSource().removeFeature(y)
        this.mapConfig.featureList = this.mapConfig.featureList.filter(x => x.feature != y)
      }
    })
    console.log(this.mapConfig.featureList)
  snackBarRef.afterDismissed().subscribe((x) => {
      if (!didUndo) {
        this.myCubeService.Delete(this.mapConfig.currentLayer.layer.ID, feat.getId()).subscribe((x) => {
        })
        this.addLogItem('Work order deleted', feat.getId().toString())
        this.WOConfig.Mode = 'None'
      }
      else {
        this.WOConfig.tab = "Details"
      }
    })
    snackBarRef.onAction().subscribe((x) => {
      let newSnackBarRef = this.snackBar.open("Undone", '', { duration: 4000 })
      didUndo = true
      this.mapConfig.currentLayer.olLayer.getSource().addFeature(feat)
      this.mapConfig.selectedFeature = null  //this needs to be fixed because if you delete, then select another object, then undo, you'll get an error
      feat.setStyle(this.styleFunction(feat, this.mapConfig.currentLayer))
      this.getFeatureList(this.mapConfig.currentLayer, WOConfig.sortType)
    })
    this.WOConfig.Mode = 'None'
    this.WOConfig.tab = "Closed"
  }

  CreateCompleteWorkOrder() {

  }

  completeWorkOrder(WOConfig: WOConfig): Promise<any> {
    let promise = new Promise<any> ((resolve) => {
      let didUndo: boolean = false
      let snackBarRef = this.snackBar.open('Work Order Completed', 'Undo', {
        duration: 4000
      });
      let feat: Feature = WOConfig.editWO.feature
      this.mapConfig.currentLayer.olLayer.getSource().forEachFeature((y) => {
        if (y.getId() == feat.get('id')) {
          this.mapConfig.currentLayer.olLayer.getSource().removeFeature(y)
          this.mapConfig.featureList = this.mapConfig.featureList.filter(x => x.feature != y)
        }
      })
      snackBarRef.afterDismissed().subscribe((x) => {
        if (!didUndo) {
          if (WOConfig.editWO.assignNote) { 
            this.addLogItem('Work order completed', WOConfig.editWO.id.toString())
           }
          let mcf = new DataField
          mcf.field = "completed"
          mcf.type = "integer"
          mcf.value = "NOW() AT TIME ZONE 'America/New_york'"
          this.updateField(WOConfig.editWO.id, mcf)
        }
        else {
          this.WOConfig.tab = "Complete"
        }
      })
      this.WOConfig.tab = "Closed"
      snackBarRef.onAction().subscribe((x) => {
        let newSnackBarRef = this.snackBar.open("Undone", '', { duration: 4000 })
        didUndo = true
        this.mapConfig.currentLayer.olLayer.getSource().addFeature(feat)
        feat.setStyle(this.styleFunction(feat, this.mapConfig.currentLayer))
        this.getFeatureList(this.mapConfig.currentLayer, WOConfig.sortType)
      })
      resolve()
    })
    return promise
  }

  public addLogItem(comment: string, featureID: string): Promise<LogField> {
    let promise = new Promise<any>((resolve) => {
      let logField = new LogField
      logField.auto = true
      logField.comment = comment
      logField.featureid = featureID
      logField.schema = 'mycube'
      logField.logTable = 'c' + this.mapConfig.currentLayer.layer.ID
      logField.userid = this.mapConfig.user.ID
      this.dataFormService.addLogForm(logField)      
      resolve(logField)
    })
    return promise
  }

  private updateField(featureID: number, mcf: DataField) {
    this.sqlService.UpdateAnyRecord('mycube', 't' + this.mapConfig.currentLayer.layerID, featureID.toString(), mcf)
      .subscribe((x) => {
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

  public sortByFunction(sortType: SortType) {
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
