import { User } from "./user.model";
import { Group } from "./group.model";

export class Module {
    ID?: number;
    identity: string;
    name: string;
    description: string;
    defaultInstanceSettings: JSON;
    defaultUserSettings: JSON;
}

export class ModuleInstance {
    ID?: number;
    name: string;
    description: string;
    settings: JSON;
    moduleID: number;
    module: Module
}

export class ModulePermission {
    ID: number;
    edit: boolean;
    delete: boolean;
    owner: boolean;
    canGrant: boolean;
    grantedBy?: number;
    comments?: string;
    userID: number;
    moduleInstanceID: number;
    groupID: number;
    user: User
    group: Group
}

export class UserPageInstance {
    ID?: number;
    userID?: number;
    defaultON?: boolean;
    userPageID?: number;
    moduleInstanceID?: number;
    module_instance: ModuleInstance;
    instanceOrder: number;
}
