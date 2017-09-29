import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { UserPage } from '../_models/user.model';
 
@Injectable()
export class UserPageService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;
    
    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'userpage/';
    }
 
    public GetSome = (userid): Observable<UserPage[]> => {
        return this._http.get(this.actionUrl + 'list?userID=' + userid)
            .map((response: Response) => <UserPage[]>response.json())
            .catch(this.handleError);
    }
    public GetDefault = (userid): Observable<UserPage[]> => {
        return this._http.get(this.actionUrl + 'default?userID=' + userid)
            .map((response: Response) => <UserPage[]>response.json())
            .catch(this.handleError);
    }
}