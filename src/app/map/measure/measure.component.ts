import { Component, OnInit, Input, HostBinding, NgModule, ModuleWithProviders, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleChange } from '@angular/material';
import { MapConfig } from '../models/map.model'
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Draw from 'ol/interaction/Draw';
import * as olSphere from 'ol/sphere';
import Text from 'ol/style/Text';
import {Fill, Stroke, Circle, Style} from 'ol/style';

//import { MangolMap } from './../../core/_index';

//declare var ol: any;
//import { MangolConfigMeasureItem } from '../../interfaces/mangol-config-toolbar.interface';

@Component({
    selector: 'measure',
    templateUrl: './measure.component.html',
    styleUrls: ['./measure.component.scss']
})

export class MeasureComponent implements OnInit, OnDestroy {
    @Input() mapConfig: MapConfig;
    //measure stuff
    public layer: VectorLayer = null;
    public draw: Draw
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
        this.layer = new VectorLayer({
            source: new VectorSource(),
            style: (feature: Feature) => {
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

    public measure(mtype: any) {
        if (mtype == "Polygon") { this.unit = "acres"; this.convert = 1 / 43560; this.measureLabel = "Area" }
        if (mtype == "LineString") { this.unit = "feet"; this.convert = 1; this.measureLabel = "Length" }
        this.measureType = mtype
        this.deactivateDraw();
        this.draw = new Draw({
            source: this.layer.getSource(),
            type: mtype,
            style: (feature: Feature) => {
                return this._getStyle(feature);
            }
        });
        this.draw.on('drawstart', (e: any) => {
            this.value = null;
            this.layer.getSource().clear();
        });
        this.draw.on('drawend', (e: any) => {
            const feat: Feature = new Feature({
                geometry: e.target,
            });
            let src = new VectorSource()
            let vector = new VectorLayer({
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

    public _setCursor(cursorType: string) {
    }

    public _getLengthOrArea(feature: Feature): string {
        let value = '';
        const geom: any = feature.getGeometry();
        switch (this.measureType) {
            case 'LineString':
                try {
                    value = parseFloat((olSphere.getLength(geom) * 3.28084 * this.convert).toString()).toFixed(2).toString();
                    if (value == '0.00') { value = '' }
                    // value = parseFloat((geom.getLength()).toString()).toFixed(2).toString();
                } catch (error) { }
                break;
            case 'Polygon':
                try {
                    value = parseFloat((olSphere.getArea(geom) * 10.76391 * this.convert).toString()).toFixed(2).toString();
                    if (value == '0.00') { value = '' }
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

    public changeUnit(unit: string, convert: number) {
        this.unit = unit
        this.convert = convert
        this._getLengthOrArea(this.layer.getSource().getFeatures()[0])
        this.layer.getSource().getFeatures()[0].changed()

    }
    public _getStyle(feature: Feature): Style[] {
        return [new Style({
            fill: new Fill({
                color: 'black'
            })
        }), new Style({
            stroke: new Stroke({
                color: 'black',
                width: 2,
                lineDash: [5, 5]
            }),
            image: new Circle({
                radius: 5,
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                })
            }),
            text: new Text({
                textAlign: 'center',
                textBaseline: 'middle',
                text: this._getLengthOrArea(feature),
                font: this.font,
                fill: new Fill({
                    color: 'black'
                }),
                offsetX: 0,
                offsetY: 0,
                rotation: 0,
                stroke: new Stroke({
                    color: 'white',
                    width: 3
                }),
            })
        })];
    }
}
