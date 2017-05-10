import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { User } from '../../_models/user-model';
import { Configuration } from '../../_api/api.constants';
 
@Injectable()
export class DataService {
 
    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private _configuration: Configuration) {
 
        this.actionUrl = _configuration.ServerWithApiUrl + 'users/one?rowid=';
 
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<User[]> => {
        return this._http.get(this.actionUrl)
            .map((response: Response) => <User[]>response.json())
            .catch(this.handleError);
    }
 
    public GetSingle = (id: number): Observable<User> => {
        return this._http.get(this.actionUrl + id)
            .map((response: Response) => <User>response.json())
            .catch(this.handleError);
    }
 
    public Add = (itemName: string): Observable<User> => {
        let toAdd = JSON.stringify({ ItemName: itemName });
 
        return this._http.post(this.actionUrl, toAdd, { headers: this.headers })
            .map((response: Response) => <User>response.json())
            .catch(this.handleError);
    }
 
    public Update = (id: number, itemToUpdate: User): Observable<User> => {
        return this._http.put(this.actionUrl + id, JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <User>response.json())
            .catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<Response> => {
        return this._http.delete(this.actionUrl + id)
            .catch(this.handleError);
    }
 
    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}