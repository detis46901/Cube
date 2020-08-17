import { Injectable } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig } from 'app/map/models/map.model';
import { HttpClient } from '@angular/common/http';
import { Observable ,  Subject } from 'rxjs';
import { MyCubeService } from '../../../map/services/mycube.service'
import { Image, GpsMessage, Vehicle, AVLConfig } from './AVL.model'
import { WMSService } from '../../../map/services/wms.service'
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString'
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMTS from 'ol/source/WMTS';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import TileLayer from 'ol/layer/Tile';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { from } from 'rxjs'
import { Coordinate } from 'ol/coordinate';
import { AVLHTTPService } from './AVL.HTTP.service'
import { AVLComponent } from './AVL.component';
import {StyleService } from './style.service'


@Injectable()
export class AVLService {
  constructor(protected _http: HttpClient,
    private myCubeService: MyCubeService,
    private wmsService: WMSService,
    private AVLHTTPservice: AVLHTTPService,
    private styleService: StyleService
  ) { }

  public bboxLayer: VectorLayer
  public mapConfig: MapConfig
  public layer: UserPageLayer
  public images = new Array<Image>()
  public AOMMouseOver: any
  private disabled = new Subject<boolean>();
  public opacity: number;
  public selectedImage = new Image()
  public imageZIndex: number
  public options
  public body
  public token: JSON
  public vehicleLocations: GpsMessage[]

  public getToken(): Observable<any> {
  let params = new URLSearchParams()
  params.append('grant_type','password')
  params.append('username','city536fleet')
  params.append('password','Kokomo01')
  let headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'})

  return this._http.post('https://cube-kokomo.com:9876/https://auth.networkfleet.com/token',params.toString(), {headers: headers})
  }

  public createLayer(mapConfig: MapConfig, layer: UserPageLayer) {
    this.mapConfig = mapConfig
    let src = new VectorSource();
    this.bboxLayer = new VectorLayer({
      source: src,
    });
    layer.olLayer = this.bboxLayer
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
              let feature = new Feature({
                geometry: new Point(crd),
                name: 'x.title',
                _id: 'x._id'
              });
              let src1 = 'EPSG:4326'
                let dest = 'EPSG:3857'
                feature.getGeometry().transform(src1, dest)
                AVLconfig.UPL.olLayer.getSource().addFeature(feature)
                feature.setStyle(this.styleService.stylePoint(y.currentLocation))
            }
          })
          console.log('mapped')
        }
  
  public mapTrack(AVLconfig: AVLConfig, vehicle: Vehicle) {
    this.mapConfig.map.removeLayer(AVLconfig.olTrackLayer)
    AVLconfig.olTrackSource = new VectorSource();
    AVLconfig.olTrackLayer = new VectorLayer({
      source: AVLconfig.olTrackSource,
    });
    this.AVLHTTPservice.getTrackCall(AVLconfig.token, vehicle.id).subscribe((x) => {
      let gpsTracks: GpsMessage[]
      gpsTracks = x['gpsMessage']     
      let crds = new Array <Array<number>>()
      gpsTracks.forEach((track:GpsMessage) => {
        let crd1 = new Array <number>(2)
          crd1[0] = track.longitude
          crd1[1] = track.latitude
          crds.push(crd1)
        let crd = new Array<number>()
              crd.push(track.longitude)
              crd.push(track.latitude)
              let feature = new Feature({
                geometry: new Point(crd),
                name: 'x.title',
                _id: 'x._id'
              });
              let src1 = 'EPSG:4326'
                let dest = 'EPSG:3857'
                feature.getGeometry().transform(src1, dest)
                AVLconfig.olTrackSource.addFeature(feature)
                feature.setStyle(this.styleService.stylePoint(track))

      })
      let ln = new Feature({
        geometry: new LineString(crds)
      })
      ln.getGeometry().transform('EPSG:4326','EPSG:3857')
      AVLconfig.olTrackSource.addFeature(ln)
      ln.setStyle(this.styleService.styleLineString())
      this.mapConfig.map.addLayer(AVLconfig.olTrackLayer)
    })
  }

  public getGroup(token, id):Observable<any> {
    return this.AVLHTTPservice.getGroupCall(token, id)
  }

  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer, init?: boolean): boolean {
    console.log('AVLservice loadLayer')
    this.mapConfig = mapConfig
    return true
  }
  public unloadLayer(layer: UserPageLayer): boolean {
    this.images.forEach(x => {
      x.on = false
      this.mapConfig.map.removeLayer(x.layer)
    })
    return true
  }

  public setCurrentLayer(layer: UserPageLayer): boolean {
    // this.getGroups()
    // this.getVehicles()
    // this.getLocations()
    this.AOMMouseOver = this.mapConfig.map.on('pointermove', (evt: any) => {
        if (this.mapConfig.map.hasFeatureAtPixel(evt.pixel)) {
          this.mapConfig.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
            if (layer === this.bboxLayer) {
              this.selectedImage = this.images.find(x => x._id == feature.get('_id'))
            }
          })
        }
        else {
          this.mapConfig.mouseoverLayer = null;
          this.selectedImage = new Image()
        }
      })
    this.mapConfig.showStyleButton = true
    return true
  }
  
  public unsetCurrentLayer(layer: UserPageLayer): boolean {
    return true
  }
  public getFeatureList(layer: UserPageLayer): boolean {
    return true
  }
  public selectFeature(layer: UserPageLayer): Image {
    let image: Image
        let _id: string
        _id = this.mapConfig.selectedFeature.get('_id')
        image = this.images.find(x => x._id == _id)
        if (image.on == false) {
          this.loadImage(image)
          image.function = 'add'
        }
        else {
          this.removeImage(image)
          image.function = 'subtract'
        }
    return image
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

  // getImages(mapConfig: MapConfig, layer: UserPageLayer, init?: boolean) {
  //   this.mapConfig = mapConfig
  //   let src = new VectorSource();
  //   this.bboxLayer = new VectorLayer({
  //     source: src,
  //   });
  //   this.imageZIndex = this.mapConfig.userpagelayers.findIndex(x => x === layer)
  //   this.bboxLayer.setZIndex(this.imageZIndex)
  //   this.GetImagesFromURL()
  //     .subscribe(data => {
  //       this.images = data['results']
  //       this.images.forEach((x) => {
  //         x.on = false
  //         let coordinate1: [number, number]
  //         let coordinate2: [number, number]
  //         let coordinate3: [number, number]
  //         let coordinate4: [number, number]
  //         let p1 = new Array<[number, number]>()
  //         let p = new Array<Array<[number, number]>>()
  //         coordinate1 = [x.bbox[0], x.bbox[1]]
  //         coordinate2 = [x.bbox[2], x.bbox[1]]
  //         coordinate3 = [x.bbox[2], x.bbox[3]]
  //         coordinate4 = [x.bbox[0], x.bbox[3]]
  //         p1.push(coordinate1)
  //         p1.push(coordinate2)
  //         p1.push(coordinate3)
  //         p1.push(coordinate4)
  //         p.push(p1)
  //         let feature = new Feature({
  //           // geometry: new Polygon(p),
  //           // name: x.title,
  //           // _id: x._id
  //         });
  //         let src1 = 'EPSG:4326'
  //         let dest = 'EPSG:3857'
  //         feature.getGeometry().transform(src1, dest)
  //         src.addFeature(feature)
  //         x.feature = feature
  //       })
  //       layer.olLayer = this.bboxLayer
  //       if (init) {
  //         this.mapConfig.baseLayers.push(layer.olLayer);  //I think this might be able to be deleted.
  //         this.mapConfig.map.addLayer(layer.olLayer)
  //         layer.olLayer.setVisible(layer.defaultON)
  //       }
  //       else {
  //         this.mapConfig.map.addLayer(layer.olLayer)
  //         layer.olLayer.setVisible(layer.defaultON)
  //       }
  //     })
  // }

  loadImage(image: Image) {
    image.on = true
    this.wmsService.getCapabilities(image.properties.wmts)
      .subscribe((data) => {
        let parser = new WMTSCapabilities();
        let result = parser.read(data);
          let options = optionsFromCapabilities(result, {
          layer: 'None',
          matrixSet: 'EPSG:3857'
        });
        let wmsLayer = new TileLayer({
          opacity: this.opacity,
          source: new WMTS(options)
        });
        wmsLayer.setZIndex(this.imageZIndex)
        wmsLayer.setVisible(true);
        this.mapConfig.map.addLayer(wmsLayer);
        image.layer = wmsLayer
      })
  }

  removeImage(image: Image) {
    image.on = false
    this.mapConfig.map.removeLayer(image.layer)
  }

  // toggleImage(image: Image) {
  //   if (image.on == false) {
  //     this.loadImage(image)
  //     image.on = true
  //   }
  //   else {
  //     this.mapConfig.map.removeLayer(image['layer'])
  //     image['on'] = false
  //   }
  // }

  public setOpacity(opacity: number) {
    this.opacity = opacity
  }
}
