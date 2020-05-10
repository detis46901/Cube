export class Domain {
    ID: number;
    title: string;
    url: string;
    centerlong: number;
    centerlat: number;
    centerzoom: number;
    bingmapskey: string;
    mapboxbasemapurl: string;
    localz: string;
    cacheSize: number;
}

export class User {
    ID: number;
    firstName: string;
    lastName: string;
    password: string;
    active: boolean;
    email: string;
    administrator: boolean;
    public: boolean;
    domain: Domain;
}

export class UserPage {
    ID: number;
    userID: number;
    page: string = "";
    pageOrder: number;
    default: boolean;
    active?: boolean;
    defaultLayer?: number;
}

export class Notif {
    ID: number;
    userID: number;
    name: string;
    description: string;
    link: string;
    priority: number;
    read: boolean;
    objectType: string;
    sourceID: number;
}
