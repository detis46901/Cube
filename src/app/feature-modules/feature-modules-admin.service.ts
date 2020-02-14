import { Injectable } from '@angular/core';
import { UserPageInstance, ModuleInstance } from '_models/module.model';
import { LocatesAdminService } from './feature-modules/locates/locates-admin.service'
import { OpenAerialMapAdminService} from './feature-modules/open-aerial-map/open-aerial-map-admin.service'
import { SDSAdminService } from './feature-modules/SDS/SDS-admin.service'
import { WOAdminService } from './feature-modules/WO/WO-admin.service'

//add the service name


@Injectable()
export class FeatureModulesAdminService {

  //add [module identity] + 'service: ' + [module service name]
  constructor(public locatesadminservice: LocatesAdminService, public openAerialMapadminservice: OpenAerialMapAdminService, public SDSadminservice: SDSAdminService, public WOadminservice: WOAdminService) { }

  public determineModule() {

  }
    ////////////////////////Set Up Methods////////////////////////////////////
    public addModuleToPage(userPageInstance: UserPageInstance) {
      console.log('adding module to instance')
      console.log(userPageInstance)
      let j = 'this.' + userPageInstance.module_instance.module.identity + 'adminservice'
      console.log(j)
      return eval(j + '.addModuleToPage(userPageInstance)')
    }
    public removeModuleFromPage(userPageInstance: UserPageInstance) {
      console.log('adding module to instance')
      console.log(userPageInstance)
      let j = 'this.' + userPageInstance.module_instance.module.identity + 'adminservice'
      return eval(j + '.removeModuleFromPage(userPageInstance)')
    }
    public createModuleInstance(moduleInstance: ModuleInstance) {
      console.log('create module to instance')
      console.log(moduleInstance)
      let j = 'this.' + moduleInstance.module.identity + 'adminservice'
      return eval(j + '.createModuleInstance(moduleInstance)')
    }
    public deleteModuleInstance(moduleInstance: ModuleInstance) {
      console.log('delete module instance')
      console.log(moduleInstance)
      let j = 'this.' + moduleInstance.module.identity + 'adminservice'
      return eval(j + '.deleteModuleInstance(moduleInstance)')
    }
}
