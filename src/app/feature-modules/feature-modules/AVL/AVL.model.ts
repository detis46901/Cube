import TileLayer from 'ol/layer/Tile';
import Geometry from 'ol/geom/Geometry';
import Feature from 'ol/Feature';
import { UserPageLayer } from '_models/layer.model';
import Layer from 'ol/layer/Layer';
import {Fill, Stroke, Circle, Style} from 'ol/style';
import { Injectable } from "@angular/core";



export class Image {
    _id: string;
    title: string;
    properties: Properties
    acquisition_start: string;
    acquisition_end: string;
    bbox: Array<number>
    polys: [Number, Number][][]
    feature: Feature
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

export class AVLConfig {
    token: JSON
    UPL: UserPageLayer
    group: Group
    vehicles = new Array<Vehicle>()
    fleetLocations = new Array<GpsMessage>()
    selectedVehicle = new Vehicle
    startDate: Date
    endDate: Date
    olTrackLayer: Layer
    olTrackSource: any 
}

export class GpsMessage {
    latitude: number
    longitude: number
    accuracy: number
    odometer: number
    keyOn: boolean
    parked: boolean
    lastSpeed: number
    avgSpeed: number
    maxSpeed: number
    heading: number
    vehicleId: number
    vehicleLabel: string 
}

export class Group {
    id: number
    parentId: number
    name: string
    description: string
    vehicleIds: Array<number>
}

export class Vehicle {
    id: number
    type: string
    color: string
    fuelType: string
    label: string
    licensePlate: string //needs to be it's own object with state and country
    make: string
    model: string
    odometer: string //needs to be it's own object
    trackableItemType: string
    vin: string //needs to be it's own object
    year: number
    currentLocation: GpsMessage
}

@Injectable()
export class AVLStyles {
    public load = new Style({
        image: new Circle({
            radius: 10,
            stroke: new Stroke({
                color: '#fff'
            }),
            fill: new Fill({
                color: '#3399CC'
            })
        }),
        // text: new ol.style.Text({
        //   text: '1',
        //   fill: new ol.style.Fill({
        //     color: '#fff'
        //   })
        // })
    });

    public current = new Style({
        image: new Circle({
            radius: 10,
            stroke: new Stroke({
                color: '#fff'
            }),
            fill: new Fill({
                color: '#0000FF'
            })
        }),
        // text: new ol.style.Text({
        //   text: '1',
        //   fill: new ol.style.Fill({
        //     color: '#fff'
        //   })
        // })
    });

    public selected = new Style({
        image: new Circle({
            radius: 10,
            stroke: new Stroke({
                color: '#fff'
            }),
            fill: new Fill({
                color: '#FF0000'
            })
        }),
        zIndex: 100
        // text: new ol.style.Text({
        //   text: '1',
        //   fill: new ol.style.Fill({
        //     color: '#fff'
        //   })
        // })
    });
}