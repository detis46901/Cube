import { LayerClass, LayerPermission, UserPageLayer } from '../../../_models/layer.model';
import { Server } from '../../../_models/server.model';
import { User, UserPage } from '../../../_models/user.model';
import { Feature } from 'openlayers';

export interface MapConfigView {
    projection: string;
    center: [number, number];
    zoom: number;
    resolutions?: number[];
    zoomDuration?: number;
}

export class MapConfig {
    name?: string;
    userID?: number;
    map?: ol.Map;
    view?: ol.View;
    sources?= new Array;  //to delete
    layers? = new Array;  //to delete
    selectedFeature?: ol.Feature;
    selectedFeatures?: ol.Collection<ol.Feature> = new ol.Collection<ol.Feature>()
    userpages?: UserPage[];
    defaultpage?: UserPage;
    currentpage?: UserPage;
    userpagelayers?: UserPageLayer[];
    currentLayer? = new UserPageLayer;
    currentLayerName?: string;
    editmode?: boolean;
    layerpermission?: LayerPermission[];
    mouseoverLayer?: UserPageLayer;
    drawMode?: string;
    filterOn?: boolean;
    filterShow?: boolean;
    styleShow?: boolean;
    styleOn?: boolean;  //to delete
}

export class featureList {
    label: string
    feature: ol.Feature
}

export class mapStyles {
    public image = new ol.style.Circle({
        radius: 5,
        fill: null,
        stroke: new ol.style.Stroke({ color: 'red', width: 1 })
    });

    public load = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: null,
            stroke: new ol.style.Stroke({color: '#319FD3', width: 2})
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#319FD3',
            width: 2
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

    public current = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: null,
            stroke: new ol.style.Stroke({color: '#319FD3', width: 4})
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: '#319FD3',
            width: 4
        }),
        text: new ol.style.Text({
            font: '12px Calibri,sans-serif',
            fill: new ol.style.Fill({
                color: '#000'
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 5
            })
        })
    })

    public selected = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: null,
            stroke: new ol.style.Stroke({color: '#ff0000', width: 4})
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ff0000',
            width: 4
        }),
        text: new ol.style.Text({
            font: '12px Calibri,sans-serif',
            fill: new ol.style.Fill({
                color: '#000'
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 10
            })
        })
    })

    public loadmulti = {
        'Point': new ol.style.Style({
            image: this.image
        }),
        'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiLineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiPoint': new ol.style.Style({
            image: this.image
        }),
        'MultiPolygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 0, 0.1)'
            })
        }),
        'Polygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                lineDash: [4],
                width: 3
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        }),
        'GeometryCollection': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'magenta',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'magenta'
            }),
            image: new ol.style.Circle({
                radius: 10,
                fill: null,
                stroke: new ol.style.Stroke({
                    color: 'magenta'
                })
            })
        }),
        'Circle': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0.2)'
            })
        })
    };
}