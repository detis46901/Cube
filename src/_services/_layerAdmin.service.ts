import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { LayerAdmin } from '../_models/layer.model';
 
@Injectable()
export class LayerAdminService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;

    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'LayerAdmin/';
    }

    public Delete = (id: number): Observable<LayerAdmin> => {
        console.log(this.actionUrl + 'delete?ID=' + id)
        return this._http.delete(this.actionUrl + 'delete?ID=' + id)
            .catch(this.handleError);
    }
}