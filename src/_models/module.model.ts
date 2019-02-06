export class Module {
    ID?: number;
    identity: string;
    name: string;
    description: string;
}

export class ModuleInstance {
    ID?: number;
    name: string;
    description: string;
    moduleID: number
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
}

export class UserPageInstance {
    ID?: number;
    userID?: number;
    defaultON?: boolean;
    userPageID?: number;
    moduleInstanceID?: number;
    style: JSON;
    instanceOrder: number;
}