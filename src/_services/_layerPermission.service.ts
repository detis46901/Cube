import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { LayerPermission } from '../_models/layer.model';
 
@Injectable()
export class LayerPermissionService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;
 
    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'layerpermission/';
    }

    public GetUserLayer = (userid): Observable<LayerPermission[]> => {
        return this._http.get(this.actionUrl + 'userlist?userid=' + userid, this.options)
            .map((response: Response) => <LayerPermission[]>response.json())
            .catch(this.handleError);
    }
    
    public GetSome = (layerid): Observable<LayerPermission[]> => {
        return this._http.get(this.actionUrl + 'list?layerID=' + layerid, this.options)
            .map((response: Response) => <LayerPermission[]>response.json())
            .catch(this.handleError);
    }

}