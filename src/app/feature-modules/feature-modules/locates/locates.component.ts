import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs';
import { LocatesService } from './locates.service'
import { UserService } from '../../../../_services/_user.service'
import { User } from '../../../../_models/user.model'
import { locateConfig, locateStyles, Locate, disItem, disposition } from './locates.model'
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'
import { ModuleInstance } from '_models/module.model';
import { UserPageLayer } from '_models/layer.model';


@Component({
  selector: 'app-locates',
  templateUrl: './locates.component.html',
  styleUrls: ['./locates.component.css']
})
export class LocatesComponent implements OnInit, OnDestroy {

  public locateConfig = new locateConfig
  public locateConfigID: number
  public locateInput: string;
  public ticktSubscription: Subscription;
  public ticket: Locate = null
  public expanded: boolean = false
  public expandedSubscription: Subscription;
  public userID: number;
  public userName: string;
  public completedNote: string;
  public completedDisposition = new disItem;
  public filterOpen: boolean = true
  public fromDate: Date
  public toDate: Date
  public tminus30: Date
  public tabSubscription: Subscription;
  public tab: string;
  public moduleSettings: JSON
  public disposition = new disposition

  constructor(
    public locatesservice: LocatesService,
    public userService: UserService,
    public locateStyles: locateStyles,
    public moduleInstanceService: ModuleInstanceService
  ) {}

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;
  @Input() user: string;

  ngOnInit() {
    this.locatesservice.mapConfig = this.mapConfig
    this.ticktSubscription = this.locatesservice.getTicket().subscribe(ticket => { this.completedDisposition = new disItem; this.ticket = ticket});
    this.expandedSubscription = this.locatesservice.getExpanded().subscribe(expanded => { this.expanded = expanded })
    this.tabSubscription = this.locatesservice.getTab().subscribe(tab => { this.tab = tab })
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userID = currentUser && currentUser.userID;
    this.getName()
    let today:Date = new Date()
    this.toDate = today
    this.tminus30 = new Date()
    this.tminus30.setDate(this.tminus30.getDate()-30)
    this.fromDate = this.tminus30
    this.locateConfig.moduleSettings = this.instance.settings
    this.locateConfigID = this.locatesservice.locateConfig.push(this.locateConfig) - 1
  }

  ngOnDestroy() {
    this.ticktSubscription.unsubscribe()
    this.expandedSubscription.unsubscribe()
    this.tabSubscription.unsubscribe()
    clearInterval(this.locatesservice.layer.updateInterval)
  }

  goToTab(tab) {
    this.tab = tab
  }

  public loadLayer(layer): boolean{
    return this.locatesservice.loadLayer(this.mapConfig, layer)
  }

  public unloadLayer(layer): boolean {
    return this.locatesservice.unloadLayer(layer)
  }

  public setCurrentLayer(layer):boolean {
    return this.locatesservice.setCurrentLayer(layer)
  }
  public unsetCurrentLayer(layer): boolean {
    console.log('in locates component unsetcurrentlayer')
    return this.locatesservice.unsetCurrentLayer(layer)
  }
  public getFeatureList(layer?): boolean {
    return this.locatesservice.getFeatureList(layer)
  }
  public clearFeature(layer:UserPageLayer): boolean {
    return this.locatesservice.clearFeature(layer)
  }
  public unstyleSelectedFeature(layer:UserPageLayer):boolean {
    return this.locatesservice.unstyleSelectedFeature(layer)
  }
  public styleSelectedFeature(layer:UserPageLayer):boolean {
    return this.locatesservice.styleSelectedFeature(layer)
  }
  public selectFeature(layer:UserPageLayer): boolean {
    return this.locatesservice.selectFeature(layer)
  }

  importLocate() {
    this.locatesservice.parseLocateInput(this.locateInput, this.mapConfig, this.instance.ID)
    this.locateInput = ""
  }

  completeTicket() {
    this.ticket.disposition = this.completedDisposition.value
    this.locatesservice.completeTicket(this.mapConfig, this.instance.ID, this.ticket, this.completedNote, this.userName)
    this.completedNote = null
    this.completedDisposition = new disItem
    this.ticket = null
  }

  getName() {
    this.userService.GetSingle(this.userID)
      .subscribe((data: User) => {
        this.userName = data.firstName + " " + data.lastName
      })
      this.moduleInstanceService.GetSingle(this.instance.ID)
    .subscribe((x) => {
      this.moduleSettings = x.settings
    })
  }

  filter() {
    let filterString: string = ''
    if (this.filterOpen == true) { filterString = 'closed is Null' }
    if (filterString != '') {filterString += " and "} else {filterString += " "}
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
    this.locatesservice.filter = filterString
    this.runFilter();

  }
  private runFilter() {
    let i = this.locatesservice.mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == this.instance.ID);
    let obj = this.locatesservice.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'myCube Layer Identity (integer)');
    if (this.locatesservice.mapConfig.currentLayer.layer.ID === +obj['setting']['value']) {
      this.locatesservice.reloadLayer();
    }
    else {
      this.locatesservice.reloadLayer();
    }
  }

  clearFilter() {
    this.filterOpen = true
    this.fromDate = null
    this.toDate = null
    this.locatesservice.filter = 'closed is Null'
    this.runFilter()
  }

  public emailContractor(ticket: Locate) {
    this.getEmailConfiguration()
    let win = window.open("mailto:" + ticket.email + "?subject=Ticket: " + ticket.ticket + " " + ticket.address + " " + ticket.street + "&body=" + this.completedDisposition.emailBody, "_blank"); //this.moduleSettings['settings'][1]['setting']['value']
    setTimeout(function() { win.close() }, 500);
    this.completedNote = "Emailed the contractor."
  }

  public getEmailConfiguration() {
    this.moduleInstanceService.GetSingle(this.instance.ID)
    .subscribe((x) => {
      this.moduleSettings = x.settings
    })
  }
  public openDashboard() {
    window.open(this.moduleSettings['settings'][2]['setting']['value'], '_blank', 'resizable=yes')
  }
}
