import { Injectable } from '@angular/core';
import Feature from 'ol/Feature';
import { AVLStyles } from './AVL.model'
import {Fill, Stroke, Circle, Style, RegularShape} from 'ol/style';

@Injectable()
export class StyleService {
    private locateStyles = new AVLStyles
    public styleFunction(){
        var stroke = new Stroke({color: 'black', width: 2});
        var fill = new Fill({color: 'red'});
        let style =  new Style({
            image: new RegularShape({
              fill: fill,
              stroke: stroke,
              points: 4,
              radius: 10,
              angle: Math.PI / 4,
            }),
          })
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
        // if (version == 'load') {getFillColor = '#3399CC'}
        if (version == 'current' || version == 'load') {getFillColor = '#0000FF'}
        if (feature.get("closed")) {getFillColor = '#000000'}
        if (feature.get("emergency") == true) {getFillColor = '#A00000'}
        if (!feature.get("closed")) {
            if ((dt.getTime() - now.getTime())/1000/86400 < 1) {
                getFillColor = '#FFEA00'
            }
            if ((dt.getTime() - now.getTime())/1000/86400 < 0) {
                getFillColor = '#FF0FFF'
            }
        }
        if (version == 'selected') {getFillColor = '#FF0000'}
        if (version == 'load') getFillColor = getFillColor + '70'
        return getFillColor
    }
}
