import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs';
import { WOService } from './WO.service'
import { UserService } from '../../../../_services/_user.service'
import { WOType, workOrder, WOConfig } from './WO.model'
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


@Component({
  selector: 'app-WO',
  templateUrl: './WO.component.html',
  styleUrls: ['./WO.component.css']
})
export class WOComponent implements OnInit, OnDestroy {

  public moduleShow: boolean
  public expanded: boolean = false
  public expandedSubscription: Subscription;
  public userID: number;
  public userName: string;
  public filterOpen: boolean = true
  public tab: string;
  public moduleSettings: JSON
  public myCubeComments: MyCubeComment[]
  public showAuto: boolean = false;
  public myCubeConfig: MyCubeConfig;
  public myCubeData: MyCubeField[]
  public layer: UserPageLayer
  public WOConfig = new WOConfig
  public fromDate: Date
  public toDate: Date

  constructor(
    public WOservice: WOService,
    public userService: UserService,
    public moduleInstanceService: ModuleInstanceService,
    public dataFormService: DataFormService,
    public groupService: GroupService
  ) { }

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;
  @Input() user: string;

  ngOnInit() {
    this.WOservice.mapConfig = this.mapConfig  //This is here just in case
    let today: Date = new Date()
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
    return this.WOservice.setCurrentLayer(layer)
  }
  public unsetCurrentLayer(layer: UserPageLayer): boolean {
    return this.WOservice.unsetCurrentLayer(layer)
  }
  public styleMyCube(layer: UserPageLayer): boolean {
    //probably not using
    return false
  }
  public styleSelectedFeature(layer: UserPageLayer): boolean {
    return this.WOservice.styleSelectedFeature(layer)
  }
  public selectFeature(layer: UserPageLayer): boolean {
    clearInterval(layer.updateInterval)
    this.WOConfig.selectedWO = new workOrder
    this.WOConfigure(layer)
    this.WOservice.selectFeature(layer).then((x: workOrder) => {
      this.WOConfig.selectedWO = x
      this.goToTab('Details')
    })
    return true
  }
  public getFeatureList(layer: UserPageLayer): boolean {
    return this.WOservice.getFeatureList(layer, this.WOConfig.sortType)
  }
  public clearFeature(layer: UserPageLayer): boolean {
    this.WOConfig.tab = ''
    this.WOservice.createInterval(layer)
    this.WOConfig.selectedWO = null
    return this.WOservice.clearFeature(layer)
  }
  public unstyleSelectedFeature(layer: UserPageLayer): boolean {
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
      this.WOConfig.selectedWO = new workOrder
      this.mapConfig.selectedFeature = e.feature
      this.mapConfig.selectedFeatures.clear()
      this.mapConfig.selectedFeatures.push(e.feature)
      this.WOservice.fillAddress().then((x) => {
        this.WOConfig.selectedWO.address = x
        this.WOConfigure(layer)
      })
      this.mapConfig.selectedFeature.setStyle(this.WOservice.styleFunction(this.mapConfig.selectedFeature, layer))
      this.WOConfig.modify = new Modify({ features: this.mapConfig.selectedFeatures });
      this.mapConfig.map.addInteraction(this.WOConfig.modify);
      this.WOConfig.selectedWO = new workOrder
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



  goToTab(tab) {
    this.WOConfig.tab = tab
  }

  public WOConfigure(layer: UserPageLayer) {
    this.WOConfig.WOTypes = layer.user_page_instance.module_instance.settings['settings'][1]['setting']['WOType']
    this.WOConfig.assignedTo = layer.user_page_instance.module_instance.settings['settings'][2]['setting']['AssignedTo']
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

  public createWorkOrder(complete?: boolean): Promise<workOrder> {
    let promise = new Promise<any>((resolve) => {
      console.log(this.WOConfig.selectedWO.feature)
      this.WOservice.createWorkOrder(this.WOConfig.selectedWO).then((x) => {
        this.mapConfig.map.removeLayer(this.WOConfig.vectorLayer)
        this.WOConfig.vectorSource = new VectorSource
        this.WOConfig.vectorLayer = new VectorLayer
        this.WOConfig.Mode = "None"
        this.mapConfig.map.removeInteraction(this.WOConfig.modify)
        this.getFeatureList(this.mapConfig.currentLayer);
        // console.log(this.layer)
        this.WOservice.reloadLayer(this.layer)
        this.mapConfig.drawMode = ''
        if (!complete) {
          this.clearFeature(this.layer)
        }
        resolve(x)
      })
  
    })
    return promise
  }

  public completeWorkOrder(workOrder?: workOrder) {
    if (workOrder) {this.WOConfig.selectedWO = workOrder}
    console.log(this.WOConfig.selectedWO)
    this.WOConfig.editWO = cloneDeep(this.WOConfig.selectedWO)
    this.WOConfig.editWO.feature = this.mapConfig.selectedFeature.clone()
    console.log(this.WOConfig.editWO.feature)
    this.WOservice.completeWorkOrder(this.WOConfig.editWO)
    this.mapConfig.currentLayer.source.removeFeature(this.mapConfig.selectedFeature)
    this.clearFeature(this.mapConfig.currentLayer)
  }

  public createCompleteWorkOrder() {
    this.createWorkOrder(true).then((x: workOrder) => {
      this.WOConfig.selectedWO = x
      this.completeWorkOrder(x)
    })
  }

  public deleteWorkOrder() {
    this.WOservice.deleteWorkOrder()
  }

  public saveWorkOrder() {
    this.WOConfig.Mode = "None"
    this.WOConfig.selectedWO.id = +this.mapConfig.selectedFeature.getId()
    console.log(this.WOConfig.selectedWO)
    this.WOservice.saveWorkOrder(this.WOConfig.selectedWO)
    this.mapConfig.map.removeInteraction(this.WOConfig.modify);
    this.clearFeature(this.mapConfig.currentLayer)
  }
  filter() {
    // let filterString: string = ''
    // if (this.filterOpen == true) { filterString = 'closed is Null' }
    // if (filterString != '') {filterString += " and "} else {filterString += " "}
    //   if (this.fromDate) {
    //     filterString += "tdate BETWEEN '" + new Intl.DateTimeFormat('en-US').format(this.fromDate) + "' AND "
    //   }
    // else {
    //     filterString += "tdate BETWEEN '" + new Intl.DateTimeFormat('en-US').format(this.tminus30) + "' AND "
    // }
    // if (this.toDate) {
    //   filterString += "'" + new Intl.DateTimeFormat('en-US').format(this.toDate) + "'"
    // }
    // else {
    //   filterString += "CURRENT_DATE"
    // }
    // console.log(filterString)
    // this.WOservice.filter = filterString
    // this.runFilter();
  }

  private runFilter() {
    let i = this.WOservice.mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == this.instance.ID);
    let obj = this.WOservice.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'myCube Layer Identity (integer)');
    if (this.WOservice.mapConfig.currentLayer.layer.ID === +obj['setting']['value']) {
      this.WOservice.reloadLayer(this.mapConfig.currentLayer);
    }
    else {
      this.WOservice.reloadLayer(this.mapConfig.currentLayer);
    }
  }

  clearFilter() {
    this.filterOpen = true
    this.WOConfig.filter = 'closed is Null'
    this.runFilter()
  }

  public editWorkOrder() {
    this.WOConfig.Mode = "Edit"
    this.mapConfig.selectedFeatures.clear()
    this.WOConfig.editWO = cloneDeep(this.WOConfig.selectedWO)
    this.WOConfig.editWO.feature = this.mapConfig.selectedFeature.clone()
    this.mapConfig.selectedFeatures.push(this.mapConfig.selectedFeature)
    this.WOConfig.modify = new Modify({ features: this.mapConfig.selectedFeatures });
    this.WOConfig.modkey = this.WOConfig.modify.on('modifyend', (e: any) => {
      this.WOservice.fillAddress().then((x) => {
        this.WOConfig.selectedWO.address = x
      })
    })
    this.mapConfig.map.addInteraction(this.WOConfig.modify);
  }

}
