import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField } from '_models/layer.model';
import { UserPageInstance } from '_models/module.model'
import { MapConfig, mapStyles, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
//http dependancies
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Observable ,  Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SQLService } from '../../../../_services/sql.service';
import { MyCubeService } from '../../../map/services/mycube.service'
import { UserPageLayerService } from '../../../../_services/_userPageLayer.service'
import VectorLayer from 'ol/layer/Vector';

@Injectable()
export class OpenAerialMapAdminService {
  public completed: string
  public vectorlayer = new VectorLayer()
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
  userPageInstance.module_instance.settings.properties.forEach((x) => {
    if (x.stringType.name == "myCube Layer Identity (integer)") {
      UPL.layerID = +x.stringType.value
    }
  })
  console.log(UPL)
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
