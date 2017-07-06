
//Josh Church 6/9/17: This is correct to my understanding, but this module cannot be exported if there are top-level import statements.
/*import xhr = require('corslite')
import csv2geojson = require('csv2geojson')
import wellknown = require('wellknown')
import polyline = require('polyline')
//import topojson = require('topojson/topojson.js')
import toGeoJSON = require('togeojson')*/

declare namespace omnivore {
    export function addData(l: any, d: any);
    export function polyline(url: string, options?: object, customLayer?: object): any;
    export function geojson(url: string, options: object, customLayer: object): any;
    export function topojson(url: string, options: object, customLayer: object): any;
    export function kml(url: string, options?: object, customLayer?: object): any;
    export function parseXML(str: any): any;
    export function kmlParse(gpx: any, options: any, layer: any): any;
    export function kmlParse(gpx: any): any;

    export function toGeoJSON();
    /*export var someVar: { a: SomeType }

    export interface SomeType {
        count: number
    }*/
}

declare module 'leaflet-omnivore' {
    export = omnivore;
}