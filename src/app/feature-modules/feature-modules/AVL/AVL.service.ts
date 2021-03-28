import { Injectable } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig, featureList } from '../../../map/models/map.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GpsMessage, Vehicle, AVLConfig } from './AVL.model'
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString'
import { HttpHeaders } from '@angular/common/http';
import { AVLHTTPService } from './AVL.HTTP.service'
import { StyleService } from './style.service'
import { MapBrowserEvent } from 'ol';
import { DataFormConfig, DataField } from 'app/shared.components/data-component/data-form.model';
import { buffer } from 'ol/extent';
import Select from 'ol/interaction/Select';
import {altKeyOnly, click, pointerMove} from 'ol/events/condition';

@Injectable()
export class AVLService {
  constructor(protected _http: HttpClient,
    private AVLHTTPservice: AVLHTTPService,
    private styleService: StyleService
  ) { }

  public mapConfig: MapConfig

  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer, init?: boolean): boolean {
    console.log('AVLservice loadLayer')
    this.mapConfig = mapConfig
    return true
  }

  public getToken(username: string, password: string): Observable<any> {
    let params = new URLSearchParams()
    params.append('grant_type', 'password')
    params.append('username', username)
    params.append('password', password)
    let headers = new HttpHeaders({ 'Content-type': 'application/x-www-form-urlencoded; charset=utf-8' })
    return this._http.post('https://cube-kokomo.com:9876/https://auth.networkfleet.com/token', params.toString(), { headers: headers })
  }

  public createLayer(mapConfig: MapConfig, layer: UserPageLayer) { //creates the currenlocation layer (the default layer of the module)
    this.mapConfig = mapConfig
    let ly: VectorLayer
    let src = new VectorSource();
    ly = new VectorLayer({
      source: src,
    });
    layer.olLayer = ly
    this.mapConfig.map.addLayer(layer.olLayer)
    layer.olLayer.setVisible(layer.defaultON)
  }

  public mapCurrentLocations(AVLconfig: AVLConfig) {
    AVLconfig.UPL.olLayer.getSource().clear()
    AVLconfig.vehicles.forEach((y: Vehicle) => {
      if (y.currentLocation) {
        let crd = new Array<number>()
        crd.push(y.currentLocation.longitude)
        crd.push(y.currentLocation.latitude)
        let feature = new Feature({  //maybe I should be adding all current location data into this.  Maybe not?
          geometry: new Point(crd),
          name: y.label,
          id: y.id
        });
        let src1 = 'EPSG:4326'
        let dest = 'EPSG:3857'
        feature.getGeometry().transform(src1, dest)
        AVLconfig.UPL.olLayer.getSource().addFeature(feature)
        feature.setStyle(this.styleService.stylePoint(y.currentLocation))
      }
    })
  }

  public showTrack(AVLconfig: AVLConfig, vehicle: Vehicle) {
    let zoomToTrack: boolean = true
    if (AVLconfig.trackUpdateInterval) {zoomToTrack = false}  //keeps it from zooming more than once when a vehicle is selected.
    clearInterval(AVLconfig.trackUpdateInterval)
    AVLconfig.trackUpdateInterval = setInterval(() => {
      this.showTrack(AVLconfig, vehicle)
    }, 20000)
    AVLconfig.selectedVehicle = vehicle
    let tempFeatureList = new Array<featureList>()
    this.AVLHTTPservice.getTrackCall(AVLconfig.token, vehicle.id, AVLconfig.startDate.toISOString(), AVLconfig.endDate.toISOString()).subscribe((tracks: JSON[]) => {
      AVLconfig.selectedVehicle.track = tracks['gpsMessage']
      if (!AVLconfig.selectedVehicle.track) {
        this.mapConfig.featureList = new Array<featureList>()
        let tl = new featureList
        tl.id = 1
        tl.label = 'No Records'
        //need to add the vehicle's feature to the tl
        this.mapConfig.featureList.push(tl)
        this.mapConfig.map.removeLayer(AVLconfig.olTrackLayer)
      }
      else {
        tracks['gpsMessage'].forEach((x) => {
          x.id = x['@id']
        })
        vehicle.track = tracks['gpsMessage']
        let idle: Date
        let commentMessage: GpsMessage
        this.mapTrack(AVLconfig, vehicle, zoomToTrack)
        if (vehicle.track) {
          vehicle.track.forEach((x, i) => {
            x.comment = new Date(x.messageTime).toTimeString().substring(0, 9)
            x.comment = x.comment.concat(' ' + x.avgSpeed + 'MPH')
            if (!x.heading && x.keyOn == true && x.avgSpeed < 5) {
              x.status = 'idle'
              if (!idle) { idle = x.messageTime }
              else { x.hide = true }
            }
            else {
              if (x.keyOn == false) {
                if (idle) {
                  commentMessage = vehicle.track.find((z) => z.messageTime == idle)
                  let diff: number = new Date(x.messageTime).getTime() - new Date(commentMessage.messageTime).getTime()
                  commentMessage.idleTime = Math.abs(Math.round(diff /= 60000))
                  idle = null
                }
                x.status = 'stopped'
                if (vehicle.track[i + 1]) {
                  let diff: number = new Date(vehicle.track[i + 1].messageTime).getTime() - new Date(x.messageTime).getTime()
                  x.stoppedTime = Math.abs(Math.round(diff /= 60000))
                  if (x.stoppedTime > 0) {
                    x.comment = x.comment.concat(" Stopped for ", x.stoppedTime.toString(), " min.")
                  }
                }
              }
              else {
                x.status = 'moving'
                if (idle) {
                  commentMessage = vehicle.track.find((z) => z.messageTime == idle)
                  let diff: number = new Date(x.messageTime).getTime() - new Date(commentMessage.messageTime).getTime()
                  commentMessage.idleTime = Math.abs(Math.round(diff /= 60000))
                  if (commentMessage.idleTime > 0) {
                    commentMessage.comment = commentMessage.comment.concat(" Idle for ", commentMessage.idleTime.toString(), " min.")
                  }
                  idle = null
                }
              }
            }
            //need to put something in here to add the date on multiple date queries.
          })
        }
      }
      if (vehicle.track) {
        vehicle.track.forEach((v: GpsMessage) => {
          if (!v.hide) {
            let fl = new featureList
            fl.id = v.id
            fl.label = v.comment
            v.olPoint.set('id', v.id)
            fl.feature = v.olPoint
            tempFeatureList.push(fl)
          }
        })
        let tl: featureList //to keep the selected feature bolded
        if (this.mapConfig.selectedFeature) {tl = this.mapConfig.featureList.find((x) => x.feature == this.mapConfig.selectedFeature)} //to keep the selected feature bolded
        tempFeatureList = tempFeatureList.reverse()  //Puts the featurelist in reverse chronological order
        this.mapConfig.featureList = tempFeatureList //Moves the templist to the main list
        if (tl) {
          if (tl) {this.mapConfig.selectedFeature = this.mapConfig.featureList.find((x) => x.id == tl.id).feature} //to keep the selected feature bolded
        }
      }
    })
  }

  public mapTrack(AVLconfig: AVLConfig, vehicle: Vehicle, zoomToTrack: boolean) {
    console.log('zoomToTrack', zoomToTrack)
    this.mapConfig.map.removeLayer(AVLconfig.olTrackLayer)
    let olTrackSource = new VectorSource();
    AVLconfig.olTrackLayer = new VectorLayer({
      source: olTrackSource,
    });
    let crds = new Array<Array<number>>()
    if (vehicle.track) {
      vehicle.track.forEach((track: GpsMessage) => {
        let crd1 = new Array<number>(2)
        crd1[0] = track.longitude
        crd1[1] = track.latitude
        crds.push(crd1)
        let crd = new Array<number>()
        crd.push(track.longitude)
        crd.push(track.latitude)
        let feature = new Feature({
          geometry: new Point(crd),
          accuracy: track.accuracy,
          keyOn: track.keyOn,
        });
        let src1 = 'EPSG:4326'
        let dest = 'EPSG:3857'
        feature.getGeometry().transform(src1, dest)
        olTrackSource.addFeature(feature)
        track.olPoint = feature
        feature.setStyle(this.styleService.stylePoint(track))

      })
    }
    let ln = new Feature({
      geometry: new LineString(crds)
    })
    ln.getGeometry().transform('EPSG:4326', 'EPSG:3857')
    olTrackSource.addFeature(ln)
    if (olTrackSource.getFeatures().length > 1 && zoomToTrack) { this.mapConfig.map.getView().fit(buffer(olTrackSource.getExtent(), 1000), { duration: 1000 }) }
    ln.setStyle(this.styleService.styleLineString())
    this.mapConfig.currentLayer.olLayer.setOpacity(.5)
    this.mapConfig.map.addLayer(AVLconfig.olTrackLayer)
  }

  public getGroup(token, id): Observable<any> {
    return this.AVLHTTPservice.getGroupCall(token, id)
  }

  public unloadLayer(layer: UserPageLayer): boolean {
    return true
  }

  public setCurrentLayer(layer: UserPageLayer, AVLconfig: AVLConfig): boolean {
    AVLconfig.AVLmouseover = this.mapConfig.map.on('pointermove', (evt: MapBrowserEvent) => {
    let data = new DataFormConfig
    if (this.mapConfig.map.hasFeatureAtPixel(evt.pixel)) {
      this.mapConfig.map.forEachFeatureAtPixel(evt.pixel, (feature: Feature, mouselayer) => {
        if (mouselayer === layer.olLayer) {
          let df = new DataField
          df.field = "Vehicle"
          df.type = "text"
          df.value = feature.get('name')
          df.constraints = null
          data.dataForm = new Array<DataField>()
          data.dataForm.push(df)
          data.visible = true
          this.mapConfig.myCubeConfig = data
        }
      })
    }
    else {
      this.mapConfig.mouseoverLayer = null;
      this.mapConfig.myCubeConfig =  new DataFormConfig
    }
  })
    AVLconfig.AVLClick = this.mapConfig.map.on('click', (evt: MapBrowserEvent) => {
      this.selectTrackFeature(AVLconfig, evt)
    })      
    
    this.mapConfig.showStyleButton = true

    return true
  }

  public onPointerMove(evt, layer?) {
   
  }
  public selectTrackFeature(AVLconfig: AVLConfig, evt) {
    console.log(evt)
    this.mapConfig.map.forEachFeatureAtPixel(evt.pixel, (feature: Feature, selectedLayer: any) => {
      console.log(feature.get('id'))
      if (selectedLayer === AVLconfig.olTrackLayer) {
        if(this.mapConfig.featureList.find((x) => x.id == feature.get('id'))) {
          this.mapConfig.selectedFeature = this.mapConfig.featureList.find((x) => x.id == feature.get('id')).feature
          this.mapConfig.view.fit(this.mapConfig.selectedFeature.getGeometry().getExtent(), {
            duration: 1000,
            maxZoom: 18
        })
        }
      }
      ;
  }, {
      hitTolerance: 5
  });
  }

  public unsetCurrentLayer(layer: UserPageLayer): boolean {
    return true
  }
  public getFeatureList(layer: UserPageLayer): boolean {
    return true
  }
  public selectFeature(AVLconfig: AVLConfig, layer: UserPageLayer): boolean { //select a vehicle to get current track
    console.log(this.mapConfig.selectedFeature.get('id'))
    let data = new DataFormConfig
    if (layer.olLayer === layer.olLayer) {
      // let df = new DataField
      // df.field = "Vehicle"
      // df.type = "text"
      // df.value = this.mapConfig.selectedFeature.get('name')
      // df.constraints = null
      console.log(this.mapConfig.selectedFeature)
      AVLconfig.selectedVehicle = AVLconfig.vehicles.find((x) => x.id == this.mapConfig.selectedFeature.get('id'))
      console.log(AVLconfig.vehicles)
      console.log(AVLconfig.selectedVehicle)
      AVLconfig.tab = "Track"
      this.showTrack(AVLconfig, AVLconfig.selectedVehicle)
      // data.dataForm = new Array<DataField>()
      // data.dataForm.push(df)
      // data.visible = true
      this.mapConfig.myCubeConfig = data
    }
    return true
  }

  public styleSelectedFeature(layer: UserPageLayer): boolean {
    return true
  }

  public unstyleSelectedFeature(layer: UserPageLayer): boolean {
    return true
  }

  public clearFeature(layer: UserPageLayer): boolean {
    return true
  }
}
