import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { UserPage } from '../_models/user.model';
 
@Injectable()
export class UserPageService extends ParentService {
    protected actionUrl: string;
    
    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'userpage/';
    }
 
    public GetSome = (userid): Observable<UserPage[]> => {
        return this._http.get(this.actionUrl + 'list?userID=' + userid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetActiveByUserID = (userid): Observable<UserPage[]> => {
        return this._http.get(this.actionUrl + 'getactivebyuserid?userID=' + userid, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetDefault = (userid): Observable<UserPage[]> => {
        return this._http.get(this.actionUrl + 'default?userID=' + userid, this.options)
            .pipe(catchError(this.handleError));
    }

    public UpdateMultiple = (items: UserPage[]): Observable<UserPage[]> => {
        return this._http.put(this.actionUrl + 'updatemulti', JSON.stringify(items), this.options)
            .pipe(catchError(this.handleError));   
    }
}