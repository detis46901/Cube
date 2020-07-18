import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs';
import { WMSService } from '../../../map/services/wms.service'
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { OpenAerialMapService } from './open-aerial-map.service'
import { ModuleInstance } from '_models/module.model';
import Observable from 'ol/Observable';
import { User } from '_models/user.model';
import { Image } from './open-aerial-map.model'
import { Clipboard } from 'ts-clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-open-aerial-map',
  templateUrl: './open-aerial-map.component.html',
  styleUrls: ['./open-aerial-map.component.css']
})
export class OpenAerialMapComponent implements OnInit {

  constructor(private wmsService: WMSService, private dialog: MatDialog, public openAerialMapService: OpenAerialMapService, public snackBar: MatSnackBar
    ) {}

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;
  @Input() user: string;
  public canEdit: boolean = false
  public visible: boolean = false
  public expanded: boolean = false
  public disabledSubscription: Subscription;
  public loadedImages = new Array<Image>()
  public opacityValue: number = 100


  ngOnInit() {
    this.openAerialMapService.mapConfig = this.mapConfig
  }

  public getFeatureList() {
    return false
  }
  
  public unloadLayer(layer: UserPageLayer) {
    this.visible = false
    this.loadedImages = new Array<Image>()
    return this.openAerialMapService.unloadLayer(layer)
  }
  
  public selectFeature(layer: UserPageLayer) {
    let loadedImage:Image =  this.openAerialMapService.selectFeature(layer)
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

  public setOpacity(e:EventEmitter<MatSliderChange>) {
    this.openAerialMapService.images.forEach((x) => {
      if (x.layer){
        x.layer.setOpacity(e['value']/100)
      }
    })
    this.openAerialMapService.setOpacity(e['value']/100)
  }

  public setCurrentLayer(layer: UserPageLayer):boolean {
    this.visible = true
    this.expanded = true
    return (this.openAerialMapService.setCurrentLayer(layer))
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
public removeImage(image:Image) {
  this.openAerialMapService.removeImage(image)
  this.loadedImages.splice(this.loadedImages.indexOf(image), 1)
}
  ngOnDestroy() {
    let layer: UserPageLayer
    this.openAerialMapService.unloadLayer(layer)
    }
}
