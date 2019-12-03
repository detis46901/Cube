import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { UserPageLayer } from '../../../_models/layer.model';
import Feature from 'ol/Feature';
import {Fill, Stroke, Circle, Style} from 'ol/style';
import Text from 'ol/style/Text';

@Injectable()
export class StyleService {
    constructor() { }
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
    public styleFunction(feature: Feature, layer: UserPageLayer, mode: string): any {
        let color: string
        let width: number
        let text: string
        let labelName: string
        labelName = layer.style.listLabel;
        if (layer.style) {
            color = layer.style[mode].color; width = layer.style[mode].width
            if (layer.style[mode].showLabel) {text = feature.get(labelName)}
        }
        else {
            color = layer.layer.defaultStyle[mode].color; width = layer.layer.defaultStyle[mode].width
        }
        let style = new Style({
            image: new Circle({
                radius: 5,
                fill: null,
                stroke: new Stroke({ color: color, width: width })
            }),
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new Stroke({
                color: color,
                width: width
            }),
            text: new Text({
                font: '14px Calibri,sans-serif',
                fill: new Fill({
                    color: '#000'
                }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 1
                }),
                text: text,
                offsetY: -10
            })
        });
        if (this.filterFunction(feature, layer) == false) { style = new Style({}) }
        return style
    }
    public filterFunction(feat: Feature, layer: UserPageLayer): boolean {
        let filterColumn: string
        let filterOperator: string
        let filterValue: any
        let visible: boolean = true

        if (layer.style) {
            try {
                if (layer.style.filter.column != "" || layer.style.filter.column != null) {
                    filterColumn = layer.style.filter.column
                    filterOperator = layer.style.filter.operator
                    filterValue = layer.style.filter.value
                }
            }
            catch (e) {
                //console.log('No Filter');
            }

        }
        else {
            if (layer.layer.defaultStyle.filter) {
                filterColumn = layer.layer.defaultStyle.filter.column
                filterOperator = layer.layer.defaultStyle.filter.operator
                filterValue = layer.layer.defaultStyle.filter.value
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