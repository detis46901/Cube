import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField } from '_models/layer.model';
import { UserPageInstance } from '_models/module.model'
import { MapConfig, mapStyles, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
//http dependancies
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import { SQLService } from '../../../../_services/sql.service';
import { Subject } from 'rxjs/Subject';
import { MyCubeService } from '../../../map/services/mycube.service'
import { UserPageLayerService } from '../../../../_services/_userPageLayer.service'
import * as ol from 'openlayers';




@Injectable()
export class OpenAerialMapAdminService {
  public completed: string
  public vectorlayer = new ol.layer.Vector()
  public mapConfig: MapConfig
  public layer: UserPageLayer
  public filter: string = 'closed IS Null'
  private ID = new Subject<string>()
  private expanded = new Subject<boolean>();


  constructor(private geojsonservice: geoJSONService, 
    protected _http: HttpClient, 
    private sqlService: SQLService, 
    private myCubeService: MyCubeService,
    private userPageLayerService: UserPageLayerService) { }


public addModuleToPage(userPageInstance:UserPageInstance) {
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
}
}