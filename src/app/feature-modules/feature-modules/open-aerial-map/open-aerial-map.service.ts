import { Injectable } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig } from 'app/map/models/map.model';
import { HttpClient } from '@angular/common/http';
import { Observable ,  Subject } from 'rxjs';
import { MyCubeService } from './../../../map/services/mycube.service'
import { Image } from './open-aerial-map.model'
import { WMSService } from '../../../map/services/wms.service'
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMTS from 'ol/source/WMTS';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import TileLayer from 'ol/layer/Tile';

@Injectable()
export class OpenAerialMapService {
  constructor(protected _http: HttpClient,
    private myCubeService: MyCubeService,
    private wmsService: WMSService,
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
  

  public GetImagesFromURL = (): Observable<any> => {
    return this._http.get('https://api.openaerialmap.org/meta?provider=City%20of%20Kokomo')
  }

  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer, init?: boolean): boolean {
    this.mapConfig = mapConfig
    this.selectedImage.title = ""
    this.getImages(this.mapConfig, layer, init)
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

  getImages(mapConfig: MapConfig, layer: UserPageLayer, init?: boolean) {
    this.mapConfig = mapConfig
    let src = new VectorSource();
    this.bboxLayer = new VectorLayer({
      source: src,
    });
    this.imageZIndex = this.mapConfig.userpagelayers.findIndex(x => x === layer)
    this.bboxLayer.setZIndex(this.imageZIndex)
    this.GetImagesFromURL()
      .subscribe(data => {
        this.images = data['results']
        this.images.forEach((x) => {
          x.on = false
          let coordinate1: [number, number]
          let coordinate2: [number, number]
          let coordinate3: [number, number]
          let coordinate4: [number, number]
          let p1 = new Array<[number, number]>()
          let p = new Array<Array<[number, number]>>()
          coordinate1 = [x.bbox[0], x.bbox[1]]
          coordinate2 = [x.bbox[2], x.bbox[1]]
          coordinate3 = [x.bbox[2], x.bbox[3]]
          coordinate4 = [x.bbox[0], x.bbox[3]]
          p1.push(coordinate1)
          p1.push(coordinate2)
          p1.push(coordinate3)
          p1.push(coordinate4)
          p.push(p1)
          let feature = new Feature({
            geometry: new Polygon(p),
            name: x.title,
            _id: x._id
          });
          let src1 = 'EPSG:4326'
          let dest = 'EPSG:3857'
          feature.getGeometry().transform(src1, dest)
          src.addFeature(feature)
          x.feature = feature
        })
        layer.olLayer = this.bboxLayer
        if (init) {
          this.mapConfig.baseLayers.push(layer.olLayer);  //I think this might be able to be deleted.
          this.mapConfig.map.addLayer(layer.olLayer)
          layer.olLayer.setVisible(layer.defaultON)
        }
        else {
          this.mapConfig.map.addLayer(layer.olLayer)
          layer.olLayer.setVisible(layer.defaultON)
        }
      })
  }

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
