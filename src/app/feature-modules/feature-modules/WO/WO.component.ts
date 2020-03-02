import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs';
import { WOService } from './WO.service'
import { UserService } from '../../../../_services/_user.service'
import { WOType, workOrder} from './WO.model'
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'
import { ModuleInstance } from '../../../../_models/module.model'
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { UserPageLayer, MyCubeField , MyCubeComment,  MyCubeConfig} from '_models/layer.model';


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

  constructor(
    public WOservice: WOService,
    public userService: UserService,
    public moduleInstanceService: ModuleInstanceService
  ) {}

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;
  @Input() user: string;

  ngOnInit() {
    this.expandedSubscription = this.WOservice.getExpanded().subscribe(expanded => { this.expanded = expanded })
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userID = currentUser && currentUser.userID;
    let today:Date = new Date()
    this.WOservice.getConfig(this.instance)
    this.myCubeComments = this.mapConfig.myCubeComment
    this.myCubeConfig = this.mapConfig.myCubeConfig
    this.myCubeData = this.mapConfig.myCubeData

  }

  ngOnDestroy() {
    this.expandedSubscription.unsubscribe()
    clearInterval(this.WOservice.WOConfig.layer.updateInterval)
    this.WOservice.WOConfig.vectorSource.clear()
    this.WOservice.WOConfig.Mode = "None"
  }

  goToTab(tab) {
    this.WOservice.WOConfig.tab = tab
  }

  changeWOType() {
    this.WOservice.WOConfig.WOTypes.forEach((x) => {
      if(x.id == this.WOservice.WOConfig.selectedWO.WOTypeID) {
        this.WOservice.WOConfig.selectedWO.assignedTo = x.defaultAssignedTo
      }
    })
  }

  cancelWorkOrder() {

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
      this.WOservice.reloadLayer();
    }
    else {
      this.WOservice.reloadLayer();
    }
  }

  clearFilter() {
    this.filterOpen = true
    this.WOservice.WOConfig.filter = 'closed is Null'
    this.runFilter()
  }
}
