import { Component, OnInit, Input } from '@angular/core';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs';
import { SDSService } from './SDS.service'
import { UserService } from '../../../../_services/_user.service'
import { User } from '../../../../_models/user.model'
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'
import { ModuleInstance } from '../../../../_models/module.model'
import { Clipboard } from 'ts-clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SDSConfig, SDSStyles } from './SDS.model'
import Autolinker from 'autolinker';
import { UserPageLayer } from '_models/layer.model';
import { environment } from 'environments/environment'
import { DataFormConfig, LogFormConfig, LogField } from '../../../shared.components/data-component/data-form.model'
import { DataFormService } from '../../../shared.components/data-component/data-form.service'


@Component({
  selector: 'app-SDS',
  templateUrl: './SDS.component.html',
  styleUrls: ['./SDS.component.css']
})
export class SDSComponent implements OnInit {

  public expanded: boolean = false
  public expandedSubscription: Subscription;
  public SDSConfigSubscription: Subscription;
  public userID: number;
  public token: string;
  public userName: string;
  public fromDate: Date
  public toDate: Date
  public tminus30: Date
  public tab: string;
  public SDSConfig = new SDSConfig
  public URL: string;


  constructor(
    public snackBar: MatSnackBar,
    public SDSservice: SDSService,
    public userService: UserService,
    public locateStyles: SDSStyles,
    public moduleInstanceService: ModuleInstanceService,
    private dataFormService: DataFormService
  ) { }

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;

  ngOnInit() {
    this.SDSservice.mapConfig = this.mapConfig
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
    this.URL = environment.apiUrl + '/api/sql/getanyimage'
  }

  public loadLayer(layer: UserPageLayer): boolean {
    return this.SDSservice.loadLayer(this.mapConfig, layer)
  }

  public unloadLayer(layer): boolean {
    return this.SDSservice.unloadLayer(layer)
  }

  public setCurrentLayer(layer): boolean {
    this.SDSConfig.expanded = true
    this.SDSConfig.visible = true
    this.dataFormService.setDataFormConfig('modules', 'm' + this.SDSConfig.moduleInstanceID + 'data').then((x) => {
      x.editMode = true
      this.SDSConfig.itemDataForm = x
      this.SDSConfig.linkedField = this.SDSConfig.moduleSettings['settings'][2]['setting']['value']
    })
    return this.SDSservice.setCurrentLayer(layer)
  }

  public unsetCurrentLayer(layer): boolean {
    this.SDSConfig.expanded = false
    this.SDSConfig.visible = false
    return this.SDSservice.unsetCurrentLayer(layer)
  }

  public styleMyCube(layer: UserPageLayer): boolean {
    if (layer.layer.layerType != 'MyCube') { return false }
    return this.SDSservice.styleMyCube(layer)
  }

  public styleSelectedFeature(layer): boolean {
    return this.SDSservice.styleSelectedFeature(layer)
  }

  public selectFeature(layer): boolean {
    this.mapConfig.showDeleteButton = true
    this.styleSelectedFeature(layer)
    this.SDSConfig.itemDataForm.rowID = this.mapConfig.selectedFeature.get('id')
    this.SDSservice.getSDSRecords(this.SDSConfig.itemDataForm, this.SDSConfig.linkedField).then((x) => {
      this.SDSConfig.list = x
      this.goToTab('Input')
    })
    return false  //this allows it to load the MyCube layer
  }

  public getFeatureList(layer): boolean {
    return false
  }

  public clearFeature(layer): boolean {
    this.SDSConfig.list = null
    this.SDSConfig.tab = 'None'
    return false
  }

  public unstyleSelectedFeature(layer): boolean {
    return this.SDSservice.unstyleSelectedFeature(layer)
  }

  goToTab(tab) {
    if (tab == 'Input') {
      this.dataFormService.setDataFormConfig('modules', this.SDSConfig.itemDataForm.dataTable).then((x) => {
        this.SDSConfig.itemDataForm = x
        this.SDSConfig.itemDataForm.logTable = 'm' + this.SDSConfig.itemDataForm + 'log'
        this.SDSConfig.itemDataForm.editMode = true
      })
      this.SDSConfig.selectedItem = 0
    }
    this.SDSConfig.tab = tab
  }

  getModuleName() {
    this.userService.GetSingle(this.userID)
      .subscribe((data: User) => {
        this.userName = data.firstName + " " + data.lastName
      })
    this.SDSConfig.moduleName = this.instance.name
    this.SDSConfig.moduleSettings = this.instance.settings
  }

  // filter() { //Not sure this is necessary.  It's not being used.
  //   let filterString: string = ''
  //   let options = { year: 'numeric', month: 'numeric', day: 'numeric' }
  //   if (this.filterOpen == true) { filterString = 'closed is Null' }
  //   if (filterString != '') { filterString += " and " } else { filterString += " " }
  //   if (this.fromDate) {
  //     filterString += "tdate BETWEEN '" + new Intl.DateTimeFormat('en-US').format(this.fromDate) + "' AND "
  //   }
  //   else {
  //     filterString += "tdate BETWEEN '" + new Intl.DateTimeFormat('en-US').format(this.tminus30) + "' AND "
  //   }
  //   if (this.toDate) {
  //     filterString += "'" + new Intl.DateTimeFormat('en-US').format(this.toDate) + "'"
  //   }
  //   else {
  //     filterString += "CURRENT_DATE"
  //   }
  //   this.SDSservice.filter = filterString
  //   this.runFilter();
  // }

  // private runFilter() {
  //   let i = this.SDSservice.mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == this.instance.ID);
  //   let obj = this.SDSservice.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'myCube Layer Identity (integer)');
  //   if (this.SDSservice.mapConfig.currentLayer.layer.ID === +obj['setting']['value']) {
  //     this.SDSservice.reloadLayer(this.SDSservice.mapConfig.currentLayer);
  //   }
  //   else {
  //     this.SDSservice.reloadLayer(this.SDSservice.mapConfig.currentLayer);
  //   }
  // }

  // clearFilter() {
  //   this.filterOpen = true
  //   this.fromDate = null
  //   this.toDate = null
  //   this.SDSservice.filter = 'closed is Null'
  //   this.runFilter()
  // }

  public selectItem(itemID) {
    this.dataFormService.setDataFormConfig('modules', 'm' + this.SDSConfig.moduleInstanceID + 'data', itemID).then((dataFormConfig: DataFormConfig) => {
      dataFormConfig.visible = true
      dataFormConfig.dataTableTitle = "Inspection Data"
      dataFormConfig.editMode = false
      dataFormConfig.logTable = 'm' + this.SDSConfig.moduleInstanceID + 'log'
      dataFormConfig.userID = this.mapConfig.user.ID
      this.SDSConfig.itemDataForm = dataFormConfig
      this.SDSConfig.selectedItem = itemID
      dataFormConfig.dataForm.find((x) => x.field == 'id').visible = false
      dataFormConfig.dataForm.find((x) => x.field == this.SDSConfig.moduleSettings['settings'][2]['setting']['value']).visible = false
      this.loadLogConfig(itemID)
      this.SDSConfig.tab = 'Item'
    })

  }

  public loadLogConfig(itemID) {
    this.dataFormService.setLogConfig('modules', 'm' + this.SDSConfig.moduleInstanceID + 'log', itemID).then((logFormConfig: LogFormConfig) => {
      this.SDSConfig.selectedItemLog = logFormConfig
      this.renderLogConfig(logFormConfig);
    });

  }

  public copyToClipboard(url: string) {
    Clipboard.copy(environment.apiUrl + environment.apiUrlPath + + url + '&apikey=' + this.token);
    this.snackBar.open("Copied to the clipboard", "", {
      duration: 2000,
    });
  }

  public changedDataForm($event) {
    this.loadLogConfig($event.rowID)
  }

  public renderLogConfig(logFormConfig: LogFormConfig) {
    logFormConfig.logTableTitle = "Comments"
    logFormConfig.visible = true;
    logFormConfig.logForm.forEach((x) => {
      if (x.userid == this.mapConfig.user.ID) {
        x.canDelete = true;
      }
    });
    logFormConfig.userID = this.mapConfig.user.ID;
    if (this.SDSConfig.selectedItemLog.showAuto) { logFormConfig.showAuto = true }
    this.SDSConfig.selectedItemLog = logFormConfig
  }
  public onNewComment(logFormConfig: LogFormConfig) {
    this.renderLogConfig(logFormConfig)
  }

  public addSDS() {
    this.dataFormService.addDataFormConfig(this.SDSConfig.itemDataForm, this.SDSConfig.linkedField, this.mapConfig.selectedFeature.get('id')).then((x) => {
      let logField = new LogField
      logField.userid = this.mapConfig.user.ID
      logField.auto = true
      logField.comment = 'Record Added'
      logField.schema = this.SDSConfig.itemDataForm.schema
      logField.logTable = 'm' + this.SDSConfig.moduleInstanceID + 'log'
      logField.featureid = x
      if (!this.SDSConfig.selectedItemLog.logForm) { this.SDSConfig.selectedItemLog.logForm = new Array<LogField>() }
      this.SDSConfig.selectedItemLog.logForm.push(logField)
      this.dataFormService.addLogFormConfig(logField).then((x) => {
      })
    })
  }

  public deleteSDS() {
    this.dataFormService.deleteDataFormConfig(this.SDSConfig.itemDataForm, this.SDSConfig.itemDataForm.rowID.toString()).then((x) => {
      this.selectFeature(this.mapConfig.currentLayer)
      let logField = new LogField
      logField.userid = this.mapConfig.user.ID
      logField.auto = true
      logField.comment = 'Record Deleted'
      logField.schema = this.SDSConfig.itemDataForm.schema
      logField.logTable = 'm' + this.SDSConfig.moduleInstanceID + 'log'
      logField.featureid = this.SDSConfig.itemDataForm.rowID
      this.dataFormService.addLogFormConfig(logField).then((X) => {
      })
    })
    this.SDSConfig.tab = "List"
  }
}