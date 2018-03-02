export class User {
    ID: number;
    firstName: string;
    lastName: string;
    password: string;
    active: boolean;
    email: string;
    administrator: boolean;
}

export class UserPage {
    ID: number;
    userID: number;
    page: string;
    pageOrder: number;
    default: boolean;
    active?: boolean;
}

export class Notification {
    ID: number;
    userID: number;
    name: string;
    description: string;
    link: string;
    priority: number;
    read: boolean;
}