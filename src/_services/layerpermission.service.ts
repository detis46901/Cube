import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { LayerPermission } from '../_models/layer.model';
import { Configuration } from '../_api/api.constants';
 
@Injectable()
export class LayerPermissionService {
 
    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private _configuration: Configuration) {
 
        this.actionUrl = _configuration.ServerWithApiUrl + 'layerpermission/';
 
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<LayerPermission[]> => {
        console.log(this.actionUrl)
        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <LayerPermission[]>response.json())
//            .catch(this.handleError);
    }

    public GetSome = (layerid): Observable<LayerPermission[]> => {
        console.log(this.actionUrl + 'list?layerID=' + layerid)
        return this._http.get(this.actionUrl + 'list?layerID=' + layerid)
            .map((response: Response) => <LayerPermission[]>response.json())
//            .catch(this.handleError);
    }

    public GetUserLayer = (userid): Observable<LayerPermission[]> => {
        console.log(this.actionUrl + 'userlist?userid=' + userid)
        return this._http.get(this.actionUrl + 'userlist?userid=' + userid)
            .map((response: Response) => <LayerPermission[]>response.json())
//            .catch(this.handleError);
    }
 
    public GetSingle = (id: number): Observable<LayerPermission> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id)
            .map((response: Response) => <LayerPermission>response.json())
//            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<LayerPermission> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <LayerPermission>response.json())
//            .catch(this.handleError);
    }
 
    public Add = (LayerPermission: LayerPermission): Observable<LayerPermission> => {
        let toAdd = JSON.stringify(LayerPermission);
        console.log('LayerPermission.service ' + toAdd)
        return this._http.post(this.actionUrl + 'create', toAdd, { headers: this.headers })
            .map((response: Response) => <LayerPermission>response.json())
 //           .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: LayerPermission): Observable<LayerPermission> => {
        return this._http.put(this.actionUrl + '/update', JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <LayerPermission>response.json())
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