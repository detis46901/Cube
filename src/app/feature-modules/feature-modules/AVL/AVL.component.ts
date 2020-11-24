import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MyCubeField, UserPageLayer } from '_models/layer.model';
import { MapConfig, featureList } from '../../../map/models/map.model';
import { WMSService } from '../../../map/services/wms.service'
import { MatDialog } from '@angular/material/dialog';
import { AVLService } from './AVL.service'
import { ModuleInstance } from '_models/module.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AVLConfig, GpsMessage, Vehicle } from './AVL.model'
import { AVLHTTPService } from './AVL.HTTP.service'
import {buffer} from 'ol/extent';
import { EventEmitter } from 'events';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import Observable from 'ol/Observable';
import { unByKey } from "ol/Observable"

@Component({
  selector: 'app-AVL',
  templateUrl: './AVL.component.html',
  styleUrls: ['./AVL.component.css']
})
export class AVLComponent implements OnInit, OnDestroy {

  constructor(private wmsService: WMSService, private dialog: MatDialog, public AVLservice: AVLService, public AVLHTTPservice: AVLHTTPService, public snackBar: MatSnackBar
  ) { }

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;
  @Input() user: string;
  public visible: boolean = false
  public expanded: boolean = false
  public token: JSON
  public AVLconfig = new AVLConfig

  ngOnInit() {
    console.log('Initializing AVLComponent')
    //gets the userpagelayer of the module instance
    this.mapConfig.userpagelayers.forEach((upl) => {
      if (upl.user_page_instance) {
        if (this.instance.ID == upl.user_page_instance.moduleInstanceID) {
          this.AVLconfig.UPL = upl
        }
      }
    })
    this.AVLservice.createLayer(this.mapConfig, this.AVLconfig.UPL)
    this.loadLayer()
    this.AVLservice.mapConfig = this.mapConfig
    //keep working on this
    this.AVLconfig.startDate = new Date()
    this.AVLconfig.startDate.setHours(0,0,0,0)
    this.AVLconfig.endDate = new Date()
    this.AVLconfig.endDate.setHours(24,0,0,0)
  }
  
  public reloadLayer() {
    this.buildConfig().then(() => {
      this.AVLservice.mapCurrentLocations(this.AVLconfig)
    })
  }

  public buildConfig(): Promise<any> {
    let promise = new Promise<any> ((resolve) => {
      this.AVLHTTPservice.getFleetLocationsCall(this.AVLconfig.token).subscribe((locations) => {
        this.AVLconfig.fleetLocations = locations['gpsMessage']
        this.AVLHTTPservice.getGroupCall(this.AVLconfig.token, 473643).subscribe((x) => {
          this.AVLconfig.group = x
          let i: number = 0
          this.AVLconfig.group.vehicleIds['id'].forEach((z) => {
            this.AVLHTTPservice.getVehicleCall(this.AVLconfig.token, z).subscribe((v: Vehicle) => {
              let tempVehicle:Vehicle = this.AVLconfig.vehicles.find((x) => x.id == v['@id'])
              if (tempVehicle) {
                let foundLocation = this.AVLconfig.fleetLocations.find((fl) => fl.vehicleId == v['@id'])
                if (foundLocation) {
                  tempVehicle.currentLocation = foundLocation
                }  
              }
              else {
                this.AVLconfig.vehicles.push(v)
                v.id = v['@id']  //This is because Networkfleet decided to put an @ in front and that doesn't work well (typ).
                v.type = v['@type']
                let foundLocation = this.AVLconfig.fleetLocations.find((fl) => fl.vehicleId == v.id)
                if (foundLocation) {
                  v.currentLocation = foundLocation
                }
              }
              i += 1
            if (i == this.AVLconfig.group.vehicleIds['id'].length) {
              this.AVLconfig.vehicles.sort((a, b): number => {
                if (a.label > b.label) {
                  return 1;
                }
                if (a.label < b.label) {
                  return -1;
                }
                return 0;
              })
              resolve()}
            })
          })
        })
      })
    })
    return promise
  }

  public goToTab(tab) {
    this.AVLconfig.tab = tab
  }

  public showTrack(vehicle: Vehicle) {
    this.AVLconfig.tab = 'Track'
    this.mapConfig.toolbar = "Feature List"
    this.AVLservice.showTrack(this.AVLconfig, vehicle)
  }

  public updateTrack(today?:boolean) {
    if(this.AVLconfig.trackUpdateInterval) {clearInterval(this.AVLconfig.trackUpdateInterval); this.AVLconfig.trackUpdateInterval = null}
    if (today) {
      this.AVLconfig.startDate = new Date()
      this.AVLconfig.startDate.setHours(0,0,0,0)
      this.AVLconfig.endDate = new Date()
      this.AVLconfig.endDate.setHours(24,0,0,0)  
    }
    this.showTrack(this.AVLconfig.selectedVehicle)
    this.goToTab("Track")  
  }

  public zoomToPoint(point:GpsMessage) {
    this.mapConfig.view.fit(point.olPoint.getGeometry().getExtent(), {
      duration: 1000,
      maxZoom: 16
    })
    this.AVLconfig.selectedPoint = point
  }

  public clearTracks() {
    console.log('ClearTracks')
    this.mapConfig.map.removeLayer(this.AVLconfig.olTrackLayer)
    this.mapConfig.currentLayer.olLayer.setOpacity(1)
    this.AVLconfig.selectedVehicle = new Vehicle
    this.AVLconfig.tab = "Vehicles"
    this.mapConfig.featureList = new Array<featureList>()
    this.mapConfig.toolbar = "Layers"
    this.mapConfig.map.getView().fit(buffer(this.mapConfig.currentLayer.olLayer.getSource().getExtent(), 1000), {duration: 1000})
    if(this.AVLconfig.trackUpdateInterval) {clearInterval(this.AVLconfig.trackUpdateInterval); this.AVLconfig.trackUpdateInterval = null}
  }

  public getFeatureList() {
    return false
  }

  public loadLayer() {
    console.log('AVLComponent Loadlayer')
    this.AVLservice.createLayer(this.mapConfig, this.AVLconfig.UPL)
    let username: string
    let password: string
    let groupID: number
    try {username = this.AVLconfig.UPL.user_page_instance.module_instance.settings.properties.find((x) => x.stringType.name == "username").stringType.value}
    catch(error) {}
    try {password = this.AVLconfig.UPL.user_page_instance.module_instance.settings.properties.find((x) => x.stringType.name == "password").stringType.value}
    catch(error){}
    try {groupID = this.AVLconfig.UPL.user_page_instance.module_instance.settings.properties.find((x) => x.integerType.name == "groupID").integerType.value}
    catch(error){}
    this.AVLservice.getToken(username, password).subscribe((x) => {
      this.AVLconfig.token = x
      this.buildConfig().then(() => {
        this.AVLservice.mapCurrentLocations(this.AVLconfig)
      })
    })
    this.AVLconfig.UPL.updateInterval = setInterval(() => {
      this.reloadLayer()
    },20000)
    return this.AVLservice.loadLayer(this.mapConfig, this.AVLconfig.UPL)
  }

  public unloadLayer(layer: UserPageLayer) {
    this.visible = false
    if(this.AVLconfig.olTrackLayer) {this.AVLconfig.olTrackLayer.setVisible(false)}
    return this.AVLservice.unloadLayer(layer)
  }

  public selectFeature(layer: UserPageLayer) {
    console.log('AVLcomponent selectFeature')
    if (this.AVLconfig.vehicles.find((x) => x.id == this.mapConfig.selectedFeature.get('id'))) {
      this.AVLservice.selectFeature(this.AVLconfig, layer)
    }
    else {
      console.log(this.mapConfig.selectedFeature.get('id'))
      console.log('must be a track')
    }
    return true
  }

  public clearFeature(layer: UserPageLayer) {
    if (this.mapConfig.selectedFeature) { this.mapConfig.selectedFeatureLayer.getSource().clear() }
        if (this.mapConfig.selectedFeature) {
            this.mapConfig.selectedFeature = null;
        }
    return true
  }

  public setCurrentLayer(layer: UserPageLayer): boolean {
    console.log("AVL setCurrentLayer")
    if (this.AVLconfig.olTrackLayer) {this.AVLconfig.olTrackLayer.setVisible(true)}
    this.visible = true
    this.expanded = true
    return (this.AVLservice.setCurrentLayer(layer, this.AVLconfig))
  }

  public unsetCurrentLayer(layer: UserPageLayer): boolean {
    this.visible = false
    unByKey(this.AVLconfig.AVLmouseover)
    unByKey(this.AVLconfig.AVLClick)
    return true
  }

  public unstyleSelectedFeature(layer: UserPageLayer): boolean {
    return false
  }

  ngOnDestroy() {
      console.log('destroying AVLComponent')
      this.mapConfig.map.removeLayer(this.AVLconfig.olTrackLayer)
      clearInterval(this.AVLconfig.UPL.updateInterval)
      clearInterval(this.AVLconfig.trackUpdateInterval)
      unByKey(this.AVLconfig.AVLmouseover)
      unByKey(this.AVLconfig.AVLClick)
  }

    myFilterStart = (d: Date | null): boolean => {
      return d < new Date()
    }

    myFilterEnd = (d: Date | null): boolean => {
      return d < new Date(new Date().getTime() + 24 * 60 * 60 * 1000) && d >= this.AVLconfig.startDate
    }

    public dateChange(e: any) {
      this.AVLconfig.endDate = new Date(this.AVLconfig.startDate.getTime() + 24 * 60 * 60 * 1000)
    }

    public moveDate(delta: number) {
      this.AVLconfig.startDate = new Date(this.AVLconfig.startDate.getTime() + 24 * 60 * 60 * 1000 * delta)
      this.AVLconfig.endDate = new Date(this.AVLconfig.endDate.getTime() + 24 * 60 * 60 * 1000 * delta)
      this.updateTrack()
    }
}
