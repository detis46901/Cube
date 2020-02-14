import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs/Subscription';
import { WOService } from './WO.service'
import { UserService } from '../../../../_services/_user.service'
import { User } from '../../../../_models/user.model'
import { locateStyles, Locate, disItem, disposition } from './WO.model'
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'
import { ModuleInstance } from '../../../../_models/module.model'


@Component({
  selector: 'app-WO',
  templateUrl: './WO.component.html',
  styleUrls: ['./WO.component.css']
})
export class WOComponent implements OnInit, OnDestroy {

  public moduleShow: boolean
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
    public WOservice: WOService, 
    public userService: UserService, 
    public locateStyles: locateStyles, 
    public moduleInstanceService: ModuleInstanceService
  ) {}

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;
  @Input() user: string;

  ngOnInit() {
    this.ticktSubscription = this.WOservice.getTicket().subscribe(ticket => { this.completedDisposition = new disItem; this.ticket = ticket});
    this.expandedSubscription = this.WOservice.getExpanded().subscribe(expanded => { this.expanded = expanded })
    this.tabSubscription = this.WOservice.getTab().subscribe(tab => { this.tab = tab })
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userID = currentUser && currentUser.userID;
    this.getName()
    let today:Date = new Date()
    this.toDate = today
    this.tminus30 = new Date()
    this.tminus30.setDate(this.tminus30.getDate()-30)
    this.fromDate = this.tminus30
  }

  ngOnDestroy() {
    this.ticktSubscription.unsubscribe()
    this.expandedSubscription.unsubscribe()
    this.tabSubscription.unsubscribe()
    clearInterval(this.WOservice.layer.updateInterval)
    this.WOservice.WOConfig.vectorSource.clear()
  }

  goToTab(tab) {
    this.tab = tab
  }

  importLocate() {
    console.log('importLocate')
    this.WOservice.parseLocateInput(this.locateInput, this.mapConfig, this.instance.ID)
    this.locateInput = ""
  }

  completeTicket() {
    this.ticket.disposition = this.completedDisposition.value
    this.WOservice.completeTicket(this.mapConfig, this.instance.ID, this.ticket, this.completedNote, this.userName)
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
    console.log(filterString)
    this.WOservice.filter = filterString
    this.runFilter();

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
    this.fromDate = null
    this.toDate = null
    this.WOservice.filter = 'closed is Null'
    this.runFilter()
  }

  public emailContractor(ticket: Locate) {
    console.log(ticket)
    this.getEmailConfiguration()
    let win = window.open("mailto:" + ticket.email + "?subject=Ticket: " + ticket.ticket + " " + ticket.address + " " + ticket.street + "&body=" + this.completedDisposition.emailBody, "_blank"); //this.moduleSettings['settings'][1]['setting']['value']
    setTimeout(function() { win.close() }, 500);
    this.completedNote = "Emailed the contractor."
  }

  public getEmailConfiguration() {
    this.moduleInstanceService.GetSingle(this.instance.ID)
    .subscribe((x) => {
      this.moduleSettings = x.settings
      console.log(this.moduleSettings)
    })
  }
  public openDashboard() {
    console.log(this.moduleSettings['settings'][2]['setting']['value'])
    window.open(this.moduleSettings['settings'][2]['setting']['value'], '_blank', 'resizable=yes')
  }
}
