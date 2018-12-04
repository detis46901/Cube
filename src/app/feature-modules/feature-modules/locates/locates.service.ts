import { Injectable } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';

@Injectable()
export class LocatesService {
  public completed: string
  public vectorlayer = new ol.layer.Vector()

  constructor(private geojsonservice: geoJSONService) { }

  public loadLayer(mapConfig: MapConfig, layer: UserPageLayer) {
    console.log(mapConfig)
    console.log(mapConfig.userpagelayers)
    layer = mapConfig.userpagelayers[8]
    let stylefunction = ((feature) => {
      return (this.styleFunction(feature, layer, "load"));
    })
    let source = new ol.source.Vector({
      format: new ol.format.GeoJSON()
    })

    this.setDefaultStyleandFilter(layer)


    this.getMyCubeData(layer).then((data) => {
      if (data[0][0]['jsonb_build_object']['features']) {
        source.addFeatures(new ol.format.GeoJSON({ defaultDataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data[0][0]['jsonb_build_object']));
        console.log(data[0][0]['jsonb_build_object'])
      }
      // var clusterSource = new ol.source.Cluster({
      //   distance: 90,
      //   source: source
      // });
      var styleCache = {};
      this.vectorlayer = new ol.layer.Vector({
        source: source,
        style: function (feature) {
          var size = feature.get('features').length;
          var style = styleCache[size];
          if (!style) {
            style = new ol.style.Style({
              image: new ol.style.Circle({
                radius: 10,
                stroke: new ol.style.Stroke({
                  color: '#fff'
                }),
                fill: new ol.style.Fill({
                  color: '#3399CC'
                })
              }),
              text: new ol.style.Text({
                text: size.toString(),
                fill: new ol.style.Fill({
                  color: '#fff'
                })
              })
            });
            styleCache[size] = style;
          }
          return style;
        }
      });
      this.vectorlayer.setVisible(layer.defaultON);
      mapConfig.map.addLayer(this.vectorlayer);
      layer.olLayer = this.vectorlayer
      layer.source = source
    })
  }

  public styleFunction(feature: ol.Feature, layer: UserPageLayer, mode: string): ol.style.Style {
    let color: string
    let width: number
    if (layer.style) {
      color = layer.style[mode].color; width = layer.style[mode].width
    }
    else {
      color = layer.layer.defaultStyle[mode].color; width = layer.layer.defaultStyle[mode].width
    }
    let style = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: null,
        stroke: new ol.style.Stroke({ color: color, width: width })
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: color,
        width: width
      }),
      text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
          color: '#000'
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 1
        }),
      })
    });
    return style
  }
  public setDefaultStyleandFilter(layer: UserPageLayer) {
    try {
      if (layer.style.filter.column == "") {
        layer.style.filter.column = layer.layer.defaultStyle.filter.column;
        layer.style.filter.operator = layer.layer.defaultStyle.filter.operator;
        layer.style.filter.value = layer.layer.defaultStyle.filter.value;
        layer.style.load.color = layer.layer.defaultStyle.load.color;
        layer.style.current.color = layer.layer.defaultStyle.current.color
      }
      if (layer.style.load.color == "") {
        layer.style.load.color = layer.layer.defaultStyle.load.color
        layer.style.load.width = layer.layer.defaultStyle.load.width
      }

    }
    catch (e) {
      //No Default Filter
    }
  }

  private getMyCubeData(layer): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.geojsonservice.GetSome(layer.layer.ID, 'closed IS Null')
        .subscribe((data: GeoJSON.Feature<any>) => {
          console.log(data)
          resolve(data);
        })
    })
    return promise;
  }
}
