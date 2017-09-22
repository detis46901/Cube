import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { UserPage } from '../_models/user.model';
import { Configuration } from '../_api/api.constants';
 
@Injectable()
export class UserPageService {
    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private configuration: Configuration) {
        this.actionUrl = configuration.serverWithApiUrl + 'userpage/';
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<UserPage[]> => {
        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <UserPage[]>response.json())
            .catch(this.handleError);
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
    public GetSingle = (id: number): Observable<UserPage> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id)
            .map((response: Response) => <UserPage>response.json())
            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<UserPage> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <UserPage>response.json())
            .catch(this.handleError);
    }
 
    public Add = (UserPage: UserPage): Observable<UserPage> => {
        return this._http.post(this.actionUrl + 'create', JSON.stringify(UserPage), {headers: this.headers})
            .map((response: Response) => <UserPage>response.json())
            .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: UserPage): Observable<UserPage> => {
        return this._http.put(this.actionUrl + '/update', JSON.stringify(itemToUpdate), {headers: this.headers})
            .map((response: Response) => <UserPage>response.json())
            .catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<Response> => {
        return this._http.delete(this.actionUrl + 'delete?rowID=' + id)
            .catch(this.handleError);
    }
 
    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}