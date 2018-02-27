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
    layerON: boolean;
    createdAt: string;
    updatedAt: string;
    userID: number;    
    userPageID: number;
    layerID: number;
    style: JSON;
    layer = new Layer;
    layerPermissions = new LayerPermission;
    serverID: number;
    layerShown: boolean;
    loadOrder: number;
    loadStatus: string;
}

export class MyCubeField {
    field: string;
    type: string;
    value?: any;
    label?: boolean
}

export class MyCubeConfig {
    table: number;
    edit: boolean;
}

export class MyCubeComment {
    id: number;
    userID: number;
    comment: string;
    geom: string;
    featureID: number;
    createdat: Date;
    firstName: string;
    lastName: string;
}

export class WMSLayer {
    Title: string;
    Name: string;
}