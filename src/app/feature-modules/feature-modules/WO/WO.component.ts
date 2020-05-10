import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs';
import { WOService } from './WO.service'
import { UserService } from '../../../../_services/_user.service'
import { WOType, WorkOrder, WOConfig, assignedTo } from './WO.model'
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'
import { ModuleInstance } from '../../../../_models/module.model'
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { UserPageLayer, MyCubeField, MyCubeComment, MyCubeConfig } from '_models/layer.model';
import { defaults as defaultInteractions, Modify, Draw } from 'ol/interaction';
import { DataFormConfig, DataFieldConstraint, LogFormConfig, LogField } from '../../../shared.components/data-component/data-form.model'
import { DataFormService } from '../../../shared.components/data-component/data-form.service'
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '_models/group.model'
import { User } from '_models/user.model';
import { cloneDeep } from 'lodash'
import { shiftKeyOnly, singleClick } from 'ol/events/condition'


@Component({
  selector: 'app-WO',
  templateUrl: './WO.component.html',
  styleUrls: ['./WO.component.css']
})
export class WOComponent implements OnInit, OnDestroy {

  public expanded: boolean = false
  public filterOpen: boolean = true
  public tab: string;
  public layer: UserPageLayer
  public WOConfig = new WOConfig
  public fromDate: Date
  public toDate: Date
  public tminus30: Date

  constructor(
    public WOservice: WOService,
    public userService: UserService,
    public dataFormService: DataFormService,
    public groupService: GroupService
  ) { }

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;
  
  ngOnInit() {
    this.WOservice.mapConfig = this.mapConfig  //This is here just in case
    let today:Date = new Date()
    let tomorrow: Date = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1);  //this crap is making sure that the filter sets up right.
    today = tomorrow
    this.toDate = today
    this.tminus30 = new Date()
    this.tminus30.setDate(this.tminus30.getDate()-30)
    this.fromDate = this.tminus30
    console.log('WOComponent Initialized')
  }

  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.layer = layer //used on ngDestroy
    //not being used right now.  It's being loaded via the service because I can't get this initialized soon enough
    return this.WOservice.loadLayer(mapConfig, layer)
  }
  public unloadLayer(layer: UserPageLayer): boolean {
    return this.WOservice.unloadLayer(layer)
  }
  public setCurrentLayer(layer: UserPageLayer): boolean {
    this.layer = layer
    this.mapConfig.editmode = true
    this.mapConfig.showStyleButton = false
    this.expanded = true
    if (layer.updateInterval) {clearInterval(layer.updateInterval)}  //this is the inital load interval (because I'm loading in the service)
    this.createInterval(layer)
    return this.WOservice.setCurrentLayer(layer, this.WOConfig.filter, this.WOConfig.sortType)
  }
  public unsetCurrentLayer(layer: UserPageLayer): boolean {
    clearInterval(layer.updateInterval)
    return this.WOservice.unsetCurrentLayer(layer, this.WOConfig.filter, this.WOConfig.sortType)
  }
  public styleMyCube(layer: UserPageLayer): boolean {
    //probably not using
    return true
  }
  public styleSelectedFeature(layer: UserPageLayer): boolean {
    return this.WOservice.styleSelectedFeature(layer)
  }
  public selectFeature(layer: UserPageLayer): boolean {
    if (this.WOConfig.Mode == 'Edit') {return true}
    clearInterval(layer.updateInterval)
    this.WOConfig.selectedWO = new WorkOrder
    this.WOConfigure(layer)
    this.WOservice.selectFeature(layer).then((x: WorkOrder) => {
      this.WOConfig.selectedWO = x
      this.goToTab('Details')
      this.dataFormService.setLogConfig(this.mapConfig.user.ID, 'mycube', 'c' + this.mapConfig.currentLayer.layerID, this.mapConfig.selectedFeature.getId()).then((x:LogFormConfig) => {
        x.userID = this.mapConfig.user.ID
        this.WOConfig.selectedWO.WOLog = x
        console.log(this.WOConfig.selectedWO)
        this.WOConfig.selectedWO.WOLog.logForm.forEach((x) => {
          if (x.userid == this.mapConfig.user.ID) {
              x.canDelete = true;
          }
      })
    })
    
  })
    return true
  }
  public getFeatureList(layer: UserPageLayer): boolean {
    return this.WOservice.getFeatureList(layer, this.WOConfig.sortType)
  }
  public clearFeature(layer: UserPageLayer, filter?:string): boolean {
    if (this.WOConfig.Mode == 'Edit') {return true}
    this.WOConfig.tab = ''
    this.createInterval(layer)
    this.WOConfig.selectedWO = null
    return this.WOservice.clearFeature(layer)
  }
  public unstyleSelectedFeature(layer: UserPageLayer): boolean {
    if (this.WOConfig.Mode == 'Edit') {return true}
    return this.WOservice.unstyleSelectedFeature(layer)
  }
  public draw(layer: UserPageLayer, featureType): boolean {
    this.clearFeature(layer)
    this.mapConfig.drawMode = "Add"
    this.WOConfig.Mode = "Add"
    this.WOConfig.vectorSource = new VectorSource
    this.WOConfig.vectorLayer = new VectorLayer({
      source: this.WOConfig.vectorSource
    });
    let drawInteraction = new Draw({
      type: featureType,
      source: this.WOConfig.vectorSource,
    })
    this.mapConfig.map.addLayer(this.WOConfig.vectorLayer);
    let modkey: any = this.mapConfig.map.addInteraction(drawInteraction);
    drawInteraction.once('drawend', (e) => {
      this.WOConfig.selectedWO = new WorkOrder
      this.WOConfig.selectedWO.feature = e.feature
      this.mapConfig.selectedFeature = e.feature
      this.mapConfig.selectedFeatures.clear()
      this.mapConfig.selectedFeatures.push(e.feature)
      this.WOservice.fillAddress().then((x) => {
        this.WOConfig.selectedWO.address = x
        this.WOConfigure(layer)
      })
      this.mapConfig.selectedFeature.setStyle(this.WOservice.styleFunction(this.mapConfig.selectedFeature, layer))
      this.WOConfig.modify = new Modify({ features: this.mapConfig.selectedFeatures});
      this.mapConfig.map.addInteraction(this.WOConfig.modify);
      this.WOConfig.selectedWO.createdBy = this.mapConfig.user.ID
      this.WOConfig.selectedWO.feature = e.feature
      this.WOConfig.tab = "Details"
      this.WOConfig.modkey = this.WOConfig.modify.on('modifyend', (e: any) => {
        this.WOservice.fillAddress().then((x) => {
          this.WOConfig.selectedWO.address = x
        })
      })
      this.mapConfig.map.removeInteraction(drawInteraction);

    })
    return true
  }

  public createInterval(layer: UserPageLayer) {
    if (layer.updateInterval) {clearInterval(layer.updateInterval)}
    layer.updateInterval = setInterval(() => {
      this.WOservice.reloadLayer(layer, this.WOConfig.filter, this.WOConfig.sortType);
    }, 20000);
  }

  ngOnDestroy() {
    if (this.layer) {clearInterval(this.layer.updateInterval)}
  }

  public cancelAddWorkOrder() {
    console.log('cancelAddWorkOrder')
    this.mapConfig.map.removeLayer(this.WOConfig.vectorLayer)
    this.mapConfig.map.removeInteraction(this.WOConfig.modify)
    this.WOConfig.vectorSource = new VectorSource
    this.WOConfig.vectorLayer = new VectorLayer
    this.WOConfig.Mode = "None"
    this.mapConfig.selectedFeatures.clear()
    this.mapConfig.drawMode = ''
    this.clearFeature(this.mapConfig.currentLayer)
  }

public cancelEditWorkOrder() {
  console.log('cancelEditWorkOrder')
    this.mapConfig.map.removeInteraction(this.WOConfig.modify)
    this.WOConfig.Mode = "None"
    this.clearFeature(this.mapConfig.currentLayer)
    this.WOservice.reloadLayer(this.layer, this.WOConfig.filter, this.WOConfig.sortType)
}

  public assignWorkOrder() {
    this.WOConfig.tab = "Details"
    this.WOConfig.Mode = "None"
    this.WOservice.assignWorkOrder(this.WOConfig).then((x) => {
      this.dataFormService.updateLogConfig(this.WOConfig.selectedWO.WOLog)
      // this.dataFormService.setLogConfig(this.mapConfig.user.ID, 'mycube', 'c' + this.mapConfig.currentLayer.layerID, this.mapConfig.selectedFeature.getId()).then((x:LogFormConfig) => {
      //   x.userID = this.mapConfig.user.ID
      //   this.WOConfig.selectedWO.WOLog = x
      //   this.WOConfig.selectedWO.WOLog.logForm.forEach((x) => {
      //     if (x.userid == this.mapConfig.user.ID) {
      //         x.canDelete = true;
      //     }
      // })
      // })
    })
  }

  goToTab(tab) {
    this.WOConfig.tab = tab
  }

  public onNewComment(event) {
      event.logForm.forEach((x) => {
        if (x.userid == this.mapConfig.user.ID) {
            x.canDelete = true;
        }
    })
  }

  public WOConfigure(layer: UserPageLayer) {
    this.WOConfig.WOTypes = new Array<WOType>()
    layer.user_page_instance.module_instance.settings.properties.forEach((x) => {
      if (x.arrayType) {
        if (x.arrayType.name == "Work Orders and Default Assigned Users and Groups"){
          x.arrayType.items.forEach((y) => {
            let WOT = new WOType
            WOT.id = y.id
            y.properties.forEach((z) => {
              if (z.stringType.name == "Work Order Name") {WOT.name = z.stringType.value}
              if (z.stringType.name == "Default Assigned User or Group") {WOT.defaultAssignedTo = z.stringType.value}
            })
            this.WOConfig.WOTypes.push(WOT)
          })
        }
      }
    })
    this.WOConfig.assignedTo = new Array<assignedTo>()
    layer.user_page_instance.module_instance.settings.properties.forEach((x) => {
      if (x.arrayType) {
        if (x.arrayType.name == "Available Users and Groups") {
          x.arrayType.items.forEach((y) => {
            let AT = new assignedTo
            y.properties.forEach((z) => {
              if (z.stringType.name == "Users and Groups Available") {
                AT.name = z.stringType.value
              }
              this.WOConfig.assignedTo.push(AT)
            })
          })
        }
      }
    })
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

  public flipSortBy() {
    switch (this.WOConfig.sortType.name) {
      case "Priority": {
        this.WOConfig.sortType.name = "Address"
        this.WOConfig.sortType.field = 'address'
        this.WOservice.getFeatureList(this.mapConfig.currentLayer, this.WOConfig.sortType)
        break
      }
      case "Address": {
        this.WOConfig.sortType.name = "Work Order"
        this.WOConfig.sortType.field = 'WONumber'
        this.WOservice.getFeatureList(this.mapConfig.currentLayer, this.WOConfig.sortType)
        break
      }
      case "Work Order": {
        this.WOConfig.sortType.name = "Priority"
        this.WOConfig.sortType.field = "WONumber"
        this.WOservice.getFeatureList(this.mapConfig.currentLayer, this.WOConfig.sortType)
      }
    }
  }

  changeWOType() {
    this.WOConfig.WOTypes.forEach((x) => {
      if (x.id == this.WOConfig.selectedWO.WOTypeID) {
        this.WOConfig.selectedWO.assignedTo = x.defaultAssignedTo
      }
    })
  }

  public createWorkOrder(complete?: boolean): Promise<WorkOrder> {
    let promise = new Promise<any>((resolve) => {
      console.log(this.WOConfig.selectedWO.feature)
      this.WOservice.createWorkOrder(this.WOConfig.selectedWO).then((x) => {
        this.WOConfig.selectedWO = x
        console.log(x.priority)
        let logField = new LogField
        logField.comment = 'Work Order created'
        logField.featureid = this.WOConfig.selectedWO.feature.getId()
        logField.logTable = 'c' + this.mapConfig.currentLayer.layer.ID
        logField.schema = 'mycube'
        logField.userid = this.mapConfig.user.ID
        logField.auto = true
        this.dataFormService.addLogForm(logField)
        this.mapConfig.map.removeLayer(this.WOConfig.vectorLayer)
        this.WOConfig.vectorSource = new VectorSource
        this.WOConfig.vectorLayer = new VectorLayer
        this.WOConfig.Mode = "None"
        this.mapConfig.map.removeInteraction(this.WOConfig.modify)
        this.WOservice.reloadLayer(this.layer, this.WOConfig.filter, this.WOConfig.sortType)
        this.mapConfig.drawMode = ''
        if (!complete) {
          this.clearFeature(this.layer)
        }
        resolve(x)
      })
  
    })
    return promise
  }

  public completeWorkOrder(workOrder?: WorkOrder) {
    if (workOrder) {this.WOConfig.selectedWO = workOrder}
    // this.WOConfig.editWO = cloneDeep(this.WOConfig.selectedWO)
    this.WOConfig.editWO = {...this.WOConfig.selectedWO}
    this.WOConfig.editWO.feature = this.mapConfig.selectedFeature.clone()
    this.WOservice.completeWorkOrder(this.WOConfig).then((x) => {
      this.clearFeature(this.mapConfig.currentLayer)
    })
  }

  public createCompleteWorkOrder() {
    this.createWorkOrder(true).then((x: WorkOrder) => {
      this.WOConfig.selectedWO = x
      this.completeWorkOrder(x)
    })
  }

  public deleteWorkOrder() {
    this.WOservice.deleteWorkOrder(this.WOConfig)
    this.WOConfig.selectedWO = null
  }

  public saveWorkOrder() {
    this.WOConfig.Mode = "None"
    this.WOConfig.selectedWO.id = +this.mapConfig.selectedFeature.getId()
    this.mapConfig.selectedFeature.set('priority', this.WOConfig.selectedWO.priority)
    this.WOservice.saveWorkOrder(this.WOConfig.selectedWO)
    this.mapConfig.map.removeInteraction(this.WOConfig.modify);
    //this.clearFeature(this.mapConfig.currentLayer)
  }
  filter() {
    let filterString: string = ''
    if (this.filterOpen == true) { filterString = 'completed is Null' }
    if (filterString != '') {filterString += " and "} else {filterString += " "}
      if (this.fromDate) {
        filterString += "created BETWEEN '" + new Intl.DateTimeFormat('en-US').format(this.fromDate) + "' AND "
      }
    else {
        filterString += "created BETWEEN '" + new Intl.DateTimeFormat('en-US').format(this.tminus30) + "' AND "
    }
    if (this.toDate) {
      filterString += "'" + new Intl.DateTimeFormat('en-US').format(this.toDate) + "'"
    }
    else {
      filterString += "CURRENT_DATE"
    }
    console.log(filterString)
    this.WOConfig.filter = filterString
    this.runFilter();
  }

  private runFilter() {
     this.WOservice.reloadLayer(this.mapConfig.currentLayer, this.WOConfig.filter, this.WOConfig.sortType);
  }

  clearFilter() {
    this.filterOpen = true
    this.WOConfig.filter = 'completed is Null'
    this.runFilter()
  }

  public editWorkOrder() {
    this.WOConfig.Mode = "Edit"
    this.mapConfig.selectedFeatures.clear()
    // this.WOConfig.editWO = cloneDeep(this.WOConfig.selectedWO)
    this.WOConfig.editWO = {...this.WOConfig.selectedWO}
    this.WOConfig.editWO.feature = this.mapConfig.selectedFeature.clone()
    this.mapConfig.selectedFeatures.push(this.mapConfig.selectedFeature)
    this.WOConfig.modify = new Modify({ features: this.mapConfig.selectedFeatures});    
    this.WOConfig.modkey = this.WOConfig.modify.on('modifyend', (e: any) => {
      this.WOservice.fillAddress().then((x) => {
        this.WOConfig.selectedWO.address = x
      })
    })
    this.mapConfig.map.addInteraction(this.WOConfig.modify);
  }

}
