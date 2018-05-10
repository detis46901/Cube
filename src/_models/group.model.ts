export class Group {
    ID: number;
    name: string;
    description?: string;
}

export class GroupMember {
    ID: number;
    groupID: number;
    userID: number;
}