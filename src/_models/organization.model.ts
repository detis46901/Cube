export class Department {
    ID: number;
    department: string;
    active: boolean;
}

export class Group {
    ID: number;
    group: string;
    active: boolean;
    departmentID: number;
}

export class Role {
    ID: number;
    groupID: number;
    role: string;
    active: boolean;
}