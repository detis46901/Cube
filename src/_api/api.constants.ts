import { Injectable } from '@angular/core';
import { environment } from 'environments/environment'
 
@Injectable()
export class Configuration {
    private ApiUrl = environment.apiUrl
    private apiUrl: string = "/api/";
    public serverWithApiUrl = this.ApiUrl + this.apiUrl;
}