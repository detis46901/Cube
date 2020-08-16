import { Component, OnInit, Input, EventEmitter, OnDestroy } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs';
import { WMSService } from '../../../map/services/wms.service'
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { AVLService } from './AVL.service'
import { ModuleInstance } from '_models/module.model';
import { Clipboard } from 'ts-clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Image, AVLConfig, GpsMessage, Vehicle } from './AVL.model'
import { AVLHTTPService } from './AVL.HTTP.service'
import { resolve } from 'dns';

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
  public canEdit: boolean = false
  public visible: boolean = false
  public expanded: boolean = false
  public disabledSubscription: Subscription;
  public loadedImages = new Array<Image>()
  public opacityValue: number = 100
  public token: JSON
  public AVLConfig = new AVLConfig
  public tab: string = 'Vehicles'

  ngOnInit() {
    console.log('Initializing AVLComponent')
    //gets the userpagelayer of the module instance
    this.mapConfig.userpagelayers.forEach((upl) => {
      if (upl.user_page_instance) {
        if (this.instance.ID == upl.user_page_instance.moduleInstanceID) {
          this.AVLConfig.UPL = upl
        }
      }
    })
    this.AVLservice.createLayer(this.mapConfig, this.AVLConfig.UPL)
    this.loadLayer()
    this.AVLservice.mapConfig = this.mapConfig

    //keep working on this
    this.AVLConfig.startDate = new Date()
    console.log(this.AVLConfig.startDate.toISOString())
  }

  
  public reloadLayer() {
    this.buildConfig().then(() => {
      this.AVLservice.mapCurrentLocations(this.AVLConfig)
    })
  }

  public buildConfig(): Promise<any> {
    let promise = new Promise<any> ((resolve) => {
      this.AVLHTTPservice.getFleetLocationsCall(this.AVLConfig.token).subscribe((locations) => {
        this.AVLConfig.fleetLocations = locations['gpsMessage']
        this.AVLHTTPservice.getGroupCall(this.AVLConfig.token, 473643).subscribe((x) => {
          this.AVLConfig.group = x
          let i: number = 0
          this.AVLConfig.vehicles = [] //probably need to come up with a better way on this so it doesn't take too long to refresh.
          this.AVLConfig.group.vehicleIds['id'].forEach((z) => {
            this.AVLHTTPservice.getVehicleCall(this.AVLConfig.token, z).subscribe((v: Vehicle) => {
              i += 1
              this.AVLConfig.vehicles.push(v)
              v.id = v['@id']  //This is because Networkfleet decided to put an @ in front and that doesn't work well (typ).
              v.type = v['@type']
              let foundLocation = this.AVLConfig.fleetLocations.find((fl) => fl.vehicleId == v.id)
              if (foundLocation) {
                v.currentLocation = foundLocation
              }
            if (i == this.AVLConfig.group.vehicleIds['id'].length) {resolve()}
            })
          })
        })
      })
    })
    return promise
  }

  public goToTab(tab) {
    this.tab = tab
  }

  public goToTrack(vehicle: Vehicle) {
    this.AVLConfig.selectedVehicle = vehicle
    console.log('showTrack')
    this.tab = 'Track'
    this.AVLservice.mapTrack(this.AVLConfig, vehicle)
  }

  // public showTrack(vehicle: Vehicle) {
  //   this.AVLHTTPservice.getTrackCall(this.token, vehicle.id).subscribe((x) => {
  //     console.log(x)
  //   })
  // }

  public clearTracks() {
    this.mapConfig.map.removeLayer(this.AVLConfig.olTrackLayer)
    this.AVLConfig.selectedVehicle = new Vehicle
    this.tab = "Vehicles"
  }

  public getFeatureList() {
    return false
  }

  public loadLayer() {
    console.log('AVLComponent Loadlayer')
    this.AVLservice.createLayer(this.mapConfig, this.AVLConfig.UPL)
    this.AVLservice.getToken().subscribe((x) => {
      this.AVLConfig.token = x
      this.buildConfig().then(() => {
        this.AVLservice.mapCurrentLocations(this.AVLConfig)
      })
    })
    this.AVLConfig.UPL.updateInterval = setInterval(() => {
      this.reloadLayer()
    },20000)
    return this.AVLservice.loadLayer(this.mapConfig, this.AVLConfig.UPL)
  }

  public unloadLayer(layer: UserPageLayer) {
    this.visible = false
    this.AVLConfig.olTrackLayer.setVisible(false)
    return this.AVLservice.unloadLayer(layer)
  }

  public selectFeature(layer: UserPageLayer) {
    let loadedImage: Image = this.AVLservice.selectFeature(layer)
    if (loadedImage.function == 'add') {
      this.loadedImages.push(loadedImage)
    }
    if (loadedImage.function == 'subtract') {
      this.loadedImages.splice(this.loadedImages.indexOf(loadedImage), 1)
    }
    return true
  }

  public clearFeature(layer: UserPageLayer) {
    return false
  }

  public setOpacity(e: EventEmitter<MatSliderChange>) {
    this.AVLservice.images.forEach((x) => {
      if (x.layer) {
        x.layer.setOpacity(e['value'] / 100)
      }
    })
    this.AVLservice.setOpacity(e['value'] / 100)
  }

  public setCurrentLayer(layer: UserPageLayer): boolean {
    console.log("AVL setCurrentLayer")
    if (this.AVLConfig.olTrackLayer) {this.AVLConfig.olTrackLayer.setVisible(true)}
    this.visible = true
    this.expanded = true
    return (this.AVLservice.setCurrentLayer(layer))
  }

  public unsetCurrentLayer(layer: UserPageLayer): boolean {
    this.visible = false
    return true
  }

  public unstyleSelectedFeature(layer: UserPageLayer): boolean {
    return false
  }

  public copyURL(image: Image) {
    Clipboard.copy(image.properties.wmts)
    this.snackBar.open("Copied to the clipboard", "", {
      duration: 2000,
    });
  }
  public zoomToFeature(image: Image) {
    this.mapConfig.view.fit(image.feature.getGeometry().getExtent(), {
      duration: 1000,
      maxZoom: 18
    })
  }
  public removeImage(image: Image) {
    this.AVLservice.removeImage(image)
    this.loadedImages.splice(this.loadedImages.indexOf(image), 1)
  }
  ngOnDestroy() {
      console.log('destroying AVLComponent')
      this.mapConfig.map.removeLayer(this.AVLConfig.olTrackLayer)
      clearInterval(this.AVLConfig.UPL.updateInterval)
    // let layer: UserPageLayer
    // this.AVLservice.unloadLayer(layer)
  }
}
