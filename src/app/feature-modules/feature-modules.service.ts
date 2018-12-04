import { Injectable } from '@angular/core';
import { MapConfig } from '../map/models/map.model';
import {LocatesService } from '../feature-modules/feature-modules/locates/locates.service'
import { UserPageLayer } from '_models/layer.model';

@Injectable()
export class FeatureModulesService {

  constructor(public locatesservice: LocatesService) { }

  public determineModule() {

  }

  public loadLayer(mapConfig:MapConfig, layer:UserPageLayer) {
    console.log('loading layer')
    this.locatesservice.loadLayer(mapConfig, layer)
  }

  public setCurrentLayer() {

  }

  public selectFeature() {

  }
}
