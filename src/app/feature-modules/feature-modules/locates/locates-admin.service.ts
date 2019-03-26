import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField } from '_models/layer.model';
import { UserPageInstance, ModuleInstance } from '_models/module.model'
import { Layer } from '_models/layer.model'
import { MapConfig, mapStyles, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
import { Locate, locateStyles } from './locates.model'
//http dependancies
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import { SQLService } from '../../../../_services/sql.service';
import { Subject } from 'rxjs/Subject';
import { MyCubeService } from '../../../map/services/mycube.service'
import { UserPageLayerService } from '../../../../_services/_userPageLayer.service'
import { LayerService } from '../../../../_services/_layer.service'
import { LayerPermissionService } from '../../../../_services/_layerPermission.service'
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'
import { UserPageInstanceService } from '../../../../_services/_userPageInstance.service'
import * as ol from 'openlayers';
import { P } from '@angular/core/src/render3';




@Injectable()
export class LocatesAdminService {
  public completed: string
  public vectorlayer = new ol.layer.Vector()
  public locate = new Locate()
  public mapConfig: MapConfig
  public UPL: UserPageLayer
  public filter: string = 'closed IS Null'
  private ticket = new Subject<Locate>();
  private ID = new Subject<string>()
  private expanded = new Subject<boolean>();
  private layer = new Layer
  public newLayerFields: Array<MyCubeField> = [];



  constructor(private geojsonservice: geoJSONService,
    protected _http: HttpClient,
    private sqlService: SQLService,
    private myCubeService: MyCubeService,
    private locateStyles: locateStyles,
    private userPageLayerService: UserPageLayerService,
    private layerService: LayerService,
    private moduleInstanceService: ModuleInstanceService,
    private layerPermissionService: LayerPermissionService,
    private userPageInstanceService: UserPageInstanceService) {
  }


  public addModuleToPage(userPageInstance: UserPageInstance) {
    console.log("addModuleToPage")
    console.log(userPageInstance)
    let UPL = new UserPageLayer
    UPL.defaultON = true
    UPL.layerID = userPageInstance.module_instance.settings['settings'][0]['setting']['value']
    UPL.userPageInstanceID = userPageInstance.ID
    UPL.userPageID = userPageInstance.userPageID
    UPL.userID = userPageInstance.userID
    this.userPageLayerService.Add(UPL)
      .subscribe(data => {
        console.log(data)
      })

  }

  public removeModuleFromPage(userPageInstance: UserPageInstance) {
    console.log("removeModuleFromPage")
    this.userPageLayerService.GetUserLayers(userPageInstance.userID)
      .subscribe((data: UserPageLayer[]) => {
        data.forEach(x => {
          if (x.userPageInstanceID == userPageInstance.ID) {
            this.userPageLayerService.Delete(x.ID)
              .subscribe((data) => {
                console.log(data)
              })
          }
        })
      })
  }

  public createModuleInstance(moduleInstance: ModuleInstance) {
    this.layer.layerName = moduleInstance.name
    this.layer.layerDescription = moduleInstance.description
    this.layer.layerGeom = 'None'
    this.layer.layerFormat = 'None'
    this.layer.layerIdent = 'None'
    this.layer.layerService = 'None'
    this.layer.layerType = 'MyCube'
    this.layer.serverID = 0
    this.layer.defaultStyle = JSON.parse('{"load":{"color":"#000000","width":2},"current":{"color":"#000000","width":4},"listLabel": "Name","filter": {}}')
    this.addLayer(moduleInstance)
  }

  public deleteModuleInstance(moduleInstance: ModuleInstance) {
    this.layerService.Delete(moduleInstance.settings['settings'][0]['setting']['value'])
    .subscribe()
    this.sqlService.deleteTable(moduleInstance.settings['settings'][0]['setting']['value'])
    .subscribe()
    this.sqlService.deleteCommentTable(moduleInstance.settings['settings'][0]['setting']['value'])
    .subscribe()
    this.userPageLayerService.GetByLayer(moduleInstance.settings['settings'][0]['setting']['value'])
    .subscribe((x:UserPageLayer[]) => {
      x.forEach((y:UserPageLayer) => {
        y.userPageInstanceID = null
        //need to fix this delete.  It deleted all userpagelayers once!
        // this.userPageLayerService.Delete(y.ID)
        // .subscribe()
      })
    })
  }

  private addLayer(moduleInstance: ModuleInstance): void {
    this.layerService
      .Add(this.layer)
      .subscribe((result: Layer) => {
        this.createTable(result.ID);
        this.updateSettings(result.ID, moduleInstance)
      });
  }

  updateSettings(ID, moduleInstance:ModuleInstance) {
    moduleInstance.settings['settings'][0]['setting']['value'] = ID
    this.moduleInstanceService
    .Update(moduleInstance)
    .subscribe((result) => {
        console.log("Settings Updated")
    });
  }
  
  private createTable(id): void {
    this.sqlService
      .Create(id)
      .subscribe((result: JSON) => {
        console.log(this.locate)
        Object.keys(this.locate).forEach((key) => {
          let tempField = new MyCubeField
          tempField.field = key
          console.log(tempField)
          switch (tempField.field) {
            case 'ttime': {
              tempField.type = 'date'
              break
            }
            case 'tdate':{
              tempField.type = 'date'
              break
            }
            case 'sdate': {
              tempField.type = 'date'
              break
            }

            default: {
              tempField.type = "text"
            }
          }
          if (tempField.field != 'geom' || 'id') {this.addColumn(id, tempField)} 
        });

        this.sqlService
          .setSRID(id)
          .subscribe(() => { })
      })

    this.sqlService
      .CreateCommentTable(id)
      .subscribe();
    console.log("Comment Table Created")
  }
  private addColumn(id, element): void {
    this.sqlService
      .addColumn(id, element)
      .subscribe((result: string) => {
        console.log(result)
      });
  }

}