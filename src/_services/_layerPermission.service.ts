import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { LayerPermission } from '../_models/layer.model';

@Injectable()
export class LayerPermissionService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'layerpermission/';
    }

    public GetByUser = (userid): Observable<LayerPermission[]> => {
        return this._http.get(this.actionUrl + 'getbyuser?userid=' + userid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetByUserGroups = (userid): Observable<LayerPermission[]> => {
        return this._http.get(this.actionUrl + 'getbyusergroups?userID=' + userid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetByLayer = (layerid): Observable<LayerPermission[]> => {
        return this._http.get(this.actionUrl + 'getbylayer?layerID=' + layerid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetByGroup = (groupid): Observable<LayerPermission[]> => {
        console.log(this.actionUrl + 'getbygroup?groupID=' + groupid, this.options)
        return this._http.get(this.actionUrl + 'getbygroup?groupID=' + groupid, this.options)
            .pipe(catchError(this.handleError));
    }
}