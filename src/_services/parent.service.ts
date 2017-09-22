import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
 
@Injectable()
export class ParentService {
    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private configuration: Configuration) {
        this.actionUrl = configuration.serverWithApiUrl + 'server/';
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<any[]> => {           
        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <any[]>response.json())
            .catch(this.handleError);
    }
 
    public GetOne = (id: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Add = (toAdd: any): Observable<any> => {
        return this._http.post(this.actionUrl + 'create', JSON.stringify(toAdd), {headers: this.headers})
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), {headers: this.headers})
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<Response> => {
        return this._http.delete(this.actionUrl + 'delete?rowID=' + id)
            .catch(this.handleError);
    }
 
    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'any error');
    }
}