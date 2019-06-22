import { Component, OnInit, Input, ComponentFactoryResolver, EventEmitter } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig } from '../../../map/models/map.model';
import { geoJSONService } from './../../../map/services/geoJSON.service';
import { FeatureModulesService } from '../../feature-modules.service'
import { Subscription } from 'rxjs/Subscription';
import { MyCubeField, MyCubeConfig, MyCubeComment } from "../../../../_models/layer.model"
import { UserService } from '../../../../_services/_user.service'
import { User } from '../../../../_models/user.model'
import { getTypeNameForDebugging } from '@angular/common/src/directives/ng_for_of';
import { filter } from 'rxjs/operators';
import { WMSService } from '../../../map/services/wms.service'
import { Image, coord, poly } from './open-aerial-map.model'
import { MatDialog, MatSliderChange } from '@angular/material';
import { OpenAerialMapService } from './open-aerial-map.service'


import * as ol from 'openlayers';

@Component({
  selector: 'app-open-aerial-map',
  templateUrl: './open-aerial-map.component.html',
  styleUrls: ['./open-aerial-map.component.css']
})
export class OpenAerialMapComponent implements OnInit {

  constructor(private wmsService: WMSService, private dialog: MatDialog, public openAerialMapService: OpenAerialMapService) {
    this.disabledSubscription = this.openAerialMapService.getDisabled().subscribe(disabled => {this.expanded = false; this.disabled = disabled})
  }

  @Input() mapConfig: MapConfig;
  @Input() instanceID: number;
  @Input() user: string;
  public canEdit: boolean = false
  public disabled: boolean = true
  public expanded: boolean = false
  public disabledSubscription: Subscription;



  ngOnInit() {
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

  ngOnDestroy() {
    let layer: UserPageLayer
    this.openAerialMapService.unloadLayer(this.mapConfig, layer)
    }
}
