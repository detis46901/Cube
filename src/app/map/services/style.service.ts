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
        //console.log(this.filterFunction(feature, layer))
        //console.log("styleFunction")
        let color: string
        let width: number
        //console.log(feature)
        //console.log(this.filterFunction(feature, layer))
        if (layer.style) { color = layer.style[mode]['color']; width = layer.style[mode]['width'] }
        else { color = layer.layer.defaultStyle[mode]['color']; width = layer.layer.defaultStyle[mode]['width'] }
        //console.log(mode)
        //console.log(color)
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
        //console.log(this.filterFunction(feature, layer))
        if (this.filterFunction(feature, layer) == false) {style = new ol.style.Style ({})}
        return style
    }
    public filterFunction(feat: ol.Feature, layer: UserPageLayer): boolean {
        //console.log("filterFunction")
        let filterType: string
        let filterLabel: string
        let filterColumn: string
        let filterOperator: string
        let filterValue: any
        let visible: boolean = false

        if (layer.style) {
            //console.log(layer.style)
            filterColumn = layer.style['filter']['column']
            filterOperator = layer.style['filter']['operator']
            filterValue = layer.style['filter']['value']
            //console.log(filterColumn)
            //console.log(filterOperator)
            //console.log(filterValue)
        }
        else {
            if (layer.layer.defaultStyle['filter']) {
                filterColumn = layer.layer.defaultStyle['filter']['column']
                filterOperator = layer.layer.defaultStyle['filter']['operator']
                filterValue = layer.layer.defaultStyle['filter']['value']
                console.log(filterColumn)
                console.log(filterOperator)
                console.log(filterValue)
            }
        }
        //console.log (feat)
        if (filterColumn) {
            if (filterColumn && filterOperator) {
                switch (filterOperator) {
                    case ("isEqual"): {
                        console.log(filterValue)
                        console.log(feat.get(filterColumn))
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
                        break
                    }
                    case ("isNotEqual"): {
                        if (feat.get(filterColumn) != filterValue) {
                            visible = true
                        }
                        else {
                            if (filterValue == false) {
                                if (feat.get(filterColumn) == null) { visible = true }
                                else { visible = false }
                            }
                            else { visible = false }
                        }
                        break
                    }
                    case ("isGreaterThan"): {
                        console.log("isGreaterThan")
                        if (parseInt(feat.get(filterColumn)) > parseInt(filterValue)) {
                            //console.log(parseInt(feat.get(filterColumn)))
                            //console.log(parseInt(filterValue))
                            visible = true
                        }
                        else {
                            visible = false
                        }
                        break
                    }
                    case ("isLessThan"): {
                        console.log("isLessThan")
                        if (parseInt(feat.get(filterColumn)) < parseInt(filterValue)) {
                            visible = true
                        }
                        else {
                            visible = false
                        }
                        break
                    }
                }
                //this.mapConfig.filterOn = true  This needs to be turned on somehow.
            }
        }
        return (visible)
    }
    
}