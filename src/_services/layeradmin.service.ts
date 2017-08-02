import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { LayerAdmin } from '../_models/layer.model';
import { Configuration } from '../_api/api.constants';
 
@Injectable()
export class LayerAdminService {
 
    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private _configuration: Configuration) {
 
        this.actionUrl = _configuration.ServerWithApiUrl + 'LayerAdmin/';
 
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<LayerAdmin[]> => {            
        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <LayerAdmin[]>response.json())
//            .catch(this.handleError);
    }
 
    public GetSingle = (id: number): Observable<LayerAdmin> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id)
            .map((response: Response) => <LayerAdmin>response.json())
//            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<LayerAdmin> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <LayerAdmin>response.json())
//            .catch(this.handleError);
    }
 
    public Add = (LayerAdmin: LayerAdmin): Observable<LayerAdmin> => {
        return this._http.post(this.actionUrl + 'create', JSON.stringify(LayerAdmin), { headers: this.headers })
            .map((response: Response) => <LayerAdmin>response.json())
 //           .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: LayerAdmin): Observable<LayerAdmin> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <LayerAdmin>response.json())
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