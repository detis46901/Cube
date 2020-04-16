
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParentService } from './_parent.service';
import { environment } from 'environments/environment'

@Injectable()
export class UserPageInstanceService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient) {
        super(_http);
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'userpageinstance/';
    }

    public GetSome = (pageid): Observable<any> => {
        return this._http.get(this.actionUrl + 'list?ID=' + pageid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetPageInstances = (pageid): Observable<any> => {
        return this._http.get(this.actionUrl + 'getpageinstances?pageID=' + pageid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetUserInstances = (userid): Observable<any> => {
        return this._http.get(this.actionUrl + 'userlist?userid=' + userid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetByInstance = (instanceid): Observable<any> => {
        return this._http.get(this.actionUrl + 'byinstance?instanceID=' + instanceid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

}