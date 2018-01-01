import { LayerClass, LayerPermission, UserPageLayer } from '../../../_models/layer.model';
import { Server } from '../../../_models/server.model';
import { User, UserPage } from '../../../_models/user.model';

export interface MapConfigView {
    projection: string;
    center: [number, number];
    zoom: number;
    resolutions?: number[];
    zoomDuration?: number;
}

export class MapConfig {
    name?: string;
    map?: ol.Map;
    layers?= new Array;
    userpages?: UserPage[];
    defaultpage?: UserPage;
    currentpage?: UserPage;
    userpagelayers?: UserPageLayer[];
    layerpermission?: LayerPermission[];
}

// export interface MapConfig {
//     target: string,
//     view: MapConfigView,
//     layers?: LayerClass[],
//     layerpermissions?: LayerPermission,
//     userpagelayer?: UserPageLayer,
//     renderer?: string,
//     controllers?: string
// }

export class styles {
    public image = new ol.style.Circle({
        radius: 5,
        fill: null,
        stroke: new ol.style.Stroke({ color: 'red', width: 1 })
    });

    public styles = {
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