import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs/Subscription';
import { LocatesService } from './locates.service'
import { UserService } from '../../../../_services/_user.service'
import { User } from '../../../../_models/user.model'
import { locateStyles, Locate } from './locates.model'
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'


@Component({
  selector: 'app-locates',
  templateUrl: './locates.component.html',
  styleUrls: ['./locates.component.css']
})
export class LocatesComponent implements OnInit, OnDestroy {

  public moduleShow: boolean
  public locateInput: string;
  public ticktSubscription: Subscription;
  public idSubscription: Subscription;
  public ticket: Locate = null
  public id: string = null
  public expanded: boolean = false
  public expandedSubscription: Subscription;
  public userID: number;
  public userName: string;
  public completedNote: string;
  public filterOpen: boolean = true
  public fromDate: Date
  public toDate: Date
  public tminus30: Date
  public tabSubscription: Subscription;
  public tab: string;
  public moduleSettings: JSON

  constructor(
    public locatesservice: LocatesService, 
    public userService: UserService, 
    public locateStyles: locateStyles, 
    public moduleInstanceService: ModuleInstanceService
  ) {}

  @Input() mapConfig: MapConfig;
  @Input() instanceID: number;
  @Input() user: string;

  ngOnInit() {
    this.ticktSubscription = this.locatesservice.getTicket().subscribe(ticket => { this.ticket = ticket});
    this.idSubscription = this.locatesservice.getID().subscribe(id => { this.id = id })
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
  }

  ngOnDestroy() {
    this.ticktSubscription.unsubscribe()
    this.idSubscription.unsubscribe()
    this.expandedSubscription.unsubscribe()
    this.tabSubscription.unsubscribe()
    clearInterval(this.locatesservice.layer.updateInterval)
    console.log("Clearing Locate Interval")
  }

  goToTab(tab) {
    this.tab = tab
  }

  importLocate() {
    console.log('importLocate')
    this.locatesservice.parseLocateInput(this.locateInput, this.mapConfig, this.instanceID)
    this.locateInput = ""
  }

  completeTicket() {
    this.locatesservice.testCompleteTicket(this.mapConfig, this.instanceID, this.id, this.userName, this.completedNote, this.userName)
    this.completedNote = null
    this.ticket = null
  }

  getName() {
    this.userService.GetSingle(this.userID)
      .subscribe((data: User) => {
        this.userName = data.firstName + " " + data.lastName
      })
      this.moduleInstanceService.GetSingle(this.instanceID)
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
    this.locatesservice.filter = filterString
    this.runFilter();

  }
  private runFilter() {
    let i = this.locatesservice.mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == this.instanceID);
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
    console.log(ticket)
    this.getEmailConfiguration()
    let win = window.open("mailto:" + ticket.email + "?subject=Ticket: " + ticket.ticket + " " + ticket.address + " " + ticket.street + "&body=" + this.moduleSettings['settings'][1]['setting']['value'], "_blank");
    setTimeout(function() { win.close() }, 500);
    this.completedNote = "Emailed the contractor.  Cleared"
  }

  public getEmailConfiguration() {
    this.moduleInstanceService.GetSingle(this.instanceID)
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
