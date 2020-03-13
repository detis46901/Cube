import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig } from '../../../map/models/map.model';
import { Subscription } from 'rxjs';
import { WMSService } from '../../../map/services/wms.service'
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { OpenAerialMapService } from './open-aerial-map.service'
import { ModuleInstance } from '_models/module.model';

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
  public disabled: boolean = true
  public expanded: boolean = false
  public disabledSubscription: Subscription;

  ngOnInit() {
    this.disabledSubscription = this.openAerialMapService.getDisabled().subscribe(disabled => {this.expanded = false; this.disabled = disabled})
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
