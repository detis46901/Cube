import { Injectable } from '@angular/core';
 
@Injectable()
export class Configuration {
    //private server: string = "http://a.cityofkokomo.org:5000/"; //--Used for hosting from server
    private insideserver: string = "http://localhost:5000/";
    private outsideserver: string = "http://a.cityofkokomo.org:5000/"; //--Used for hosting from server
    private server: string = this.outsideserver
    private apiUrl: string = "api/";
    public serverWithApiUrl = this.server + this.apiUrl;
    public outsideServerWithApiUrl = this.outsideserver + this.apiUrl
}