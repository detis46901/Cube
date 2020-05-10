import { Component, OnInit, Input,ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { MapConfig } from '../map/models/map.model';
import { SDSComponent } from './feature-modules/SDS/SDS.component';
import { UserPageLayer } from '_models/layer.model';
import { OpenAerialMapComponent } from './feature-modules/open-aerial-map/open-aerial-map.component';
import { LocatesComponent } from './feature-modules/locates/locates.component';
import { WOComponent } from './feature-modules/WO/WO.component'
import { featureModule } from './feature-modules.model'

@Component({
  selector: 'app-feature-modules',
  templateUrl: './feature-modules.component.html',
  providers: [],
  styleUrls: ['./feature-modules.component.css']
})

export class FeatureModulesComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor() { 
  }

  @Input() mapConfig: MapConfig;
  //@Output() need to set up an output to send back to map.component once the view is initialized so it can send load commands for module related layers
  @ViewChildren(SDSComponent) SDS: QueryList<SDSComponent>
  @ViewChildren(LocatesComponent) locates: QueryList<LocatesComponent>
  @ViewChildren(FeatureModulesComponent) components: QueryList<any>
  @ViewChildren(OpenAerialMapComponent) OAM: QueryList<any>
  @ViewChildren(WOComponent) WO: QueryList<any>

  private featureModule = new Array<featureModule>()

  ngOnInit() {
    console.log('FM initiated')
  }

  ngAfterViewInit() {
    this.setComponents();
  }

  ngOnDestroy() {
    console.log('FM being destroyed')
  }

  public setComponents() {
    this.featureModule = new Array<featureModule>()
    this.SDS.forEach(SDSInstance => {
      let FM = new featureModule;
      FM.moduleInstanceID = SDSInstance.instance.ID;
      FM.componentReference = SDSInstance;
      this.featureModule.push(FM);
    });
    this.locates.forEach(locatesInstance => {
      let FM = new featureModule;
      FM.moduleInstanceID = locatesInstance.instance.ID;
      FM.componentReference = locatesInstance;
      this.featureModule.push(FM);
    });
    this.OAM.forEach(Instance => {
      let FM = new featureModule;
      FM.moduleInstanceID = Instance.instance.ID;
      FM.componentReference = Instance;
      this.featureModule.push(FM);
    });
    this.WO.forEach(Instance => {
      let FM = new featureModule;
      FM.moduleInstanceID = Instance.instance.ID;
      FM.componentReference = Instance;
      this.featureModule.push(FM);
    })
  }

  public checkSomething(action: string, layer: UserPageLayer, ):Promise<boolean> {
    console.log(action)
    if (!this.featureModule) {this.setComponents()}
    let promise = new Promise<boolean>((resolve) => {
      if (!layer.user_page_instance) {
        return false
      }
      this.featureModule.forEach((FM:featureModule) => {
        if (FM.moduleInstanceID == layer.user_page_instance.moduleInstanceID) {
          try {
            switch(action) {
              case 'loadLayer': {
                resolve(FM.componentReference.loadLayer(layer))
                break
              }
              case 'unloadLayer': {
                resolve(FM.componentReference.unloadLayer(layer))
                break
              }
              case 'setCurrentLayer': {
                resolve(FM.componentReference.setCurrentLayer(layer))
                break
              }
              case 'unsetCurrentLayer': {
                resolve(FM.componentReference.unsetCurrentLayer(layer))
                break
              }
              case 'styleMyCube': {
                resolve(FM.componentReference.styleMyCube(layer))
                break
              }
              case 'styleSelectedFeature': {
                resolve(FM.componentReference.styleSelectedFeature(layer))
                break
              }
              case 'selectFeature': {
                resolve(FM.componentReference.selectFeature(layer))
                break
              }
              case 'getFeatureList': {
                resolve(FM.componentReference.getFeatureList(layer))
                break
              }
              case 'clearFeature': {
                resolve(FM.componentReference.clearFeature(layer))
                break
              }
              case 'unstyleSelectedFeature': {
                resolve(FM.componentReference.unstyleSelectedFeature(layer))
                break
              }
              case 'draw Point': {
                resolve(FM.componentReference.draw(layer, 'Point'))
                break
              }
              case 'draw LineString': {
                resolve(FM.componentReference.draw(layer, 'LineString'))
                break
              }
              case 'draw Polygon': {
                resolve(FM.componentReference.draw(layer, 'Polygon'))
                break
              }
              case 'testLayer': {
                resolve(true)
                break
              }
            }
          }
          catch(error) {
            console.log(error)
            console.log('probably no procedure in the feature')
            resolve(false)
          }
          }
      })  
      resolve(false)
    })
    return promise
  }
}
