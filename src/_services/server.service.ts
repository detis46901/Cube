import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { Server } from '../_models/server.model';
import { Configuration } from '../_api/api.constants';
 
@Injectable()
export class ServerService {
 
    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private _configuration: Configuration) {
 
        this.actionUrl = _configuration.ServerWithApiUrl + 'server/';
 
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<Server[]> => {
        console.log(this.actionUrl + 'list')
        console.log(this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <Server[]>response.json()))
            
        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <Server[]>response.json())
//            .catch(this.handleError);
    }
 
    public GetSingle = (id: number): Observable<Server> => {
        console.log(this.actionUrl + 'one?rowid=' + id)

        return this._http.get(this.actionUrl + 'one?rowid=' + id)
            .map((response: Response) => <Server>response.json())
//            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<Server> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <Server>response.json())
//            .catch(this.handleError);
    }
 
    public Add = (Server: Server): Observable<Server> => {
        let toAdd = JSON.stringify(Server);
        console.log('Server.service ' + toAdd)
        return this._http.post(this.actionUrl + 'create', toAdd, { headers: this.headers })
            .map((response: Response) => <Server>response.json())
 //           .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: Server): Observable<Server> => {
        console.log(this._http.put(this.actionUrl + '/update', JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <Server>response.json()))
        return this._http.put(this.actionUrl + '/update', JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <Server>response.json())
 //           .catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<Response> => {
        return this._http.delete(this.actionUrl + 'delete?rowID=' + id)
 //           .catch(this.handleError);
    }
 
    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}