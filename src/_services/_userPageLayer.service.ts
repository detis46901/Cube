import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { UserPageLayer } from '../_models/layer.model';

@Injectable()
export class UserPageLayerService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'userpagelayer/';
    }

    public GetSome = (pageid): Observable<any> => {
        return this._http.get(this.actionUrl + 'list?ID=' + pageid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetPageLayers = (pageid): Observable<any> => {
        return this._http.get(this.actionUrl + 'getpagelayers?pageID=' + pageid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetUserLayers = (userid): Observable<any> => {
        return this._http.get(this.actionUrl + 'userlist?userid=' + userid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetByLayer = (layerid): Observable<any> => {
        return this._http.get(this.actionUrl + 'getbylayer?layerID=' + layerid, this.options)
            .pipe(catchError(this.handleError));
    }

}