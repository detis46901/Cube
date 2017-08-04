import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { UserPageLayer } from '../_models/layer.model';
import { Configuration } from '../_api/api.constants';
 
@Injectable()
export class UserPageLayerService {
 
    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private _configuration: Configuration) {
 
        this.actionUrl = _configuration.ServerWithApiUrl + 'userpagelayer/';
 
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<UserPageLayer[]> => {
//        console.log(this.actionUrl)
        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <UserPageLayer[]>response.json())
//            .catch(this.handleError);
    }

    public GetSome = (pageid): Observable<UserPageLayer[]> => {
//        console.log(this.actionUrl + 'list?pageID=' + pageid)
        return this._http.get(this.actionUrl + 'list?pageID=' + pageid)
            .map((response: Response) => <UserPageLayer[]>response.json())
//            .catch(this.handleError);
    }

    public GetPageLayers = (pageid): Observable<UserPageLayer[]> => {
//        console.log(this.actionUrl + 'getpagelayers?pageID=' + pageid)
        console.log(this.actionUrl + 'getpagelayers?pageID=' + pageid)
        return this._http.get(this.actionUrl + 'getpagelayers?pageID=' + pageid)
            .map((response: Response) => <UserPageLayer[]>response.json())
//            .catch(this.handleError);
    }

    public GetUserLayer = (userid): Observable<UserPageLayer[]> => {
//        console.log(this.actionUrl + 'userlist?userid=' + userid)
        return this._http.get(this.actionUrl + 'userlist?userid=' + userid)
            .map((response: Response) => <UserPageLayer[]>response.json())
//            .catch(this.handleError);
    }
 
    public GetSingle = (id: number): Observable<UserPageLayer> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id)
            .map((response: Response) => <UserPageLayer>response.json())
//            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<UserPageLayer> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <UserPageLayer>response.json())
//            .catch(this.handleError);
    }
 
    public Add = (UserPageLayer: UserPageLayer): Observable<UserPageLayer> => {
        let toAdd = JSON.stringify(UserPageLayer);
        console.log('UserPageLayer.service ' + toAdd)
        return this._http.post(this.actionUrl + 'create', toAdd, { headers: this.headers })
            .map((response: Response) => <UserPageLayer>response.json())
 //           .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: UserPageLayer): Observable<UserPageLayer> => {
        return this._http.put(this.actionUrl + '/update', JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <UserPageLayer>response.json())
 //           .catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<Response> => {
        return this._http.delete(this.actionUrl + 'delete?ID=' + id)
 //           .catch(this.handleError);
    }
 
    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}