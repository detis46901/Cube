import { Role } from './organization.model';

export class User {
    ID: number;
    firstName: string;
    lastName: string;
    password: string;
    roleID: number;
    role?: Role; //Maybe this is better than roleID
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