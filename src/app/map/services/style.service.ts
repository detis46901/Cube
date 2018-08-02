import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LayerClass, LayerPermission, UserPageLayer } from '../../../_models/layer.model';
import { interaction } from 'openlayers';

@Injectable()
export class StyleService {
    constructor() { }
    public styleFunction(feature: ol.Feature, layer: UserPageLayer, mode: string): ol.style.Style {
        let color: string
        let width: number
        if (layer.style) {
            color = layer.style[mode]['color']; width = layer.style[mode]['width']
        }
        else {
            color = layer.layer.defaultStyle[mode]['color']; width = layer.layer.defaultStyle[mode]['width']
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
        if (this.filterFunction(feature, layer) == false) { style = new ol.style.Style({}) }
        return style
    }
    public filterFunction(feat: ol.Feature, layer: UserPageLayer): boolean {
        let filterType: string
        let filterLabel: string
        let filterColumn: string
        let filterOperator: string
        let filterValue: any
        let visible: boolean = true

        if (layer.style) {
            filterColumn = layer.style['filter']['column']
            filterOperator = layer.style['filter']['operator']
            filterValue = layer.style['filter']['value']
        }
        else {
            if (layer.layer.defaultStyle['filter']) {
                filterColumn = layer.layer.defaultStyle['filter']['column']
                filterOperator = layer.layer.defaultStyle['filter']['operator']
                filterValue = layer.layer.defaultStyle['filter']['value']
            }
        }
        if (filterColumn) {
            if (filterColumn && filterOperator) {
                switch (filterOperator) {
                    case ("isEqual"): {
                        if (filterColumn === "Complete" && feat.get(filterColumn) != null) {
                            var d1 = new Date(filterValue)
                            var d2 = new Date(feat.get(filterColumn))
                            if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDay() === d2.getDay()) {
                                visible = true;
                            }
                            else {
                                visible = false;
                            }
                            break;
                        }
                        else {
                            if (feat.get(filterColumn) == filterValue) {
                                visible = true
                            }
                            else {
                                if (filterValue == false) {
                                    if (feat.get(filterColumn) == null) { }
                                    else { visible = false }
                                }
                                else { visible = false }
                            }
                            break;
                        }
                    }
                    case ("isNotEqual"): {
                        if (filterColumn === "Complete" && feat.get(filterColumn) != null) {
                            var d1 = new Date(filterValue)
                            var d2 = new Date(feat.get(filterColumn))
                            if (d1.getFullYear() !== d2.getFullYear() && d1.getMonth() && d2.getMonth() && d1.getDay() !== d2.getDay()) {
                                visible = true;
                            }
                            else {
                                visible = false;
                            }
                            break;
                        }
                        else {
                            if (feat.get(filterColumn) != filterValue && feat.get(filterColumn) != null) {
                                visible = true
                            }
                            else {
                                if (filterValue == true) {
                                    if (feat.get(filterColumn) == null) { }
                                    else { visible = false }
                                }
                                else { visible = false }
                            }
                            break
                        }
                    }
                    case ("isGreaterThan"): {
                        if (filterColumn === "Complete" && feat.get(filterColumn) != null) {
                            var d1 = new Date(filterValue)
                            var d2 = new Date(feat.get(filterColumn))
                            if (d1.getFullYear() < d2.getFullYear()) {
                                visible = true;
                            }
                            else if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() < d2.getMonth()) {
                                visible = true;
                            }
                            else if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDay() < d2.getDay()) {
                                visible = true;
                            }
                            else {
                                visible = false;
                            }
                            break;
                        }
                        else {
                            if (parseInt(feat.get(filterColumn)) > parseInt(filterValue)) {
                                visible = true
                            }
                            else {
                                visible = false
                            }
                            break
                        }
                    }
                    case ("isLessThan"): {
                        if (filterColumn === "Complete" && feat.get(filterColumn) != null) {
                            var d1 = new Date(filterValue)
                            var d2 = new Date(feat.get(filterColumn))
                            if (d1.getFullYear() > d2.getFullYear()) {
                                visible = true;
                            }
                            else if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() > d2.getMonth()) {
                                visible = true;
                            }
                            else if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDay() > d2.getDay()) {
                                visible = true;
                            }
                            else {
                                visible = false;
                            }
                            break;
                        }
                        else {
                            if (parseInt(feat.get(filterColumn)) < parseInt(filterValue)) {
                                visible = true
                            }
                            else {
                                visible = false
                            }
                            break
                        }
                    }
                    case ("contains"): {
                        if (feat.get(filterColumn) != null && feat.get(filterColumn).indexOf(filterValue) + 1) {
                            visible = true;
                        }
                        else {
                            visible = false;
                        }
                    }
                }
                //this.mapConfig.filterOn = true  This needs to be turned on somehow.
            }
        }
        return (visible)
    }
}