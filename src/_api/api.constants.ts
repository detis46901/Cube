import { Injectable } from '@angular/core';
 
@Injectable()
export class Configuration {
    public Server: string = "http://foster2.cityofkokomo.org:5000/";
    public ApiUrl: string = "api/";
    public ServerWithApiUrl = this.Server + this.ApiUrl;
}