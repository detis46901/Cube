import { Injectable } from '@angular/core';
import { MapConfig } from '../map/models/map.model';
import { UserPageLayer } from '_models/layer.model';

//add the service name
import {LocatesService } from '../feature-modules/feature-modules/locates/locates.service'
import { OpenAerialMapService} from '../feature-modules/feature-modules/open-aerial-map/open-aerial-map.service'



@Injectable()
export class FeatureModulesService {

  //add [module identity] + 'service: ' + [module service name]
  constructor(public locatesservice: LocatesService, public openAerialMapservice: OpenAerialMapService) { }

  public determineModule() {

  }

  public loadLayer(mapConfig:MapConfig, layer:UserPageLayer):boolean {
    let tempinstancerow = mapConfig.userpageinstances.findIndex(x => x.ID == layer.userPageInstanceID)
    let tempInstance = mapConfig.userpageinstances[tempinstancerow]
    let j = 'this.' + tempInstance.module_instance.module.identity + 'service'
    return eval(j + '.loadLayer(mapConfig, layer)')
  }
  public unloadLayer(mapConfig:MapConfig, layer:UserPageLayer):boolean {
    let tempinstancerow = mapConfig.userpageinstances.findIndex(x => x.ID == layer.userPageInstanceID)
    let tempInstance = mapConfig.userpageinstances[tempinstancerow]
    let j = 'this.' + tempInstance.module_instance.module.identity + 'service'
    return eval(j + '.unloadLayer(mapConfig, layer)')
  }
  public setCurrentLayer(mapConfig:MapConfig, layer:UserPageLayer):boolean {
    let tempinstancerow = mapConfig.userpageinstances.findIndex(x => x.ID == layer.userPageInstanceID)
    let tempInstance = mapConfig.userpageinstances[tempinstancerow]
    let j = 'this.' + tempInstance.module_instance.module.identity + 'service'
    return eval(j + '.setCurrentLayer(mapConfig, layer)')
  }

  public unsetCurrentLayer(mapConfig:MapConfig, layer:UserPageLayer):boolean {
    let tempinstancerow = mapConfig.userpageinstances.findIndex(x => x.ID == layer.userPageInstanceID)
    let tempInstance = mapConfig.userpageinstances[tempinstancerow]
    let j = 'this.' + tempInstance.module_instance.module.identity + 'service'
    return eval(j + '.unsetCurrentLayer(mapConfig, layer)')
  }

  public selectFeature(mapConfig:MapConfig, layer:UserPageLayer):boolean {
    let tempinstancerow = mapConfig.userpageinstances.findIndex(x => x.ID == layer.userPageInstanceID)
    let tempInstance = mapConfig.userpageinstances[tempinstancerow]
    let j = 'this.' + tempInstance.module_instance.module.identity + 'service'
    return eval(j + '.selectFeature(mapConfig, layer)')
  }
  public clearFeature(mapConfig:MapConfig, layer:UserPageLayer):boolean {
    let tempinstancerow = mapConfig.userpageinstances.findIndex(x => x.ID == layer.userPageInstanceID)
    let tempInstance = mapConfig.userpageinstances[tempinstancerow]
    let j = 'this.' + tempInstance.module_instance.module.identity + 'service'
    return eval(j + '.clearFeature(mapConfig, layer)')
  }
  public styleSelectedFeature(mapConfig:MapConfig, layer:UserPageLayer):boolean {
    let tempinstancerow = mapConfig.userpageinstances.findIndex(x => x.ID == layer.userPageInstanceID)
    let tempInstance = mapConfig.userpageinstances[tempinstancerow]
    let j = 'this.' + tempInstance.module_instance.module.identity + 'service'
    return eval(j + '.styleSelectedFeature(mapConfig, layer)')
  }
  public unstyleSelectedFeature(mapConfig:MapConfig, layer:UserPageLayer):boolean {
    let tempinstancerow = mapConfig.userpageinstances.findIndex(x => x.ID == layer.userPageInstanceID)
    let tempInstance = mapConfig.userpageinstances[tempinstancerow]
    let j = 'this.' + tempInstance.module_instance.module.identity + 'service'
    return eval(j + '.unstyleSelectedFeature(mapConfig, layer)')
  }
  public getFeatureList(mapConfig:MapConfig, layer:UserPageLayer):boolean {
    let i = '.getFeatureList(mapConfig, layer)'
    return eval(this.getItentity(mapConfig, layer) + i)
  }
  public getItentity(mapConfig: MapConfig, layer:UserPageLayer): string {
    let tempinstancerow = mapConfig.userpageinstances.findIndex(x => x.ID == layer.userPageInstanceID)
    let tempInstance = mapConfig.userpageinstances[tempinstancerow]
    return 'this.' + tempInstance.module_instance.module.identity + 'service'
  }
}
