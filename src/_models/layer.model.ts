export class LayerAdmin {
    ID: number;
    layerName: string;
    layerType: string;
    layerURL: string;
    layerIdent: string;
    layerFormat: string;
    layerDescription: string;
}

export class LayerPermission {
    ID: number;
    userID: number;
    edit: boolean;
    layerAdminID: number;
}

export class LayerClass extends LayerAdmin{
    on: boolean;
}

export class UserPageLayer {
    ID: number;
    userID: number;
    layerON: boolean;
    userPageID: number;
    layerAdminID: number;
    layer_admin: LayerAdmin;
}

export class ControlLayers {
    name: string;
    URL: L.WMS
}