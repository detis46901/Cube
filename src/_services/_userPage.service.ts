
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParentService } from './_parent.service';
import { UserPage } from '../_models/user.model';
import { environment } from 'environments/environment'

@Injectable()
export class UserPageService extends ParentService {
    protected actionUrl: string;

    constructor(protected _http: HttpClient) {
        super(_http);
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'userpage/';
    }

    public GetSome = (userid): Observable<any> => {
        return this._http.get(this.actionUrl + 'list?userID=' + userid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetActiveByUserID = (userid): Observable<any> => {
        return this._http.get(this.actionUrl + 'getactivebyuserid?userID=' + userid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetDefault = (userid): Observable<any> => {
        return this._http.get(this.actionUrl + 'default?userID=' + userid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public UpdateMultiple = (items: UserPage[]): Observable<any> => {
        return this._http.put(this.actionUrl + 'updatemulti', JSON.stringify(items), this.getOptions())
            .pipe(catchError(this.handleError));
    }
}