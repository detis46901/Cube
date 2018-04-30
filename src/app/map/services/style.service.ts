import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LayerClass, LayerPermission, UserPageLayer } from '../../../_models/layer.model';
import { interaction } from 'openlayers';

 
@Injectable()
export class FilterService {
    constructor(protected _http: Http) {
}
public filterFunction(layer: UserPageLayer, mapSource: ol.source.Vector):ol.source.Vector {
    //this needs to be placed in filterService.  For some reason, that's harder than it seems.
    let filterType: string
    let filterLabel: string
    let filterColumn: string
    let filterOperator: string
    let filterValue: any
    let filteredSource: ol.source.Vector = mapSource

    if (layer.style) {
        //console.log(layer.style)
        filterColumn = layer.style['filter']['column']
        filterOperator = layer.style['filter']['operator']
        filterValue = layer.style['filter']['value']
        // console.log(filterColumn)
        // console.log(filterOperator)
        // console.log(filterValue)
    }
    else {
        if (layer.layer.defaultStyle['filter']) {
        filterColumn = layer.layer.defaultStyle['filter']['column']
        filterOperator = layer.layer.defaultStyle['filter']['operator']
        filterValue = layer.layer.defaultStyle['filter']['value']
        // console.log(filterColumn)
        // console.log(filterOperator)
        // console.log(filterValue)
        }
    }
    if (filterColumn) {
        mapSource.forEachFeature((feat) => {
            if (feat) {
                if (filterColumn && filterOperator) {
                    switch (filterOperator) {
                        case ("isEqual"): {
                            if (feat.get(filterColumn) == filterValue) {
                                filteredSource.addFeature(feat)
                            }
                            else {
                                if (filterValue == false) {
                                    if (feat.get(filterColumn) == null) { }
                                    else { mapSource.removeFeature(feat) }
                                }
                                else { mapSource.removeFeature(feat) }
                            }
                            break
                        }
                        case ("isNotEqual"): {
                            if (feat.get(filterColumn) != filterValue) {
                                filteredSource.addFeature(feat)
                            }
                            else {
                                if (filterValue == false) {
                                    if (feat.get(filterColumn) == null) {filteredSource.addFeature(feat) }
                                    else { mapSource.removeFeature(feat) }
                                }
                                else { mapSource.removeFeature(feat) }
                            }
                            break
                        }
                        case ("isGreaterThan"): {
                            console.log("isGreaterThan")
                            if (parseInt(feat.get(filterColumn)) > parseInt(filterValue)) {
                                console.log(parseInt(feat.get(filterColumn)))
                                console.log(parseInt(filterValue))
                                filteredSource.addFeature(feat)
                            }
                            else {
                                mapSource.removeFeature(feat)
                            }
                            break
                        }
                        case ("isLessThan"): {
                            console.log("isLessThan")
                            if (parseInt(feat.get(filterColumn)) < parseInt(filterValue)) {
                                filteredSource.addFeature(feat)
                            }
                            else {
                                mapSource.removeFeature(feat)
                            }
                            break
                        }
                    }
                    //this.mapConfig.filterOn = true  This needs to be turned on somehow.
                }
            }
        })
    }
    mapSource = filteredSource
    return (filteredSource)
}

    getoperator(tp: string) {
        switch (tp) {
            case "boolean": {
                return ([
                    { value: 'isEqual', viewValue: 'Equal' },
                    { value: 'isNotEqual', viewValue: 'Not Equal' }
                ])
            }
            case "text": {
                return ([
                    { value: 'isEqual', viewValue: 'Equal' },
                    { value: 'isNotEqual', viewValue: 'Not Equal' },
                    { value: 'contains', viewValue: 'Contains' }
                ])
            }
            case "date": {
                return ([
                    { value: 'isEqual', viewValue: 'Equal' },
                    { value: 'isNotEqual', viewValue: 'Not Equal' },
                    { value: 'isGreaterThan', viewValue: 'After' },
                    { value: 'isLessThan', viewValue: 'Before' }
                ])
            }
            case "double precision": {
                return ([
                    { value: 'isEqual', viewValue: 'Equal' },
                    { value: 'isNotEqual', viewValue: 'Not Equal' },
                    { value: 'isGreaterThan', viewValue: 'Greater Than' },
                    { value: 'isLessThan', viewValue: 'Less Than' }
                ])
            }
        }
    }
    // public filterFunction(layer: UserPageLayer, mapSource: ol.source.Vector):ol.source.Vector {
    //     //This is currently not being used.  The function needs to move to this location
    // //     let filteredSource = new ol.source.Vector
    // //     let i: number = 0
    // //     if (layer.layer.defaultStyle['filter']) {
    // //         mapSource.forEachFeature((feat) => {
    // //             i +=1
    // //             console.log(i)
    // //             if (feat) {
    // //                 console.log(feat)
    // //                 if (layer.layer.defaultStyle['filter']['column'] && layer.layer.defaultStyle['filter']['operator']) {
    // //                     console.log(layer.layer.defaultStyle['filter']['column'])
    // //                     console.log(layer.layer.defaultStyle['filter']['operator'])
    // //                     switch (layer.layer.defaultStyle['filter']['operator']) {
    // //                         case ("isEqual"): {
    // //                             console.log(feat.get(layer.layer.defaultStyle['filter']['column']))
    // //                             console.log(layer.layer.defaultStyle['filter']['value'])
    // //                             if (feat.get(layer.layer.defaultStyle['filter']['column']) == layer.layer.defaultStyle['filter']['value']) {
    // //                                 filteredSource.addFeature(feat)
    // //                             }
    // //                             break
    // //                         }
    // //                         case ("isNotEqual"): {
    // //                             if (feat.get(layer.layer.defaultStyle['filter']['column']) != layer.layer.defaultStyle['filter']['value']) {
    // //                                 filteredSource.addFeature(feat)
    // //                             }
    // //                             break
    // //                         }
    // //                     }
    // //                     return (filteredSource)
    // //                 }
    // //             }
    // //         })
    // //     }    return (filteredSource)
    //  }

}

export class StyleService {
    constructor() {}
    public styleFunction(feature, layer: UserPageLayer, mode:string):ol.style.Style {
        let color: string
        let width: number
        if (layer.style) {color = layer.style[mode]['color'];width = layer.style[mode]['width']}
        else {color = layer.layer.defaultStyle[mode]['color']; width = layer.layer.defaultStyle[mode]['width']}
        //console.log(mode)
        //console.log(color)
        let load = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: null,
                stroke: new ol.style.Stroke({color: color, width: width})
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
        return load
    }
    
}