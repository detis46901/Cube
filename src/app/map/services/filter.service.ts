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