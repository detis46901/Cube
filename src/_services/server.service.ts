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
        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <Server[]>response.json())
//            .catch(this.handleError);
    }
 
    public GetOne = (id: number): Observable<Server> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id)
            .map((response: Response) => <Server>response.json())
//            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<Server> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <Server>response.json())
//            .catch(this.handleError);
    }
 
    public Add = (server: Server): Observable<Server> => {
        return this._http.post(this.actionUrl + 'create', JSON.stringify(server), { headers: this.headers })
            .map((response: Response) => <Server>response.json())
 //           .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: Server): Observable<Server> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <Server>response.json())
 //           .catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<Response> => {
        return this._http.delete(this.actionUrl + 'delete?rowID=' + id)
 //           .catch(this.handleError);
    }

    public getCapabilities(serv: Server, options) {
        let actionURL: string = serv.serverURL + '/wms?request=getCapabilities&service=WMS'


        /*fetch(this.actionUrl).then(function(response) {
            if(response.ok) {
                return this._http.get(actionURL, options)
                    .map((response: Response) => response.text())
            }
            throw new Error('Requested resource could not complete.\nPlease ensure the following URL is correct.\n' + actionURL)
        }).then(function(url) {

        })*/
        
        return this._http.get(actionURL, options)
            .map((response: Response) => response.text())
      
    }
 
    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}