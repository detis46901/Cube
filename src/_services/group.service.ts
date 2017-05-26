import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { Group } from '../_models/organization.model';
import { Configuration } from '../_api/api.constants';
 
@Injectable()
export class GroupService {
 
    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private _configuration: Configuration) {
 
        this.actionUrl = _configuration.ServerWithApiUrl + 'group/';
 
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<Group[]> => {
        console.log(this.actionUrl)
        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <Group[]>response.json())
//            .catch(this.handleError);
    }
 
    public GetSome = (deptid): Observable<Group[]> => {
        console.log(this.actionUrl + 'list?departmentID=' + deptid)
        return this._http.get(this.actionUrl + 'list?departmentID=' + deptid)
            .map((response: Response) => <Group[]>response.json())
//            .catch(this.handleError);
    }

    public GetSingle = (id: number): Observable<Group> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id)
            .map((response: Response) => <Group>response.json())
//            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<Group> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <Group>response.json())
//            .catch(this.handleError);
    }
 
    public Add = (group: Group): Observable<Group> => {
        let toAdd = JSON.stringify(group);
        console.log('toAdd=' + toAdd)
        return this._http.post(this.actionUrl + 'create', toAdd, { headers: this.headers })
            .map((response: Response) => <Group>response.json())
//            .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: Group): Observable<Group> => {
        return this._http.put(this.actionUrl + '/update', JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <Group>response.json())
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