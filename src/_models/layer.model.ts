import { Server } from './server.model'
export class LayerAdmin {
    ID: number;
    layerName: string;
    layerType: string;
    layerService: string;
    layerIdent: string;
    layerFormat: string;
    layerDescription: string;
    layerGeom: string;
    serverID: number;
    server: Server;
}

export class LayerPermission {
    ID: number;
    userID: number;
    edit: boolean;
    layerAdminID: number;
}

export class LayerClass extends LayerAdmin {
    on: boolean;
}

export class UserPageLayer {
    ID: number;
    layerON: boolean;
    createdAt: string;
    updatedAt: string;
    userID: number;    
    userPageID: number;
    layerAdminID: number;
    layer_admin: LayerAdmin;
    serverID: number;
    layerShown: boolean;
}

export class MyCubeField {
    field: string;
    type: string;
    value?: any;
}

export class MyCubeConfig {
    table: number;
    edit: boolean;
}