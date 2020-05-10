
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParentService } from './_parent.service';
import { environment } from 'environments/environment'

@Injectable()
export class UserPageLayerService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient) {
        super(_http);
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'userpagelayer/';
    }

    public GetSome = (pageid): Observable<any> => {
        return this._http.get(this.actionUrl + 'list?ID=' + pageid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetPageLayers = (pageid): Observable<any> => {
        return this._http.get(this.actionUrl + 'getpagelayers?pageID=' + pageid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetUserLayers = (userid): Observable<any> => {
        return this._http.get(this.actionUrl + 'userlist?userid=' + userid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetByLayer = (layerid): Observable<any> => {
        return this._http.get(this.actionUrl + 'bylayer?layerID=' + layerid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

}