import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField } from '_models/layer.model';
import { UserPageInstance } from '_models/module.model'
import { MapConfig, mapStyles, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
import { Locate, locateStyles } from './locates.model'
import { StyleService } from './style.service'
import { MatSnackBar } from '@angular/material/snack-bar';
//http dependancies
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import { SQLService } from './../../../../_services/sql.service';
import { Subject } from 'rxjs/Subject';
import { MyCubeService } from './../../../map/services/mycube.service'
import * as ol from 'openlayers';
import { Http } from '@angular/http';
import { Router } from '@angular/router'




@Injectable()
export class LocatesService {
  public completed: string
  public vectorlayer = new ol.layer.Vector()
  public locate: Locate
  public mapConfig: MapConfig
  public layer: UserPageLayer
  public filter: string = 'closed IS Null'
  private ticket = new Subject<Locate>();
  private ID = new Subject<string>()
  private expanded = new Subject<boolean>();
  private tab = new Subject<string>();
  public sortBy: string = "Priority"
  public showSortBy: Boolean


  constructor(private geojsonservice: geoJSONService,
    protected _http: HttpClient,
    private styleService: StyleService,
    private sqlService: SQLService,
    private myCubeService: MyCubeService,
    private locateStyles: locateStyles,
    private snackBar: MatSnackBar) { }


  //loads the locate data
  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.layer = layer
    this.mapConfig = mapConfig
    this.clearFeature(this.mapConfig, this.layer)
    //Need to provide for clustering if the number of objects gets too high

    let stylefunction = ((feature:ol.Feature) => {
      return (this.styleService.styleFunction(feature, 'load'));
    })
    let source = new ol.source.Vector({
      format: new ol.format.GeoJSON()
    })

    //this.setDefaultStyleandFilter(layer)
    this.getMyLocateData(layer).then((data) => {
      if (data[0][0]['jsonb_build_object']['features']) {
        source.addFeatures(new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
      }
      // var clusterSource = new ol.source.Cluster({
      //   distance: 90,
      //   source: source
      // });
      this.vectorlayer = new ol.layer.Vector({
        source: source,
        style: stylefunction
      });
      this.vectorlayer.setVisible(layer.defaultON);
      mapConfig.map.addLayer(this.vectorlayer);
      layer.olLayer = this.vectorlayer
      layer.source = source
    })
    return true
  }

  public reloadLayer(version: string) {
    this.clearFeature(this.mapConfig, this.layer)
    let stylefunction = ((feature: ol.Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, version));
    })
    this.getMyLocateData(this.layer).then((data) => {
      this.layer.source.clear();
      if (data[0][0]['jsonb_build_object']['features']) {
        this.setData(data).then(() => {
        this.layer.source.forEachFeature((feat: ol.Feature) => {
          feat.setStyle(stylefunction);
        })
        if (this.layer == this.mapConfig.currentLayer) {
          this.getFeatureList(this.mapConfig, this.layer)
        }
      })
    }
    })
  }

  private setData(data):Promise<any>  {
    let promise = new Promise((resolve, reject) => {
        this.layer.source.addFeatures(new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']))
        resolve()
    })
    return promise;
  }

  private getFeatureList(mapConfig?, layer?): boolean {
    //console.log("locate service get featurelist")
    let k: number = 0;
    let tempList = new Array<featureList>();
    try {
      layer.source.forEachFeature((x: ol.Feature) => {
        let i = layer.source.getFeatures().findIndex((j) => j == x);

        let fl = new featureList;
        fl.id = x.get('id')
        if (x.get("address") == "") { fl.label = x.get("street") + " and " + x.get("crossst") }
        else {
          fl.label = x.get("address") + " " + x.get("street")
        }
        //fl.label = x.get("ticket")
        fl.feature = x
        if (i > -1 && fl != null) {
          tempList.push(fl)
          k += 1
        }
      })
      mapConfig.featureList = tempList.slice(0, k)
      this.sortByFunction()
    } catch (error) {
      console.error(error);
      clearInterval(mapConfig.currentLayer.updateInterval);
    }
    return true
  }

  public setCurrentLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.showSortBy = true
    this.reloadLayer('current')
    this.sendexpanded(true)
    return true
  }

  public unsetCurrentLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.reloadLayer('load')
    this.sendexpanded(false)
    this.showSortBy = false
    return true
  }

  public unloadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    return true
  }

  public selectFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.sqlService.GetSingle(this.layer.layerID, mapConfig.selectedFeature.get('id'))
      .subscribe((data: Locate) => {
        //console.log(data)
        this.sendTicket(data[0][0])
        this.sendTab('Process')
      })
    //this.sendTicket(mapConfig.selectedFeature.get('ticket'))
    this.sendID(mapConfig.selectedFeature.get('id'))
    this.mapConfig.selectedFeature.setStyle(this.locateStyles.selected)
    return false
  }

  public clearFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    let stylefunction = ((feature: ol.Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
    return (this.styleService.styleFunction(feature, 'current'));
  })
    this.sendTicket(null)
    this.sendID(null)
    this.myCubeService.clearMyCubeData()
    if (mapConfig.selectedFeature) { this.mapConfig.selectedFeature.setStyle(stylefunction) }
    return true
  }

  public styleSelectedFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    return true
  }

  public unstyleSelectedFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    let stylefunction = ((feature: ol.Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
    return (this.styleService.styleFunction(feature, 'current'));
  })
    console.log('unstyle')
    this.mapConfig.selectedFeature.setStyle(stylefunction)
    return true
  }

  public styleFunction(styleToUse: ol.style.Style): ol.style.Style {
    // let depth: string = feature.get('depth')
    // let depthnumber: number = +depth.split(' ')[0]
    // let depthunit: string = depth.split(' ')[1]

    //var size = feature.get('features').length;
    //var style = styleCache[size];
    //if (!style) {
    let style = styleToUse
    return style;

  }

  getTicket(): Observable<any> {
    return this.ticket.asObservable();
  }

  sendTicket(ticket: Locate) {
    this.ticket.next(ticket)
  }

  getTab(): Observable<any> {
    return this.tab.asObservable();
  }

  sendTab(tab: string) {
    this.tab.next(tab)
  }


  getID(): Observable<any> {
    return this.ID.asObservable();
  }

  sendID(ID: string) {
    this.ID.next(ID)
  }

  getExpanded(): Observable<any> {
    return this.expanded.asObservable();
  }

  sendexpanded(expanded: boolean) {
    this.expanded.next(expanded)
  }

  private getMyLocateData(layer): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.geojsonservice.GetSome(layer.layer.ID, this.filter)
        .subscribe((data: GeoJSON.Feature<any>) => {
          resolve(data);
        })
    })
    return promise;
  }

  public parseLocateInput(Loc: string, MapConfig: MapConfig, instanceID: number): void {
    this.mapConfig = MapConfig
    let locate = new Locate
    let i: number
    let ii: number
    try {
      let t = Loc.split("Ticket : ")
      locate.ticket = t[1].substr(0, 10)
      t = Loc.split("Date: ")
      locate.tdate = t[1].substr(0, 10)
      t = Loc.split("Time: ")
      locate.ttime = t[1].substr(0, 5)
      t = Loc.split("Subdivision:")
      locate.subdivision = t[1].split("Address :")[0]

      i = Loc.indexOf("Address :")
      ii = Loc.indexOf("Street  :")
      if (i + 16 > ii) { locate.address = Loc.substring(i + 10, ii - 1) } else { locate.address = '' }
      i = Loc.indexOf("Street  :")
      ii = Loc.indexOf("Cross ")
      if (ii < 5) { ii = Loc.indexOf("Location") }
      locate.street = Loc.substr(i + 10, ii - i - 11)
      i = Loc.indexOf("Cross ")
      locate.crossst = ""
      if (i < 5) { locate.crossst = "" }
      else {
        ii = Loc.indexOf("Within")
        locate.crossst = Loc.substr(i + 10, ii - i - 11)
      }

      let Addname: string
      if (locate.address.length > 3) {
        Addname = locate.address + " " + locate.street + " Kokomo, IN"
      }
      else {
        Addname = locate.street + " and " + locate.crossst + " Kokomo, IN"
      }

      i = Loc.indexOf("Location")
      ii = Loc.indexOf("Grids")
      locate.location = Loc.substr(i + 10, ii - 2 - i - 10)

      i = Loc.indexOf("Boundary")
      let BN = Loc.substring(i + 12, i + 21)
      let BS = Loc.substring(i + 27, i + 36)
      let BW = Loc.substring(i + 42, i + 52)
      let BE = Loc.substring(i + 58, i + 68)

      //not sure I need this
      let Boundary = BW + " " + BN + "," + BE + " " + BN + "," + BE + " " + BS + "," + BW + " " + BS + "," + BW + " " + BN

      i = Loc.indexOf("Work type")
      ii = Loc.indexOf("Done for")

      locate.wtype = Loc.substring(i + 12, ii - 1)

      i = Loc.indexOf("Done for")
      ii = Loc.indexOf("Start date")
      locate.dfor = Loc.substring(i + 12, ii - 1)

      i = Loc.indexOf("Start date")
      locate.sdate = Loc.substring(i + 12, i + 22)
      locate.stime = Loc.substring(i + 30, i + 35)

      i = Loc.indexOf("Priority")
      locate.priority = Loc.substring(i + 10, i + 14)

      i = Loc.indexOf("Blasting:")
      let BlastingYN = Loc.substring(i + 10, i + 11)
      if (BlastingYN == "Y") {
        locate.blasting = 't'
      }
      else {
        locate.blasting = 'f'
      }

      i = Loc.indexOf("Boring:")
      if (Loc.substring(i + 8, i + 9) == 'Y') { locate.boring = 't' }
      else { locate.boring = 'f' }

      i = Loc.indexOf("Railroad:")
      if (Loc.substring(i + 10, i + 11) == "Y") { locate.railroad = 't' }
      else { locate.railroad = 'f' }

      i = Loc.indexOf("Emergency: ")
      if (Loc.substring(i + 11, i + 12) == "Y") { locate.emergency = 't' }
      else { locate.emergency = 'f' }

      i = Loc.indexOf("Duration  :")
      ii = Loc.indexOf("Depth:")
      locate.duration = Loc.substring(i + 12, ii - 1)

      i = Loc.indexOf("Depth:")
      ii = Loc.indexOf("Company :")
      locate.depth = Loc.substring(i + 7, ii - 2)

      i = Loc.indexOf("Company :")
      ii = Loc.indexOf("Type:")
      locate.company = Loc.substring(i + 10, ii - 1)

      i = Loc.indexOf("Type:")
      ii = Loc.indexOf("Co addr :")
      locate.ctype = Loc.substring(i + 6, ii - 1)

      i = Loc.indexOf("Co addr")
      ii = Loc.indexOf("City    :")
      locate.coaddr = Loc.substring(i + 10, ii - 1)

      i = Loc.indexOf("City    :")
      ii = Loc.indexOf("Zip:")
      locate.cocity = Loc.substring(i + 10, ii - 10)

      i = Loc.indexOf("Zip:")
      ii = Loc.indexOf("Caller  : ")
      locate.cozip = Loc.substring(i + 5, ii - 1)

      i = Loc.indexOf("Caller  : ")
      ii = Loc.indexOf("Phone:")
      locate.caller = Loc.substring(i + 10, ii - 1)

      i = Loc.indexOf("Phone:")
      ii = Loc.indexOf("Contact :")
      if (ii < 5) {
        ii = Loc.indexOf("BestTime")
      }
      locate.callphone = Loc.substring(i + 7, ii - 1)

      i = Loc.indexOf("Contact :")
      if (i < 5) { locate.contact = "" }
      else {
        ii = Loc.lastIndexOf("Phone:")
        locate.contact = Loc.substring(i + 10, ii - 1)
      }

      i = Loc.indexOf("Mobile  :")
      if (i < 5) { locate.mobile = "" }
      else {
        ii = Loc.indexOf("Fax")
        if (ii > 0) {
          locate.mobile = Loc.substring(i + 10, ii - 1)
        }
        else {
          locate.mobile = Loc.substring(i + 10, i + 23)
        }
      }

      i = Loc.indexOf("Fax  ")
      ii = Loc.indexOf("Email  ")
      if (i > 0) {
        if (ii > 0) {
          locate.fax = Loc.substring(i + 10, ii - 1)
        }
        else {
          locate.fax = Loc.substring(i + 10, i + 23)
        }
      }
      else {
        locate.fax = ""
      }

      i = Loc.indexOf("Email  ")
      ii = Loc.indexOf("Remarks ")
      if (i > 0) {
        locate.email = Loc.substring(i + 10, ii - 2)
      }
      else {
        locate.email = ""
      }


      this.locate = locate
      this.geolocate(Addname, instanceID)
    }
    catch (e) {
      let snackBarRef = this.snackBar.open('Locate email is not formed correctly.', '', {
        duration: 4000
      });
    }
  }

  private geolocate(addName: string, instanceID: number) {
    let geometry: JSON
    let httpP = new HttpParams()
    httpP = httpP.append("address", addName)
    httpP = httpP.append("components", "administrative_area:Howard")
    httpP = httpP.append("sensor", "false")
    httpP = httpP.append("key", "AIzaSyDAaLEIXTo6am6x0-QlegzxDnZLIN3mS-o")
    this.GetGeoLocation(httpP)
      .subscribe((results: string) => {
        let i = results.indexOf('<lat>')
        let ii = results.indexOf('</lat>')
        let lat = results.substring(i + 5, ii - 1)
        i = results.indexOf('<lng')
        ii = results.indexOf('</lng>')
        let lng = results.substring(i + 5, ii - 1)
        geometry = JSON.parse('{"type":"Feature","geometry":{"type":"Point","coordinates":[' + lng + ',' + lat + ']},"properties":null}')
        i = this.mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == instanceID)
        let obj = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'myCube Layer Identity (integer)')
        let table: number = obj['setting']['value']
        this.addRecord(table, geometry)
      })
  }

  public GetGeoLocation = (params: HttpParams): Observable<string> => {
    let options: any = {
      headers: new HttpHeaders({
        'Content-Type': 'text/xml',
        'Accept': 'text/xml',
        //'Access-Control-Allow-Origin': '*'
      })
    }
    return this._http.get<string>('https://maps.googleapis.com/maps/api/geocode/xml', { params: params, headers: options, responseType: 'text' as 'json' })
  }

  public addRecord(table, geometry: JSON) {
    this.sqlService.addRecord(table, geometry)
      .subscribe(data => {
        let id = data[0][0]['id']
        this.updateRecord(table, id, 'ticket', 'text', this.locate.ticket)
        this.updateRecord(table, id, 'tdate', 'date', this.locate.tdate)
        this.updateRecord(table, id, 'ttime', 'date', this.locate.ttime)
        this.updateRecord(table, id, 'subdivision', 'text', this.locate.subdivision)
        this.updateRecord(table, id, 'address', 'text', this.locate.address)
        this.updateRecord(table, id, 'street', 'text', this.locate.street)
        this.updateRecord(table, id, 'crossst', 'text', this.locate.crossst)
        this.updateRecord(table, id, 'location', 'text', this.locate.location)
        this.updateRecord(table, id, 'wtype', 'text', this.locate.wtype)
        this.updateRecord(table, id, 'dfor', 'text', this.locate.dfor)
        this.updateRecord(table, id, 'sdate', 'date', this.locate.sdate)
        this.updateRecord(table, id, 'stime', 'date', this.locate.stime)
        this.updateRecord(table, id, 'priority', 'text', this.locate.priority)
        this.updateRecord(table, id, 'blasting', 'text', this.locate.blasting)
        this.updateRecord(table, id, 'boring', 'text', this.locate.boring)
        this.updateRecord(table, id, 'railroad', 'text', this.locate.railroad)
        this.updateRecord(table, id, 'emergency', 'text', this.locate.emergency)
        this.updateRecord(table, id, 'duration', 'text', this.locate.duration)
        this.updateRecord(table, id, 'depth', 'text', this.locate.depth)
        this.updateRecord(table, id, 'company', 'text', this.locate.company)
        this.updateRecord(table, id, 'ctype', 'text', this.locate.ctype)
        this.updateRecord(table, id, 'coaddr', 'text', this.locate.coaddr)
        this.updateRecord(table, id, 'cocity', 'text', this.locate.cocity)
        this.updateRecord(table, id, 'cozip', 'text', this.locate.cozip)
        this.updateRecord(table, id, 'caller', 'text', this.locate.caller)
        this.updateRecord(table, id, 'callphone', 'text', this.locate.callphone)
        this.updateRecord(table, id, 'contact', 'text', this.locate.contact)
        this.updateRecord(table, id, 'mobile', 'text', this.locate.mobile)
        this.updateRecord(table, id, 'fax', 'text', this.locate.fax)
        this.updateRecord(table, id, 'email', 'text', this.locate.email)
        this.reloadLayer('current')
        this.zoomToFeature(id, geometry)
      })
  }

  public zoomToFeature(id: number, geometry: JSON) {
    this.mapConfig.view.animate({ zoom: 17, center: ol.proj.transform([geometry['geometry']['coordinates'][0], geometry['geometry']['coordinates'][1]], 'EPSG:4326', 'EPSG:3857') })
  }

  public updateRecord(table: number, id: string, field: string, type: string, value: string): boolean {
    let mcf = new MyCubeField
    mcf.field = field
    mcf.type = type
    mcf.value = value
    this.sqlService.Update(table, id, mcf)
      .subscribe(data => {
        //This is to check for duplicates.  There's got to be a better way to do this.
        if (field == 'ticket') {
          this.sqlService.GetSingle(table, id)
            .subscribe((x) => {
              let y: Locate = x[0][0]
              if (y.ticket != null) {
                let snackBarRef = this.snackBar.open('Ticket ' + this.locate.ticket + ' was inserted.', 'Undo', {
                  duration: 4000
                });
                snackBarRef.onAction().subscribe((x) => {
                  this.sqlService.Delete(table, id)
                    .subscribe((x) => {
                      let newSnackBarRef = this.snackBar.open("Undone")
                    })
                })
              }
              else {
                let snackBarRef = this.snackBar.open('Ticket was not inserted.  It is a duplicate.', '', {
                  duration: 4000
                });
                this.sqlService.Delete(table, id)
                  .subscribe()
              }
            })
        }
        this.reloadLayer('current');
      })
    return true
  }

  public completeTicket(mapConfig: MapConfig, instanceID: number, id: string, userName: string, completedNote: string, completedBy: string) {
    this.mapConfig = mapConfig
    let undo: boolean
    let i = mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == instanceID)
    let obj = mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'myCube Layer Identity (integer)')
    let table: number = obj['setting']['value']
    let strDate = new Date()
    i = mapConfig.userpagelayers.findIndex(x => x.layerID == table)

    let snackBarRef = this.snackBar.open('Ticket completed.', 'Undo', {
      duration: 4000
    });
    snackBarRef.onAction().subscribe((x) => {
      undo = true
      let snackBarRef = this.snackBar.open('Undone.', '', {
        duration: 4000
      });
    })
    snackBarRef.afterDismissed().subscribe((x) => {
      if (!undo) {
        this.updateRecord(table, id, 'closed', 'text', strDate.toLocaleString())
        this.updateRecord(table, id, 'completedby', 'text', userName)
        let ntext: RegExp = /'/g
        if (completedNote) { completedNote = completedNote.replace(ntext, "''") }
        this.updateRecord(table, id, 'note', 'text', completedNote)
        this.updateRecord(table, id, 'completedby', 'text', completedBy)
        this.clearFeature(mapConfig, mapConfig.userpagelayers[i])
        undo = false
      }
    })
  }
  public flipSortBy() {
    if (this.sortBy == "Priority") {
      this.sortBy = "Address"
    }
    else {
      this.sortBy = "Priority"
    }
    this.sortByFunction()
  }
  public sortByFunction() {
    if (this.sortBy == "Address") {
      this.mapConfig.featureList.forEach((x) => {
      })
      this.mapConfig.featureList.sort((a, b): number => {
        if (a.feature.get('sdate') + ' ' + a.feature.get('stime') > b.feature.get('sdate') + ' ' + b.feature.get('stime')) {
            return 1;
        }
        if (a.feature.get('sdate') + ' ' + a.feature.get('stime') < b.feature.get('sdate') + ' ' + b.feature.get('stime')) {
            return -1;
        }
        return 0;
    })
    }
    else {
      this.mapConfig.featureList.sort((a, b): number => {
        if (a.label > b.label) {
            return 1;
        }
        if (a.label < b.label) {
            return -1;
        }
        return 0;
    })
    }
  }
}