import TileLayer from 'ol/layer/Tile';

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
    layer: TileLayer
    function: string //add or substract
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

