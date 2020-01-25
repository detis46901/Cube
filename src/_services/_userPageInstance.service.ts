import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { UserPageInstance } from '../_models/module.model';

@Injectable()
export class UserPageInstanceService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'userpageinstance/';
    }

    public GetSome = (pageid): Observable<any> => {
        return this._http.get(this.actionUrl + 'list?ID=' + pageid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetPageInstances = (pageid): Observable<any> => {
        return this._http.get(this.actionUrl + 'getpageinstances?pageID=' + pageid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetUserInstances = (userid): Observable<any> => {
        return this._http.get(this.actionUrl + 'userlist?userid=' + userid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetByInstance = (instanceid): Observable<any> => {
        return this._http.get(this.actionUrl + 'byinstance?instanceID=' + instanceid, this.options)
            .pipe(catchError(this.handleError));
    }

}