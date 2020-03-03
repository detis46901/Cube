import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs';
import { SDSService } from './SDS.service'
import { UserService } from '../../../../_services/_user.service'
import { User } from '../../../../_models/user.model'
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'
import { ModuleInstance } from '../../../../_models/module.model'
import { Clipboard } from 'ts-clipboard';
import { Configuration } from '../../../../_api/api.constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SDSConfig, SDSStyles } from './SDS.model'
import Autolinker from 'autolinker';



@Component({
  selector: 'app-SDS',
  templateUrl: './SDS.component.html',
  styleUrls: ['./SDS.component.css']
})
export class SDSComponent implements OnInit, OnDestroy {

  public expanded: boolean = false
  public expandedSubscription: Subscription;
  public SDSConfigSubscription: Subscription;
  public userID: number;
  public token: string;
  public userName: string;
  public completedNote: string;
  public filterOpen: boolean = true
  public fromDate: Date
  public toDate: Date
  public tminus30: Date
  public tab: string;
  public moduleInstanceName: string
  public label: string
  public Autolinker = new Autolinker()
  public SDSConfig = new SDSConfig
  public SDSConfigID: number

  constructor(
    public snackBar: MatSnackBar,
    public SDSservice: SDSService,
    public userService: UserService,
    public locateStyles: SDSStyles,
    public moduleInstanceService: ModuleInstanceService,
    private configuration: Configuration,
  ) { }

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;

  ngOnInit() {

    this.expandedSubscription = this.SDSservice.getExpanded().subscribe(expanded => { this.SDSConfig.expanded = expanded })
    this.SDSConfigSubscription = this.SDSservice.getSDSConfig().subscribe(SDSConfig => { this.SDSConfig = SDSConfig[this.SDSConfigID] })
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.userID = currentUser && currentUser.userID;
    this.getModuleName()
    let today: Date = new Date()
    this.toDate = today
    this.tminus30 = new Date()
    this.tminus30.setDate(this.tminus30.getDate() - 30)
    this.fromDate = this.tminus30
    this.SDSConfig.label = this.instance.settings['settings'][1]['setting']['value']
    this.SDSConfig.moduleInstanceID = this.instance.ID
    this.SDSservice.getSchema('modules', this.instance.ID, this.SDSConfig)
      .then((x) => {
        this.SDSConfig.itemData[0].type = "id"   //Sets the "id" of the SDS to type = 'id' so it won't be visible.
        this.SDSConfig.itemData.forEach((x) => {  //probably not the best way to do this.  This finds the linked field and sets it to 'id' so it won't be visible.
          if (x.field == this.SDSConfig.moduleSettings['settings'][2]['setting']['value']) {
            this.SDSConfig.itemData[this.SDSConfig.itemData.indexOf(x)].type = 'id'
            this.SDSConfig.linkedField = x.field
            this.SDSConfigID = this.SDSservice.SDSConfig.push(this.SDSConfig) - 1
          }
        })
      })
  }

  ngOnDestroy() {
    this.expandedSubscription.unsubscribe()
    clearInterval(this.SDSservice.SDSUpdateInterval);
  }

  goToTab(tab) {
    this.SDSConfig.tab = tab
    if (this.SDSConfig.tab == 'Input') {
      this.SDSConfig.selectedItem = null
      this.SDSConfig.itemData.forEach((x) => {
        x.value = null
        if (x.field == this.SDSConfig.moduleSettings['settings'][2]['setting']['value']) {
          this.SDSConfig.itemData[this.SDSConfig.itemData.indexOf(x)].value = this.mapConfig.selectedFeature.get('id')  //this will need something more when I add wms features
        }
      })
    }
  }

  getModuleName() {
    this.userService.GetSingle(this.userID)
      .subscribe((data: User) => {
        this.userName = data.firstName + " " + data.lastName
      })
    this.SDSConfig.moduleName = this.instance.name
    this.SDSConfig.moduleSettings = this.instance.settings
  }

  filter() { //Not sure this is necessary.  It's not being used.
    let filterString: string = ''
    let options = { year: 'numeric', month: 'numeric', day: 'numeric' }
    if (this.filterOpen == true) { filterString = 'closed is Null' }
    if (filterString != '') { filterString += " and " } else { filterString += " " }
    if (this.fromDate) {
      filterString += "tdate BETWEEN '" + new Intl.DateTimeFormat('en-US').format(this.fromDate) + "' AND "
    }
    else {
      filterString += "tdate BETWEEN '" + new Intl.DateTimeFormat('en-US').format(this.tminus30) + "' AND "
    }
    if (this.toDate) {
      filterString += "'" + new Intl.DateTimeFormat('en-US').format(this.toDate) + "'"
    }
    else {
      filterString += "CURRENT_DATE"
    }
    console.log(filterString)
    this.SDSservice.filter = filterString
    this.runFilter();
  }

  private runFilter() {
    let i = this.SDSservice.mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == this.instance.ID);
    let obj = this.SDSservice.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'myCube Layer Identity (integer)');
    if (this.SDSservice.mapConfig.currentLayer.layer.ID === +obj['setting']['value']) {
      this.SDSservice.reloadLayer();
    }
    else {
      this.SDSservice.reloadLayer();
    }
  }

  clearFilter() {
    this.filterOpen = true
    this.fromDate = null
    this.toDate = null
    this.SDSservice.filter = 'closed is Null'
    this.runFilter()
  }

  public selectItem(itemID, SDSConfigID) {
    let i: number = 0
    let selected = this.SDSConfig.list.find((x) => x['id'] == itemID)
    this.SDSConfig.itemData.forEach((x) => {
      x.value = selected[x.field]
      i++
      if (x.type == "date") {
        //need to do something about this because the date picker uses the day before the actual date.  There's a time zone issue.
      }
    })
    this.SDSConfig.selectedItem = itemID
    this.SDSConfig.tab = 'Item'
    // I'm using the existing data it gets when you first select and item to feed the item data.  If it needs to be more dynamic, the code below will help to do that.
    // this.SDSservice.getData(this.instance, itemID).then((x) => {
    //   console.log(x)
    //   this.SDSConfig.itemData = x
    //   this.editRecord = true //sets the disabled to true
    //   this.SDSConfig.itemData[0].value = itemID
    //   this.SDSConfig.selectedItem = itemID
    // })
    this.SDSservice.getSDSLog(SDSConfigID, 'modules.m' + this.SDSConfig.moduleInstanceID + 'log', itemID)
  }

  public copyToClipboard(url: string) {
    Clipboard.copy(this.configuration.serverWithApiUrl + url + '&apikey=' + this.token);
    this.snackBar.open("Copied to the clipboard", "", {
      duration: 2000,
    });
  }
}
