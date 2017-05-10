export class User {
    ID: number;
    firstName: string;
    lastName: string;
    password: string;
    roleID: number;
    active: boolean;
    email: string;
    administrator: boolean;
}

export class UserPage {
    ID?: number;
    userID?: number;
    page: string;
    pageOrder: number;
    default: boolean;
    active?: boolean;
}