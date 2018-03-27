import { Component, OnInit, Input, HostBinding, NgModule, ModuleWithProviders, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleChange } from '@angular/material';
import { MapConfig } from '../models/map.model'
import { NULL_INJECTOR } from '@angular/core/src/render3/component';


//import { MangolMap } from './../../core/_index';

declare var ol: any;
//import { MangolConfigMeasureItem } from '../../interfaces/mangol-config-toolbar.interface';


@Component({
  selector: 'measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.scss']
})

export class MeasureComponent implements OnInit, OnDestroy {
  @Input() mapConfig: MapConfig;
  //measure stuff
  private measureOn: boolean = false;
  private layer: ol.layer.Vector = null;
  public draw: ol.interaction.Draw
  public value: number
  public measureType: string
  public measureLabel: string
  public font = 'normal 14px Arial';
  public unit: string
  public convert: number

  constructor() {
  }

  ngOnInit() {
    this.unit = 'feet'
    this.convert = 1
    this.layer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: (feature: ol.Feature) => {
        return this._getStyle(feature);
      }
    });
    //this.deactivateDraw();
    this.mapConfig.map.addLayer(this.layer);
    this.measureLabel = "Length"
    this.measure('LineString')

  }

  ngOnDestroy() {
    this.deactivateDraw();
    this.mapConfig.map.removeLayer(this.layer);
  }

  private measure(mtype: string) {
    //this.measureOn = true
    if (mtype == "Polygon") {this.unit = "acres"; this.convert = 1/43560; this.measureLabel = "Area"}
    if (mtype == "LineString") {this.unit = "feet"; this.convert = 1; this.measureLabel = "Length"}
    this.measureType = mtype
    this.deactivateDraw();
    this.draw = new ol.interaction.Draw({
        source: this.layer.getSource(),
        type: mtype,
        style: (feature: ol.Feature) => {
            return this._getStyle(feature);
        }
    });
    this.draw.on('drawstart', (e: any) => {
        this.value = null;
        this.layer.getSource().clear();
    });
    this.draw.on('drawend', (e: any) => {
        const feat: ol.Feature = new ol.Feature({
            geometry: e.target,
        });
        let src = new ol.source.Vector()
        let vector = new ol.layer.Vector({
            source: src
        });
        this.mapConfig.map.addLayer(vector)
        this._getLengthOrArea(feat);
    });
    this.draw.setActive(true);
    this.mapConfig.map.addInteraction(this.draw);
}

  deactivateDraw() {
    this.value = null;
    this.layer.getSource().clear();
    try {
      this.mapConfig.map.removeInteraction(this.draw);
    } catch (error) {
    }
  }

  private _setCursor(cursorType: string) {
  }

  private _getLengthOrArea(feature: ol.Feature): string {
    let value = '';
    const geom: any = feature.getGeometry();
    switch (this.measureType) {
      case 'LineString':
        try {
           value = parseFloat((ol.Sphere.getLength(geom)*3.28084*this.convert).toString()).toFixed(2).toString();
           if (value == '0.00') {value = ''}
         // value = parseFloat((geom.getLength()).toString()).toFixed(2).toString();
        } catch (error) { }
        break;
      case 'Polygon':
        try {
          value = parseFloat((ol.Sphere.getArea(geom)*10.76391*this.convert).toString()).toFixed(2).toString();
          if (value == '0.00') {value = ''}
        } catch (error) { }
        break;
      default:
        break;
    }
     if (value !== '') {
       this.value = +value;
     }
    return value;

  }

  private changeUnit(unit: string, convert: number) {
    this.unit = unit
    this.convert = convert
    this._getLengthOrArea(this.layer.getSource().getFeatures()[0])
    this.layer.getSource().getFeatures()[0].changed()

  }
  private _getStyle(feature: ol.Feature): ol.style.Style[] {
    return [new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'black'
      })
    }), new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 2,
        lineDash: [5, 5]
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        })
    }),
    text: new ol.style.Text({
      textAlign: 'center',
      textBaseline: 'middle',
      text: this._getLengthOrArea(feature),
      font: this.font,
      fill: new ol.style.Fill({
        color: 'black'
      }),
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      stroke: new ol.style.Stroke({
        color: 'white',
        width: 3
      }),
    })
    
        })];

  }

}
