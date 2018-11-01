import { Server } from './server.model'
export class Layer {
    ID: number;
    layerName: string;
    layerType: string;
    layerService: string;
    layerIdent: string;
    layerFormat: string = "";
    layerDescription: string;
    layerGeom: string;
    serverID: number;
    server: Server;
    defaultStyle: JSON;
}

export class LayerPermission {
    ID: number;
    edit: boolean;
    delete: boolean;
    owner: boolean;
    canGrant: boolean;
    grantedBy?: number;
    comments?: string;
    userID: number;
    layerID: number;
    layer: Layer;
    groupID: number;
}

export class LayerClass extends Layer {
    on: boolean;
}

export class UserPageLayer {
    ID: number;
    defaultON: boolean;
    createdAt: string;
    updatedAt: string;
    userID: number;
    userPageID: number;
    layerID: number;
    style: JSON;
    layer = new Layer;
    layerPermissions = new LayerPermission;
    serverID: number;
    layerShown: boolean;  //Need to get rid of this.  LayerOn should be sufficient.
    loadOrder: number;
    loadStatus: string;
    source: any
    olLayer: any;
    updateInterval: any;
}

export class MyCubeField {
    field: string;
    type: string;
    value?: any;
    label?: boolean
    changed?: boolean
    links? = new Array<string>()
}

export class MyCubeConfig {
    table: number;
    edit: boolean;
}

export class MyCubeComment {
    table: number;
    id: number;
    userID: number;
    comment: string = "";
    geom: string;
    featureID: string | number;
    auto: boolean;
    createdat: Date;
}

export class WMSLayer {
    Title: string;
    Name: string;
}