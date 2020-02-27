import { Injectable } from '@angular/core';
import Feature from 'ol/Feature';
import { Fill, Stroke, Circle, Style } from 'ol/style';

@Injectable()
export class StyleService {
  public styleFunction(feature: Feature, version: string): Style {
    let style = new Style({
      image: new Circle({
        radius: 10,
        stroke: new Stroke({
          color: '#fff'
        }),
        fill: new Fill({
          color: this.getFillColor(feature, version)
        })
      }),
      stroke: new Stroke({
        color: this.getFillColor(feature, version),
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      zIndex: this.getZIndex(feature)
    });
    return style
  }

  getFillColor(feature: Feature, version: string): string {
    let getFillColor: string
    if (version == 'selected') {
      return '#FF0000'
    }
    if (version == 'load') {
      return '#3399CC'
    }
    if (feature.get("completed")) {
      return '#000000'
    }
    if (feature.get("priority") == "Emergency") {
      return '#A00000'
    }
    if (feature.get("priority") == "Low") {
      return '#0000A0'
    }
    if (version == 'current') {
      return '#0000FF'
    }
    return getFillColor
  }

  getZIndex(feature: Feature): number {
    let featName: string = feature.getGeometry().getType()
    let ZI: number
    if (featName == "Polygon")
    {ZI = 100}
    if (featName == "LineString")
    {ZI = 10}
    if (featName == "Point")
    {ZI = 0}
    return ZI

  }
}
