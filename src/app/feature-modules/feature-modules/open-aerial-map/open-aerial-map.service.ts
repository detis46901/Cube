import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField } from '_models/layer.model';
import { UserPageInstance } from '_models/module.model'
import { MapConfig, mapStyles, featureList } from 'app/map/models/map.model';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MyCubeService } from './../../../map/services/mycube.service'
import { Image} from './open-aerial-map.model'
import { WMSService } from '../../../map/services/wms.service'
import { Subject } from 'rxjs/Subject';



import * as ol from 'openlayers';

@Injectable()
export class OpenAerialMapService {

  constructor(protected _http: HttpClient,
    private myCubeService: MyCubeService,
    private wmsService: WMSService, 
  ) { }

  public bboxLayer: ol.layer.Vector
  public mapConfig: MapConfig
  public layer: UserPageLayer
  public images = new Array<Image>()
  public AOMClickKey: any
  private disabled = new Subject<boolean>();
  public opacity: number;



  public GetImagesFromURL = (): Observable<any> => {
    return this._http.get('https://api.openaerialmap.org/meta?provider=City%20of%20Kokomo')
    // .pipe(catchError(this.handleError));
  }

  public loadLayer(mapConfig:MapConfig, layer: UserPageLayer):boolean {
    this.getImages(mapConfig, layer)
    return false
  }
  public unloadLayer(mapConfig:MapConfig, layer: UserPageLayer):boolean {
    this.images.forEach(x => {
      x.on = false
      this.mapConfig.map.removeLayer(x.layer)
    })
    this.setDisabled(true)
    return true
  }

  public setCurrentLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    this.createImageClickEvent()
    this.setDisabled(false)
    return false
  }
  public unsetCurrentLayer(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    ol.Observable.unByKey(this.AOMClickKey);
    this.setDisabled(true)
    return true
  }
  public getFeatureList(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    return false
  }
  public selectFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    return true
  }
  public styleSelectedFeature(mapConfig: MapConfig, layer: UserPageLayer):boolean {
    return true
  }
  public unstyleSelectedFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    return true
  }
  public clearFeature(mapConfig: MapConfig, layer: UserPageLayer): boolean {
    return true
  }

  getDisabled(): Observable<any> {
    return this.disabled.asObservable();
  }

  setDisabled(disabled: boolean) {
    this.disabled.next(disabled)
  }
  getImages(mapConfig:MapConfig, layer: UserPageLayer) {
    this.mapConfig = mapConfig
    let src = new ol.source.Vector();
    this.bboxLayer = new ol.layer.Vector({
      source: src,
      // style: this.mapstyles.selected
    });

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
          let p= new Array<Array<[number, number]>>()
          coordinate1 = [x.bbox[0], x.bbox[1]]
          coordinate2 = [x.bbox[2], x.bbox[1]]
          coordinate3 = [x.bbox[2], x.bbox[3]]
          coordinate4 = [x.bbox[0], x.bbox[3]]
          p1.push(coordinate1)
          p1.push(coordinate2)
          p1.push(coordinate3)
          p1.push(coordinate4)
          p.push(p1)
          let feature = new ol.Feature({
            geometry: new ol.geom.Polygon(p),
            name: x.title,
            _id: x._id
          });
          let src1 = 'EPSG:4326'
          let dest = 'EPSG:3857'
          feature.getGeometry().transform(src1, dest)
          src.addFeature(feature)
        })
        layer.olLayer = this.bboxLayer
        this.mapConfig.map.addLayer(layer.olLayer)
        //this.createImageClickEvent()
      })
  }
  private createImageClickEvent() {
    let selectedFeature:ol.Feature
    this.AOMClickKey = this.mapConfig.map.on('click', (e:any) => {
        var hit = false;
        this.mapConfig.map.forEachFeatureAtPixel(e.pixel, (feature: ol.Feature, selectedLayer: any) => {
            if (selectedLayer === this.bboxLayer) {
                hit = true;
                selectedFeature = feature
            }
            ;
        }, {
                hitTolerance: 5
            });
        if (hit) {
          let image: Image
          let _id: string
          _id = selectedFeature.get('_id')
          image = this.images.find(x => x._id == _id)
          if (image.on == false) {
            this.loadImage(image)
          }
          else {
            this.removeImage(image)
          }
        }
        else {
        }
    });
}
loadImage(image: Image) {
  image.on = true
  this.wmsService.getCapabilities(image.properties.wmts)
    .subscribe((data) => {
      let parser = new ol.format.WMTSCapabilities();
      let result = parser.read(data);
      let options = ol.source.WMTS.optionsFromCapabilities(result, {
        layer: 'None',
        matrixSet: 'EPSG:3857'
      });
      let wmsSource = new ol.source.WMTS(options);
      let wmsLayer = new ol.layer.Tile({
        opacity: this.opacity,
        source: new ol.source.WMTS(options)
      });
      wmsLayer.setVisible(true);
      // userpagelayer.olLayer = wmsLayer
      // userpagelayer.source = wmsSource
      this.mapConfig.map.addLayer(wmsLayer);
      image.layer = wmsLayer

    })
}
removeImage(image: Image) {
  image.on = false
  this.mapConfig.map.removeLayer(image.layer)
}
toggleImage(image: Image) {
  if (image.on == false) {
    this.loadImage(image)
    image.on = true
  }
  else {
    this.mapConfig.map.removeLayer(image['layer'])
    image['on'] = false
  }

}
public setOpacity(opacity: number) {
  this.opacity = opacity
}
}
