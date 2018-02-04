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
    layer = new Layer;
    layerPermissions = new LayerPermission;
    serverID: number;
    layerShown: boolean;
    loadOrder: number;
    clickEventKey: any;
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