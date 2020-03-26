import { Server } from './server.model'
import { MyCubeStyle } from './style.model'
import { UserPageInstance, ModulePermission } from './module.model'
import { User } from './user.model';
import { Group } from './group.model';
import {Match} from 'autolinker';


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
    defaultStyle: MyCubeStyle;
    legendURL: string;
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
    user: User;
    group: Group;
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
    style = new MyCubeStyle;
    layer = new Layer;
    layerPermissions = new LayerPermission();
    modulePermissions = new ModulePermission;
    serverID: number;
    layerShown: boolean;
    loadOrder: number;
    loadStatus: string;
    source: any
    olLayer: any
    updateInterval: any;
    userPageInstanceID: number;
    userpageinstance: UserPageInstance;
    layerOrder: number;
}

export class MyCubeConstraint {
    name: string | number;
    option: string;
}
export class MyCubeField {
    field: string;
    type: string;
    description?: string;
    value?: any;
    options?: string[]
    label?: boolean;
    changed?: boolean;
    links?: any[]
    constraints? = new Array<MyCubeConstraint>()
}

export class MyCubeURLs {
  url: string;
  anchorTag: string;
}

export class MyCubeConfig {
    table: number;
    edit: boolean;
}

export class MyCubeComment {
    table: number | string;
    id: number;
    userid: number;
    firstName: string;
    lastName: string;
    comment: string = "";
    geom: string;
    featureid: string | number;
    filename?: string;
    file?: File;
    auto: boolean;
    createdat: Date;
}

export class WMSLayer {
    Title: string;
    Name: string;
}
