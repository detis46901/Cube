import { LayerClass, LayerPermission, UserPageLayer, MyCubeField, MyCubeComment, MyCubeConfig } from '../../../_models/layer.model';
import { Server } from '../../../_models/server.model';
import { User, UserPage } from '../../../_models/user.model';
import Feature from 'ol/Feature';
import { UserPageInstance, ModulePermission } from '_models/module.model';
import View from 'ol/View'
import {Fill, Stroke, Circle, Style} from 'ol/style';
import Text from 'ol/style/Text';
import Collection from 'ol/Collection';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';

export interface MapConfigView {
    projection: string;
    center: [number, number];
    zoom: number;
    resolutions?: number[];
    zoomDuration?: number;
}

export class MapConfig {
    name?: string;
    user: User;
    userID?: number;
    map?: any;  // this should be of type ol.Map.  However, that causes a problem with the "getTarget()" method in map.component.ts
    view?: View;
    geolocation: ol.Geolocation;
    tracking: boolean = false;
    baseLayers = new Array  //THere is only one base layer, but ol requires it to be an array
    evkey: any; //current click event
    selectedFeature?: Feature;
    selectedFeatures?: Collection<Feature> = new Collection<Feature>()
    selectedFeatureSource: VectorSource
    selectedFeatureLayer: VectorLayer
    userpages? = new Array<UserPage>();
    defaultpage?: UserPage;  //This looks like a duplicate that is also in userpages[]
    currentpage?: UserPage;
    userpagelayers?: UserPageLayer[];
    userpageinstances?: UserPageInstance[];
    userpageinstancelist?: string;
    currentLayer? = new UserPageLayer;
    currentLayerName?: string = "";
    featureList? =  new Array<featureList>();
    editmode?: boolean;
    showDeleteButton: boolean;
    showFilterButton: boolean;
    showStyleButton: boolean;
    layerpermission?: LayerPermission[];
    modulepermission?: ModulePermission[];
    mouseoverLayer?: UserPageLayer;
    drawMode?: string = ""
    filterOn?: boolean;
    filterShow?: boolean;
    styleShow?: boolean;
    measureShow?: boolean;
    featureDataShow: boolean;
    modulesShow?: boolean;
    myCubeConfig: MyCubeConfig;
    myCubeData: MyCubeField[]
    myCubeComment: MyCubeComment[]
}

export class featureList {
    id?: number;
    label: string
    feature: Feature
}

export class mapStyles {
    public image = new Circle({
        radius: 5,
        fill: null,
        stroke: new Stroke({ color: 'red', width: 1 })
    });

    public load = new Style({
        image: new Circle({
            radius: 5,
            fill: null,
            stroke: new Stroke({color: '#319FD3', width: 2})
        }),
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
            color: '#319FD3',
            width: 2
        }),
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: '#000'
            }),
            stroke: new Stroke({
                color: '#fff',
                width: 1
            }),
        })
    });

    public current = new Style({
        image: new Circle({
            radius: 5,
            fill: null,
            stroke: new Stroke({color: '#319FD3', width: 4})
        }),
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new Stroke({
            color: '#319FD3',
            width: 4
        }),
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: '#000'
            }),
            stroke: new Stroke({
                color: '#fff',
                width: 5
            })
        })
    })

    public selected = new Style({
        zIndex: 100,
        image: new Circle({
            radius: 5,
            fill: null,
            stroke: new Stroke({color: '#ff0000', width: 4})
        }),
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new Stroke({
            color: '#ff0000',
            width: 4
        }),
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: '#000'
            }),
            stroke: new Stroke({
                color: '#fff',
                width: 10
            })
        })
    })

    public loadmulti = {
        'Point': new Style({
            image: this.image
        }),
        'LineString': new Style({
            stroke: new Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiLineString': new Style({
            stroke: new Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiPoint': new Style({
            image: this.image
        }),
        'MultiPolygon': new Style({
            stroke: new Stroke({
                color: 'yellow',
                width: 1
            }),
            fill: new Fill({
                color: 'rgba(255, 255, 0, 0.1)'
            })
        }),
        'Polygon': new Style({
            stroke: new Stroke({
                color: 'blue',
                lineDash: [4],
                width: 3
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        }),
        'GeometryCollection': new Style({
            stroke: new Stroke({
                color: 'magenta',
                width: 2
            }),
            fill: new Fill({
                color: 'magenta'
            }),
            image: new Circle({
                radius: 10,
                fill: null,
                stroke: new Stroke({
                    color: 'magenta'
                })
            })
        }),
        'Circle': new Style({
            stroke: new Stroke({
                color: 'red',
                width: 2
            }),
            fill: new Fill({
                color: 'rgba(255,0,0,0.2)'
            })
        })
    };
}
