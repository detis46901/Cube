import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './parent.service';
 
@Injectable()
export class LayerAdminService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;

    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'LayerAdmin/';
    }
}