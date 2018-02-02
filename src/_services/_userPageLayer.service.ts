import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { UserPageLayer } from '../_models/layer.model';

@Injectable()
export class UserPageLayerService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;
 
    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'userpagelayer/';
    }

    public GetSome = (pageid): Observable<UserPageLayer[]> => {
        return this._http.get(this.actionUrl + 'list?ID=' + pageid, this.options)
            .map((response: Response) => <UserPageLayer[]>response.json())
            .catch(this.handleError);
    }

    public GetPageLayers = (pageid): Observable<UserPageLayer[]> => {
        return this._http.get(this.actionUrl + 'getpagelayers?pageID=' + pageid, this.options)
            .map((response: Response) => <UserPageLayer[]>response.json())
            .catch(this.handleError);
    }

    public GetUserLayers = (userid): Observable<UserPageLayer[]> => {
        return this._http.get(this.actionUrl + 'userlist?userid=' + userid, this.options)
            .map((response: Response) => <UserPageLayer[]>response.json())
            .catch(this.handleError);
    }

    public GetByLayer = (layerid): Observable<UserPageLayer[]> => {
        return this._http.get(this.actionUrl + 'getbylayer?layerID=' + layerid, this.options)
            .map((response: Response) => <UserPageLayer[]>response.json())
            .catch(this.handleError);
    }

}