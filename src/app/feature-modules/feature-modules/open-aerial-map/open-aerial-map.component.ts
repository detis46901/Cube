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


@Component({
  selector: 'app-open-aerial-map',
  templateUrl: './open-aerial-map.component.html',
  styleUrls: ['./open-aerial-map.component.css']
})
export class OpenAerialMapComponent implements OnInit {

  constructor(private wmsService: WMSService, private dialog: MatDialog, public openAerialMapService: OpenAerialMapService) {}

  @Input() mapConfig: MapConfig;
  @Input() instance: ModuleInstance;
  @Input() user: string;
  public canEdit: boolean = false
  public visible: boolean = false
  public expanded: boolean = false
  public disabledSubscription: Subscription;

  ngOnInit() {
    this.openAerialMapService.mapConfig = this.mapConfig
  }

  public getFeatureList() {
    return false
  }
  
  public unloadLayer(layer: UserPageLayer) {
    this.visible = false
    return this.openAerialMapService.unloadLayer(layer)
  }
  
  public selectFeature(layer: UserPageLayer) {
    return this.openAerialMapService.selectFeature(layer)
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
    console.log(e)
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

  ngOnDestroy() {
    let layer: UserPageLayer
    this.openAerialMapService.unloadLayer(layer)
    }
}
