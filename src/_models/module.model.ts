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
    settings: InstanceSettings;
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

export class InstanceSettings {
    id?: number;
    title: string
    type: string;
    description: string;
    autoSelect: boolean;
    properties = new Array<Properties>()
}

export class Properties {
    stringType: StringType
    integerType: IntegerType
    arrayType: ArrayType
}

export class StringType {
    name: string;
    type = 'string';
    format: string;
    description: string;
    minLength: number;
    default: string;
    value: string;
    enum = new Array<KeyValue>()
}

export class KeyValue {
    key: string
    value: string
}

export class IntegerType {
    name: string;
    type = 'integer';
    description: string;
    default: number;
    minimum: number;
    maximum: number;
    value: number;
}

export class ArrayType {
    name: string;
    format: string;
    type = 'array';
    title: string;
    uniqueItems: boolean;
    itemType: string;
    defaultItem: InstanceSettings
    items: Array<InstanceSettings>
}

export class UsersGroups {
    id: string;
    name: string;
}