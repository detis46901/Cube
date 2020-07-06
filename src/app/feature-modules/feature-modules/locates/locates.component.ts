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
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol';
import Polygon from 'ol/geom/Polygon';
import { transform } from 'ol/proj';


@Component({
  selector: 'app-locates',
  templateUrl: './locates.component.html',
  styleUrls: ['./locates.component.css']
})
export class LocatesComponent implements OnInit, OnDestroy {

  public locateConfig = new locateConfig
  public locateConfigID: number
  public locateInput: string;
  public ticket: Locate = null
  public expanded: boolean = false
  public userID: number;
  public userName: string;
  public completedNote: string;
  public completedDisposition = new disItem;
  public filterOpen: boolean = true
  public fromDate: Date
  public toDate: Date
  public tminus30: Date
  public tab: string;
  public moduleSettings: JSON
  public disposition = new disposition
  public layer: UserPageLayer

  constructor(
    public locatesservice: LocatesService,
    public userService: UserService,
    public locateStyles: locateStyles,
    public moduleInstanceService: ModuleInstanceService
  ) {}

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;

  ngOnInit() {
    this.locatesservice.mapConfig = this.mapConfig
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userID = currentUser && currentUser.userID;
    this.getName()
    let today:Date = new Date()
    this.toDate = today
    this.tminus30 = new Date()
    this.tminus30.setDate(this.tminus30.getDate()-30)
    this.fromDate = this.tminus30
    this.locateConfig.moduleSettings = this.instance.settings
  }

  ngOnDestroy() {
    if (this.layer) {clearInterval(this.layer.updateInterval)}
  }

  goToTab(tab) {
    this.tab = tab
  }

  public loadLayer(layer): boolean{
    //probably not being used right now
    return this.locatesservice.loadLayer(this.mapConfig, layer)
  }
  public unloadLayer(layer): boolean {
    this.locateConfig.visible = false
    this.ticket = null
    this.locatesservice.createInterval(layer)
    return true
  }
  public setCurrentLayer(layer):boolean {
    this.layer = layer
    this.locateConfig.expanded = true
    this.locateConfig.visible = true
    this.ticket = null
    this.locatesservice.setCurrentLayer(layer)
    return true
  }
  public styleMyCube(layer): boolean {
    return true
  }
  public unsetCurrentLayer(layer): boolean {
    this.locateConfig.visible = false
    return this.locatesservice.unsetCurrentLayer(layer)
  }
  public getFeatureList(layer?): boolean {
    console.log('getFeatureList')
    return this.locatesservice.getFeatureList(layer)
  }
  public clearFeature(layer:UserPageLayer): boolean {
    this.ticket = null
    return this.locatesservice.clearFeature(layer)
  }
  public unstyleSelectedFeature(layer:UserPageLayer):boolean {
    return this.locatesservice.unstyleSelectedFeature(layer)
  }
  public styleSelectedFeature(layer:UserPageLayer):boolean {
    return this.locatesservice.styleSelectedFeature(layer)
  }
  public selectFeature(layer:UserPageLayer): boolean {
    this.goToTab('Process')
    this.locatesservice.getOneLocate(layer).then((x) => {
      this.ticket = x
      this.mapConfig.myCubeConfig.expanded = false
      this.completedDisposition.value = x.disposition
      this.completedNote = x.note
    })
    this.locatesservice.selectFeature(layer)
    let source = new VectorSource({wrapX: false});
    this.locateConfig.boundaryLayer = new VectorLayer({
      source: source
    })
    // let pg = new Polygon([[-86.133029, 40.493279]])
    // let bf = new Feature({ geometry: new Polygon([[-86.133029, 40.493279], [-86.133029,40.492171], [-86.130551, 40.493279], [-86.130551, 40.492171]], 'EPSG:4326', 'EPSG:3857')) })
    return false
  }

  //locate specific procedures
  importLocate() {
    this.locatesservice.clearFeature(this.mapConfig.currentLayer)
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
      this.locatesservice.reloadLayer(this.mapConfig.currentLayer);
    }
    else {
      this.locatesservice.reloadLayer(this.mapConfig.currentLayer);
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
    this.completedDisposition = this.disposition.disposition.find((x) => x.value == ticket.disposition)
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
