import { Injectable } from '@angular/core';
import { MapConfig } from '../map/models/map.model';
import { UserPageLayer } from '_models/layer.model';

//add the service name
import { LocatesService } from '../feature-modules/feature-modules/locates/locates.service'
import { OpenAerialMapService } from '../feature-modules/feature-modules/open-aerial-map/open-aerial-map.service'
import { SDSService } from '../feature-modules/feature-modules/SDS/SDS.service'
import { WOService } from './feature-modules/WO/WO.service'
import { PaserService } from './feature-modules/paser/paser.service'
import { Feature } from 'ol';

@Injectable()
export class FeatureModulesService {

  //add [module identity] + 'service: ' + [module service name]
  constructor(
    public locatesservice: LocatesService, public openAerialMapservice: OpenAerialMapService, public SDSservice: SDSService, public WOservice: WOService, public paserservice: PaserService) { }

  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer, init?: boolean): boolean {
    console.log('feature-modules.service loadLayer')
    console.log(layer.userPageInstanceID)
    if (!(layer.userPageInstanceID > 0)) { return false }
    let i = '.loadLayer(mapConfig, layer, init)'
    console.log('feature-module.service loadLayer()')
    try {return eval(this.getItentity(mapConfig, layer) + i)}
    catch(error) {
      console.log(error)
      return false
    }
  }
  // public unloadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
  //   if (!(layer.userPageInstanceID > 0)) { return false }
  //   let i = '.unloadLayer(layer)'
  //   return eval(this.getItentity(mapConfig, layer) + i)
  // }
  // public setCurrentLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
  //   if (!(layer.userPageInstanceID > 0)) { return false }
  //   let i = '.setCurrentLayer(layer)'
  //   return eval(this.getItentity(mapConfig, layer) + i)
  // }
  // public unsetCurrentLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
  //   if (!(layer.userPageInstanceID > 0)) { return false }
  //   let i = '.unsetCurrentLayer(layer)'
  //   return eval(this.getItentity(mapConfig, layer) + i)
  // }
  // public selectFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
  //   if (!(layer.userPageInstanceID > 0)) { return false }
  //   let i = '.selectFeature(layer)'
  //   return eval(this.getItentity(mapConfig, layer) + i)
  // }
  // public clearFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
  //   if (!(layer.userPageInstanceID > 0)) { return false }
  //   let i = '.clearFeature(layer)'
  //   return eval(this.getItentity(mapConfig, layer) + i)
  // }
  // public styleSelectedFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
  //   if (!(layer.userPageInstanceID > 0)) { return false }
  //   let i = '.styleSelectedFeature(layer)'
  //   return eval(this.getItentity(mapConfig, layer) + i)
  // }
  // public unstyleSelectedFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
  //   if (!(layer.userPageInstanceID > 0)) { return false }
  //   let i = '.unstyleSelectedFeature(layer)'
  //   return eval(this.getItentity(mapConfig, layer) + i)
  // }
  // public getFeatureList(mapConfig: MapConfig, layer: UserPageLayer): boolean {
  //   if (!(layer.userPageInstanceID > 0)) { return false }
  //   let i = '.getFeatureList(layer)'
  //   return eval(this.getItentity(mapConfig, layer) + i)
  // }
  public styleLayer(mapConfig: MapConfig, layer: UserPageLayer, feature: Feature, version: string): any {
    if (!(layer.userPageInstanceID > 0)) { return false }
    let i = '.styleLayer(layer, feature, version)'
    return eval(this.getItentity(mapConfig, layer) + i)
  }
  
  public draw(mapConfig: MapConfig, layer: UserPageLayer, featuretype): boolean {
    if (!(layer.userPageInstanceID > 0)) { return false }
    let i = '.draw(layer, featuretype)'
    try {
      return eval(this.getItentity(mapConfig, layer) + i)
    }
    catch (error) {
      return false
    }
  }
  // public checkSearch(mapConfig: MapConfig, layer: UserPageLayer): string {
  //   if (!(layer.userPageInstanceID > 0)) { return "Create Point" }
  //   let i = '.checkSearch(layer)'
  //   try {
  //     return eval(this.getItentity(mapConfig, layer) + i)
  //   }
  //   catch (error) {
  //     return "Create Point"
  //   }
  // }
  // public createPoint(mapConfig: MapConfig, layer: UserPageLayer): boolean {
  //   if (!(layer.userPageInstanceID > 0)) { return false }
  //   let i = '.createPoint(layer)'
  //   return eval(this.getItentity(mapConfig, layer) + i)
  // }
  public getItentity(mapConfig: MapConfig, layer: UserPageLayer): string {
    let tempinstancerow = mapConfig.userpageinstances.findIndex(x => x.ID == layer.userPageInstanceID)
    let tempInstance = mapConfig.userpageinstances[tempinstancerow]
    return 'this.' + tempInstance.module_instance.module.identity + 'service'
  }
}
