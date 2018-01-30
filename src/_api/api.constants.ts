import { Injectable } from '@angular/core';
 
@Injectable()
export class Configuration {
    //public server: string = "http://a.cityofkokomo.org:5000/"; //--Used for hosting from server
    private server: string = "http://localhost:5000/";
    private apiUrl: string = "api/";
    public serverWithApiUrl = this.server + this.apiUrl;
}