import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField } from '_models/layer.model';
import { MapConfig, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
import { Locate, locateStyles, locateConfig, disposition } from './locates.model'
import { DataFormConfig, LogFormConfig, LogField } from '../../../shared.components/data-component/data-form.model'
import { StyleService } from './style.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs';
import { SQLService } from './../../../../_services/sql.service';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from "ol/layer/Vector";
import VectorSource from 'ol/source/Vector';
import { transform } from 'ol/proj';
import { environment } from '../../../../environments/environment'
import { DataFormService } from '../../../shared.components/data-component/data-form.service'
import { UserPage } from '_models/user.model';
import { PositiveResponseService } from './locateupload.service';
import { tick } from '@angular/core/testing';


@Injectable()
export class LocatesService {
  public layerState: string
  public locate: Locate
  public mapConfig: MapConfig
  public filter: string = 'closed IS Null'
  public sortBy: string = "Address"
  public showSortBy: Boolean

  constructor(private geojsonservice: geoJSONService, public positiveResponseService: PositiveResponseService,
    protected _http: HttpClient,
    private styleService: StyleService,
    private sqlService: SQLService,
    private dataFormService: DataFormService,
    private snackBar: MatSnackBar) { }

  //loads the locate data
  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.mapConfig = mapConfig
    //Need to provide for clustering if the number of objects gets too high
    let stylefunction = ((feature: Feature) => {
      return (this.styleService.styleFunction(feature, 'load'));
    })
    let source = new VectorSource({
      format: new GeoJSON()
    })
    let vectorlayer = new VectorLayer({
      source: source,
      style: stylefunction
    });
    layer.olLayer = vectorlayer
    // layer.source = source
    this.getMyLocateData(layer).then((loadedLayer: UserPageLayer) => {
      // var clusterSource = new ol.source.Cluster({
      //   distance: 90,
      //   source: source
      // });
      // loadedLayer.olLayer.source = loadedLayer.source
      loadedLayer.olLayer.setVisible(layer.defaultON);
      this.mapConfig.map.addLayer(loadedLayer.olLayer);
    })
    this.createInterval(layer)
    return true
  }


  public createInterval(layer: UserPageLayer) {
    clearInterval(layer.updateInterval)
    layer.updateInterval = setInterval(() => {
      this.reloadLayer(layer);
    }, 20000);
  }


  public getFeatureList(layer?: UserPageLayer): boolean {
    let k: number = 0;
    let tempList = new Array<featureList>();
    try {
      layer.olLayer.getSource().forEachFeature((x: Feature) => {
        let i = layer.olLayer.getSource().getFeatures().findIndex((j) => j == x);
        let fl = new featureList;
        fl.id = x.get('id')
        if (x.get("address") == "") { fl.label = x.get("street") + " and " + x.get("crossst") }
        else {
          fl.label = x.get("address") + " " + x.get("street")
        }
        fl.feature = x
        if (i > -1 && fl != null) {
          tempList.push(fl)
          k += 1
        }
      })
      this.mapConfig.featureList = tempList.slice(0, k)
      this.sortByFunction()
    } catch (error) {
      console.error(error);
      clearInterval(layer.updateInterval);
    }
    return true
  }

  public setCurrentLayer(layer: UserPageLayer): boolean {
    this.showSortBy = true
    this.reloadLayer(layer)
    return true
  }

  public unsetCurrentLayer(layer: UserPageLayer): boolean {
    this.reloadLayer(layer, 'load')
    this.showSortBy = false
    return true
  }

  public selectFeature(layer: UserPageLayer): boolean {
    clearInterval(layer.updateInterval)
    layer.updateInterval = null
    return false
  }

  public clearFeature(layer: UserPageLayer): boolean {
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      console.log('clearing feature')
      return (this.styleService.styleFunction(feature, 'current'));
    })
    this.createInterval(layer)
    this.locate = null
    // this.reloadLayer(layer, 'current')
    if (this.mapConfig.selectedFeature) { this.mapConfig.selectedFeature.setStyle(stylefunction) }
    this.mapConfig.myCubeConfig = new DataFormConfig
    this.mapConfig.myCubeComment = new LogFormConfig
    return false
  }

  public styleSelectedFeature(layer: UserPageLayer): boolean {
    // let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
    //   return (this.styleService.styleFunction(feature, 'selected'));
    // })
    this.mapConfig.selectedFeature.setStyle(this.styleService.styleFunction(this.mapConfig.selectedFeature, 'selected'))
    return true
  }

  public unstyleSelectedFeature(layer: UserPageLayer): boolean {
    let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
      return (this.styleService.styleFunction(feature, 'current'));
    })
    if (this.mapConfig.selectedFeature) { this.mapConfig.selectedFeature.setStyle(stylefunction) }
    return true
  }

  //Procedures specific to locates are below...
  public reloadLayer(layer: UserPageLayer, layerState?: string) {
    if (!layerState) {
      layerState = 'load'
      if (layer == this.mapConfig.currentLayer) { layerState = 'current' }
    }
    this.getMyLocateData(layer).then((loadedLayer: UserPageLayer) => {
      if (layerState == 'current') { this.getFeatureList(layer) }
      layer.olLayer.getSource().forEachFeature((feat: Feature) => {
        feat.setStyle(this.styleService.styleFunction(feat, layerState));
      })
    })
  }

  public getOneLocate(layer: UserPageLayer): Promise<Locate> {
    let promise = new Promise<Locate>((resolve) => {
      this.sqlService.GetSingle('mycube.t' + layer.layerID, this.mapConfig.selectedFeature.get('id'))
        .subscribe((data) => {
          resolve(data[0][0])
        })
    })
    return promise
  }

  private getMyLocateData(layer: UserPageLayer): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.geojsonservice.GetSome(layer.layer.ID, this.filter)
        .subscribe((data: any) => { //GeoJSON.Feature<any>
          if (data[0][0]['jsonb_build_object']['features']) {
            layer.olLayer.getSource().clear()
            layer.olLayer.getSource().addFeatures(new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']))
          }
          resolve(layer);
        })
    })
    return promise;
  }

  public parseLocateInput(Loc: string, MapConfig: MapConfig, instanceID: number): void {
    this.mapConfig = MapConfig
    let locate = new Locate
    let duplicate: boolean = false
    let i: number
    let ii: number
    try {
      // Helper: get text between two markers
      const between = (source: string, start: string, end: string, trim = true) => {
        const startIdx = source.indexOf(start);
        if (startIdx === -1) return '';
        const from = startIdx + start.length;
        const endIdx = source.indexOf(end, from);
        const raw = endIdx !== -1 ? source.substring(from, endIdx) : source.substring(from);
        return trim ? raw.trim() : raw;
      };

      // Helper: get fixed-length substring after marker
      const after = (source: string, start: string, length: number) => {
        const startIdx = source.indexOf(start);
        return startIdx !== -1 ? source.substr(startIdx + start.length, length).trim() : '';
      };

      // Parse flags
      locate.cancel = Loc.includes('CNCL');

      // Parse ticket info
      locate.ticket = after(Loc, 'Ticket : ', 11);
      locate.tdate = after(Loc, 'Date: ', 10);
      locate.ttime = after(Loc, 'Time: ', 5);
      locate.subdivision = between(Loc, 'Subdivision:', 'Address :');

      // Parse address & street
      const addressStart = Loc.indexOf('Address :');
      const streetStart = Loc.indexOf('Street  :');
      if (addressStart + 16 > streetStart) {
        locate.address = Loc.substring(addressStart + 10, streetStart - 1).trim();
      } else {
        locate.address = '';
      }
      const crossStart = Loc.indexOf('Cross ');
      const streetEnd = crossStart > -1 ? crossStart : Loc.indexOf('Location');
      locate.street = Loc.substring(streetStart + 10, streetEnd - 1).trim();
      locate.crossst = crossStart > -1
        ? between(Loc, 'Cross ', 'Within')
        : '';

      // Build Addname
      const Addname = locate.address.length > 3
        ? `${locate.address} ${locate.street} Kokomo, IN`
        : `${locate.street} and ${locate.crossst} Kokomo, IN`;

      // Location & boundaries
      locate.location = between(Loc, 'Location', 'Grids');
      const BN = after(Loc, 'Boundary', 9);
      const BS = Loc.substring(Loc.indexOf('Boundary') + 27, Loc.indexOf('Boundary') + 36);
      const BW = Loc.substring(Loc.indexOf('Boundary') + 42, Loc.indexOf('Boundary') + 52);
      const BE = Loc.substring(Loc.indexOf('Boundary') + 58, Loc.indexOf('Boundary') + 68);
      const Boundary = `${BW} ${BN},${BE} ${BN},${BE} ${BS},${BW} ${BS},${BW} ${BN}`;
      // ^ Not sure if this is actually used

      // Work & company info
      locate.wtype = between(Loc, 'Work type', 'Done for');
      locate.dfor = between(Loc, 'Done for', 'Start date');
      locate.sdate = after(Loc, 'Start date', 10);
      locate.stime = after(Loc, 'Start date', 35 - (Loc.indexOf('Start date') + 30)); // adjust if needed
      locate.priority = after(Loc, 'Priority', 4);

      // Boolean flags
      locate.blasting = after(Loc, 'Blasting:', 1) === 'Y' ? 't' : 'f';
      locate.boring = after(Loc, 'Boring:', 1) === 'Y' ? 't' : 'f';
      locate.railroad = after(Loc, 'Railroad:', 1) === 'Y' ? 't' : 'f';
      locate.emergency = after(Loc, 'Emergency: ', 1) === 'Y' ? 't' : 'f';

      // Project details
      locate.duration = between(Loc, 'Duration  :', 'Depth:');
      locate.depth = between(Loc, 'Depth:', 'Company :');
      locate.company = between(Loc, 'Company :', 'Type:');
      locate.ctype = between(Loc, 'Type:', 'Co addr :');
      locate.coaddr = between(Loc, 'Co addr', 'City    :');
      locate.cocity = between(Loc, 'City    :', 'Zip:');
      locate.cozip = between(Loc, 'Zip:', 'Caller  :');
      locate.caller = between(Loc, 'Caller  : ', 'Phone:');

      // Phone/contact details
      locate.callphone = between(Loc, 'Phone:', Loc.includes('Contact :') ? 'Contact :' : 'BestTime');
      locate.contact = Loc.includes('Contact :')
        ? between(Loc, 'Contact :', 'Phone:')
        : '';
      locate.mobile = Loc.includes('Mobile  :')
        ? between(Loc, 'Mobile  :', 'Fax')
        : '';
      locate.fax = Loc.includes('Fax')
        ? between(Loc, 'Fax', 'Email  ')
        : '';
      locate.email = Loc.includes('Email  ')
        ? between(Loc, 'Email  ', 'Remarks ')
        : '';

      // Store
      this.locate = locate;

      // Debug logging
      console.log('Ticket:', locate.ticket);
      console.log('Layer ID:', this.mapConfig.currentLayer.layer.ID);


      console.log('Locate to be added');

      // Duplicate check
      const layerId = this.mapConfig.currentLayer.layer.ID;
      const filter = `ticket = '${locate.ticket}'`;

      this.geojsonservice.GetSome(layerId, filter).subscribe((response) => {
        const features = response?.[0]?.[0]?.jsonb_build_object?.features ?? null;
        console.log('GetSome features:', features);

        if (features) {
          duplicate = true;
          this.snackBar.open(
            'Ticket was not inserted. It is a duplicate.',
            '',
            { duration: 4000 }
          );
        } else {
          console.log('Adding locate');
          this.geolocate(Addname, instanceID);
        }
        if (locate.cancel) {
          console.log('Locate cancelled', features[0][0]['properties']['disposition']);
          if (features[0][0]['properties']['disposition'] != '1' || features[0][0]['properties']['disposition'] != '2') {
            console.log('Not already marked.  Cancelling ticket.');
            this.cancelTicket(this.mapConfig, instanceID, locate, 'System Cancel');
            this.snackBar.open(
              'Locate was not inserted. It was marked as cancelled.',
              '',
              { duration: 4000 }
            );
            return;
          }
        }
      });


    } catch (e) {
      this.snackBar.open(
        'Locate email is not formed correctly.',
        '',
        { duration: 4000 }
      );
    }

  }

  private geolocate(addName: string, instanceID: number) {
    console.log('geolocate')
    let geometry: JSON
    let httpP = new HttpParams()
    const howardBounds = "south: 40.3870,west: -86.2701,north: 40.5509,east: -85.9467"
    httpP = httpP.append("address", addName)
    httpP = httpP.append("bounds", howardBounds)
    httpP = httpP.append("components", "administrative_area:IN")
    httpP = httpP.append("sensor", "false")
    httpP = httpP.append("key", "AIzaSyDAaLEIXTo6am6x0-QlegzxDnZLIN3mS-o")
    this.GetGeoLocation(httpP)
      .subscribe((results: string) => {
        console.log('geolocate results', results)
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
    console.log('getGeolocation')
    let options: any = {
      headers: new HttpHeaders({
        'Content-Type': 'text/xml',
        'Accept': 'text/xml',
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
        this.reloadLayer(this.mapConfig.currentLayer)
        this.zoomToFeature(id, geometry)
        //add comment in mycube logs
        console.log('adding log')
        let logForm = new LogField
        logForm.comment = "Locate Added"
        logForm.logTable = 'c' + table
        logForm.schema = 'mycube'
        logForm.userid = this.mapConfig.user.ID
        logForm.featureid = id
        logForm.auto = true
        this.dataFormService.addLogForm(logForm).then(data => {
          console.log('log added', data)
        })
        let snackBarRef = this.snackBar.open('ticked ' + this.locate.ticket + ' created', '', {
          duration: 4000
        });
      })
  }

  public zoomToFeature(id: number, geometry: JSON) {
    this.mapConfig.view.animate({ zoom: 17, center: transform([geometry['geometry']['coordinates'][0], geometry['geometry']['coordinates'][1]], 'EPSG:4326', 'EPSG:3857') })
  }

  public updateRecord(table: number, id: string, field: string, type: string, value: string): boolean {
    let mcf = new MyCubeField
    mcf.field = field
    mcf.type = type
    mcf.value = value
    this.sqlService.Update(table, id, mcf)
      .subscribe(data => {
        console.log('updateRecord', data)
      })
    return true
  }



  public cancelTicket(mapConfig: MapConfig, instanceID: number, ticket: Locate, canceledBy: string) {
    ticket.disposition = "3E"
    let ticketID = ticket.id.toString()
    this.mapConfig = mapConfig
    let undo: boolean
    let i = mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == instanceID)
    let obj = mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'myCube Layer Identity (integer)')
    let table: number = obj['setting']['value']
    let strDate = new Date()
    this.updateRecord(table, ticketID, 'closed', 'text', strDate.toLocaleString())
    let ntext: RegExp = /'/g
    this.updateRecord(table, ticketID, 'note', 'text', 'Canceled')
    this.updateRecord(table, ticketID, 'disposition', 'text', ticket.disposition)
    undo = false
    let userID = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'UserID')
    let password = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'Password')
    let serviceAreaCode = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'Service Area Code')
    userID = userID['setting']['value']
    password = password['setting']['value']
    serviceAreaCode = serviceAreaCode['setting']['value']
    console.log('userID', userID, 'password', password, 'serviceAreaCode', serviceAreaCode, 'ticket', ticket.ticket)
    this.positiveResponseService.submitPositiveResponse(userID, password, serviceAreaCode, ticket)
      .subscribe(data => {
        console.log('Positive response submitted', data);
      })

  }

  public completeTicket(mapConfig: MapConfig, instanceID: number, ticket: Locate, completedNote: string, completedBy: string) {
    let ticketID = ticket.id.toString()
    ticket.note = completedNote
    this.mapConfig = mapConfig
    let undo: boolean
    let i = mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == instanceID)
    let obj = mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'myCube Layer Identity (integer)')
    let table: number = obj['setting']['value']
    let strDate = new Date()
    i = mapConfig.userpagelayers.findIndex(x => x.layerID == table)
    let feat: Feature = this.mapConfig.selectedFeature
    let disp = new disposition
    let d = disp.disposition
    console.log(d.find(x => x['value'] == ticket.disposition)['closes'])
    if (d.find(x => x['value'] == ticket.disposition)['closes'] == true) {
      console.log('removing feature')
      ticket.closed = strDate.toLocaleString()
      this.mapConfig.currentLayer.olLayer.getSource().removeFeature(this.mapConfig.selectedFeature)
      this.clearFeature(mapConfig.userpagelayers[i])
    }
    else {
      console.log('not removing feature')
    }
    let logForm = new LogField
    logForm.comment = "Positive Response " + ticket.disposition + " by " + completedBy
    logForm.logTable = 'c' + table
    logForm.schema = 'mycube'
    logForm.userid = this.mapConfig.user.ID
    logForm.featureid = ticketID
    logForm.auto = true
    this.dataFormService.addLogForm(logForm).then(data => {
      console.log('log added', data)
    })
    let snackBarRef = this.snackBar.open('Ticket completed.', 'Undo', {
      duration: 4000
    });
    snackBarRef.onAction().subscribe((x) => {
      undo = true
      this.mapConfig.currentLayer.olLayer.getSource().addFeature(feat)
      this.clearFeature(mapConfig.userpagelayers[i])
      let snackBarRef = this.snackBar.open('Undone.', '', {
        duration: 4000
      });

    })
    snackBarRef.afterDismissed().subscribe((x) => {
      if (!undo) {
        if (ticket.closed) {
          this.updateRecord(table, ticketID, 'closed', 'text', strDate.toLocaleString())
        }
        else {
          let ntext: RegExp = /'/g
          if (completedNote) { completedNote = completedNote.replace(ntext, "''") }
          this.updateRecord(table, ticketID, 'note', 'text', completedNote)
          this.updateRecord(table, ticketID, 'completedby', 'text', completedBy)
          this.updateRecord(table, ticketID, 'disposition', 'text', ticket.disposition)
        }
        undo = false
        let i = this.mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == instanceID)
        let userID = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'UserID')
        let password = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'Password')
        let serviceAreaCode = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'Service Area Code')
        userID = userID['setting']['value']
        password = password['setting']['value']
        serviceAreaCode = serviceAreaCode['setting']['value']
        console.log('userID', userID, 'password', password, 'serviceAreaCode', serviceAreaCode, 'ticket', ticket.ticket)
        this.positiveResponseService.submitPositiveResponse(userID, password, serviceAreaCode, ticket)
          .subscribe(data => {
            console.log('Positive response submitted', data);
          })

      }
    })
  }


  public flipSortBy() {
    switch (this.sortBy) {
      case "Priority": {
        this.sortBy = "Address"
        break
      }
      case "Address": {
        this.sortBy = "Contractor"
        break
      }
      case "Contractor": {
        this.sortBy = "Priority"
      }
    }
    this.sortByFunction()
  }

  public sortByFunction() {
    if (this.sortBy == "Address") { //this is really by priority
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
    if (this.sortBy == "Priority") { //this is really by address
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
    if (this.sortBy == "Contractor") {
      this.mapConfig.featureList.sort((a, b): number => {
        if (a.feature.get('company') > b.feature.get('company')) {
          return 1;
        }
        if (a.feature.get('company') < b.feature.get('company')) {
          return -1;
        }
        return 0;
      })
    }
  }

  sendUpdateToIRTH(instanceID: number, ticket: Locate) {
    let i = this.mapConfig.userpageinstances.findIndex(x => x.moduleInstanceID == instanceID)
    let stateCode = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'State Code')
    let userID = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'UserID')
    let password = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'Password')
    let serviceAreaCode = this.mapConfig.userpageinstances[i].module_instance.settings['settings'].find(x => x['setting']['name'] == 'Service Area Code')
    stateCode = stateCode['setting']['value']
    userID = userID['setting']['value']
    password = password['setting']['value']
    serviceAreaCode = serviceAreaCode['setting']['value']

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', environment.proxyUrl + 'https://811.indiana811.org/api/External/PositiveResponse/Respond', true);

    var sr =
      `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <Respond xmlns="http://Irth.com/OneCall/PositiveResponse">
        <occCode>` + stateCode + `</occCode>
        <userID>` + userID + `</userID>
        <password>` + password + `</password>
        <serviceAreaCode>` + serviceAreaCode + `</serviceAreaCode>
        <occTicketID>` + ticket.ticket + `</occTicketID>
        <responseCode>` + ticket.disposition + `</responseCode>
        <responseCategory></responseCategory>
        <comment>Auto Response by the City of Kokomo</comment>
      </Respond>
    </soap:Body>
  </soap:Envelope>`

    xmlhttp.onreadystatechange = () => {
      console.log(xmlhttp.responseText)
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          var xml = xmlhttp.responseXML;
          var req = xmlhttp.responseURL
          console.log(req)
          console.log(xml); //I'm printing my result square number
        }
      }
    }
    // Send the POST request
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    xmlhttp.send(sr)
  }


}
