//The "_" in the files in this directory denotes a service that inherits from this parent service.

import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
 
@Injectable()
export class ParentService {
    protected actionUrl: string;
    protected headers: Headers;
    protected options: RequestOptions;
    protected token: string;
 
    constructor(protected _http: Http, protected configuration: Configuration) {
        this.headers = new Headers();
        try {
            this.token = JSON.parse(localStorage.getItem('currentUser')).token
        } catch(err) {
            console.log("Could not authenticate user.\n"+err)
        }
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + this.token);
        this.headers.append('Access-Control-Allow-Origin', '*');
        this.options = new RequestOptions({headers: this.headers})
    }
 
    public GetAll = (): Observable<any[]> => {           
        return this._http.get(this.actionUrl + 'list', this.options)
            .map((response: Response) => <any[]>response.json())
            .catch(this.handleError);
    }
 
    public GetSingle = (id: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email /*+API key 12/27/17*/, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public Add = (toAdd: any): Observable<any> => {
        console.log('adding a record.  Add to=' + JSON.stringify(toAdd))
        console.log(this.actionUrl + 'create', JSON.stringify(toAdd), {headers: this.headers})
        return this._http.post(this.actionUrl + 'create', JSON.stringify(toAdd), this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<any> => {
        console.log(this.actionUrl + 'delete?ID=' + id)
        return this._http.delete(this.actionUrl + 'delete?ID=' + id, this.options)
            .catch(this.handleError);
    }
 
    protected handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'any error');
    }
}