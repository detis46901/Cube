import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField } from '_models/layer.model';
import { UserPageInstance } from '_models/module.model'
import { MapConfig, mapStyles, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
import { Locate, locateStyles } from './locates.model'
import { MatSnackBar } from '@angular/material/snack-bar';
//http dependancies
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import { SQLService } from './../../../../_services/sql.service';
import { Subject } from 'rxjs/Subject';
import { MyCubeService } from './../../../map/services/mycube.service'
import { Http } from '@angular/http';
import { Router } from '@angular/router'
import Feature from 'ol/Feature';
import {Fill, Stroke, Circle, Style} from 'ol/style';






@Injectable()
export class StyleService {
    private locateStyles = new locateStyles
    public styleFunction(feature: Feature, version: string): Style {
        let style = new Style({
            image: new Circle({
                radius: this.getDepthRadius(feature),
                stroke: new Stroke({
                    color: '#fff'
                }),
                fill: new Fill({
                    color: this.getFillColor(feature, version)
                })
            }),
        });
        return style
    }

    getDepthRadius(feature: Feature): number {
        let depthRadius: number
        let depth: string = feature.get("depth")
        let depthNum: number
        try {
            if (depth.includes("FEET")) {
                depthNum = +depth.split("FEET")[0]
            }
            if (depth.includes("FT")) {
                depthNum = +depth.split("FT")[0]
            }
            if (depthNum < 4) {
                depthRadius = 6
            }
            else {
                depthRadius = 10
            }
        }
        catch{
            depthRadius = 10
        }
        return depthRadius
    }

    getFillColor(feature: Feature, version: string): string {
        let getFillColor: string
        let d: string = feature.get('sdate')
        let t: string = (feature.get('stime'))
        let dt = new Date(d + ' ' + feature.get('stime'))
        // console.log(dt)
        let now = new Date()

        if (feature.get("closed")) {
            console.log(feature.get("closed"))
            return '#000000'
        }
        if (feature.get("emergency") == true) {
            return '#A00000'
        }
        if (!feature.get("closed")) {
            if ((dt.getTime() - now.getTime())/1000/86400 < 0) {
                return '#FF0000'
            }
            if ((dt.getTime() - now.getTime())/1000/86400 < 1) {
                return '#FFFF00'
            }
        }
        if (version == 'load') {
            return '#3399CC'
        }
        if (version == 'current') {
            return '#0000FF'
        }


        return getFillColor
    }
}
