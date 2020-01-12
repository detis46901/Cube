import { Component, OnInit, OnDestroy, Input, ComponentFactoryResolver } from '@angular/core';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs/Subscription';
import { SDSService } from './SDS.service'
import { MyCubeField } from "../../../../_models/layer.model"
import { UserService } from '../../../../_services/_user.service'
import { User } from '../../../../_models/user.model'
import { SDSStyles } from './SDS.model'
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'
import { ModuleInstance } from '../../../../_models/module.model'
import { Clipboard } from 'ts-clipboard';
import { Configuration } from '../../../../_api/api.constants';
import { MatSnackBar } from '@angular/material';
var Autolinker = require( 'autolinker' );



@Component({
  selector: 'app-SDS',
  templateUrl: './SDS.component.html',
  styleUrls: ['./SDS.component.css']
})
export class SDSComponent implements OnInit, OnDestroy {

  public expanded: boolean = false
  public expandedSubscription: Subscription;
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
  public editRecord: boolean = true //if the fields for editing the records are disabled.


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
    this.expandedSubscription = this.SDSservice.getExpanded().subscribe(expanded => { this.expanded = expanded })
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
        
    this.userID = currentUser && currentUser.userID;
    this.getModuleName()
    let today: Date = new Date()
    this.toDate = today
    this.tminus30 = new Date()
    this.tminus30.setDate(this.tminus30.getDate() - 30)
    this.fromDate = this.tminus30
    console.log(this.instance.settings['settings'][1]['setting']['value'])
    this.SDSservice.SDSConfig.label = this.instance.settings['settings'][1]['setting']['value']
    this.SDSservice.SDSConfig.moduleInstanceID = this.instance.ID

    this.SDSservice.getSchema('modules', this.instance.ID)
      .then((x) => {
        this.SDSservice.SDSConfig.itemData[0].type = "id"   //Sets the "id" of the SDS to type = 'id' so it won't be visible.
        this.SDSservice.SDSConfig.itemData.forEach((x) => {  //probably not the best way to do this.  This finds the linked field and sets it to 'id' so it won't be visible.
          if (x.field == this.SDSservice.SDSConfig.moduleSettings['settings'][2]['setting']['value']) {
            this.SDSservice.SDSConfig.itemData[this.SDSservice.SDSConfig.itemData.indexOf(x)].type = 'id'
            this.SDSservice.SDSConfig.linkedField = x.field
          }
        })
      })
  }

  ngOnDestroy() {
    this.expandedSubscription.unsubscribe()
    clearInterval(this.SDSservice.SDSUpdateInterval);
  }

  goToTab(tab) {
    this.SDSservice.SDSConfig.tab = tab
    if (this.SDSservice.SDSConfig.tab == 'Input') {
      this.SDSservice.SDSConfig.selectedItem = null
      this.SDSservice.SDSConfig.itemData.forEach((x) => {
        x.value = null
        if (x.field == this.SDSservice.SDSConfig.moduleSettings['settings'][2]['setting']['value']) {
          this.SDSservice.SDSConfig.itemData[this.SDSservice.SDSConfig.itemData.indexOf(x)].value = this.mapConfig.selectedFeature.get('id')  //this will need something more when I add wms features
        }
      })
      // this.SDSservice.getSchema("module", this.instance.ID).then((x) => {
      //   this.SDSservice.SDSConfig.itemData = x
      //   //this.SDSservice.SDSConfig.itemData[0].value = id
      //   this.SDSservice.SDSConfig.itemData[0].type = "id"

      // })
    }

  }

  getModuleName() {
    this.userService.GetSingle(this.userID)
      .subscribe((data: User) => {
        this.userName = data.firstName + " " + data.lastName
      })
    this.SDSservice.SDSConfig.moduleName = this.instance.name
    this.SDSservice.SDSConfig.moduleSettings = this.instance.settings
  }

  filter() {
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
    // filterString += " and tdate BETWEEN '2019-01-01' AND '2019-02-15'"
    console.log(filterString)
    this.SDSservice.filter = filterString
    this.runFilter();
  }

  private runFilter() {
    let i = this.SDSservice.mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == this.instance.ID);
    let obj = this.SDSservice.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'myCube Layer Identity (integer)');
    if (this.SDSservice.mapConfig.currentLayer.layer.ID === +obj['setting']['value']) {
      //this.locatesservice.layerState = 'current'
      this.SDSservice.reloadLayer();
    }
    else {
      //this.locatesservice.layerState = 'load'
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

  public selectItem(itemID) {
    this.SDSservice.getData(this.instance.ID, itemID).then((x) => {
      console.log(x)
      this.SDSservice.SDSConfig.itemData = x
      this.editRecord = true //sets the disabled to true
      this.SDSservice.SDSConfig.itemData[0].value = itemID
      this.SDSservice.SDSConfig.selectedItem = itemID
    })
  }

  public copyToClipboard(url: string) {
    Clipboard.copy(this.configuration.serverWithApiUrl + url + '&apikey=' + this.token);
    this.snackBar.open("Copied to the clipboard", "", {
        duration: 2000,
    });
}

}
