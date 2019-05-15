import * as ol from 'openlayers';
export class Image {
    _id: string;
    title: string;
    properties: Properties
    acquisition_start: string;
    acquisition_end: string;
    bbox: Array<number>
    polys: [Number, Number][][]
    feature: ol.Feature
    on: Boolean = false;
    layer: ol.layer.Tile
}

export class Properties {
    wmts: string
}

export class coord {
    lat: Number
    lng: Number
}

export class poly {
    poly: Array<coord>
}

