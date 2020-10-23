import { Injectable } from '@angular/core';
import { UserPageLayer, MyCubeField } from '_models/layer.model';
import { UserPageInstance } from '_models/module.model'
import { MapConfig, mapStyles, featureList } from 'app/map/models/map.model';
import { geoJSONService } from 'app/map/services/geoJSON.service';
import { PaserStyles } from './paser.model'
import { MatSnackBar } from '@angular/material/snack-bar';
//http dependancies
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http'
import { Observable ,  Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SQLService } from '../../../../_services/sql.service';
import { MyCubeService } from '../../../map/services/mycube.service'
import { Router } from '@angular/router'
import Feature from 'ol/Feature';
import {Fill, Stroke, Circle, Style} from 'ol/style';




@Injectable()
export class StyleService {
    private locateStyles = new PaserStyles
    public styleFunction(feature: Feature, version: string): Style {
        let color: string
        switch(feature.get('rating')) {
            case 10:
                color = '#bcdf27'
            break
            case 9:
                color = '#7ad251'
            break
            case 8:
                color = '#43bf70'
            break
            case 7:
                color = '#22a884'
            break
            case 6:
                color = '#20908d'
            break
            case 5:
                color = '#29788e'
            break
            case 4:
                color = '#345f8d'
            break
            case 3:
                color = '#404387'
            break
            case 2:
                color = '#482475'
            break
            case 1:
                color = '#440154'
            break
            case null:
                color = '#fd2445'
            break
        }
        let style = new Style({
            stroke: new Stroke({
              color: color, //'rgba(0, 0, 255, 1.0)',
              width: 2
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

        if (version == 'load') {
            return '#3399CC'
        }
        if (version == 'current') {
            return '#0000FF'
        }
        if (version == 'selected') {
            return '#FF0000'
        }
        return getFillColor
    }

    styleSelected():Style {
        let style = new Style({
            stroke: new Stroke({
              color: "#ff0000", //'rgba(0, 0, 255, 1.0)',
              width: 4
            }),
        });
        return style
    }
}
