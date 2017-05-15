import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { Department } from '../_models/organization.model';
import { Configuration } from '../_api/api.constants';
 
@Injectable()
export class DepartmentService {
 
    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private _configuration: Configuration) {
 
        this.actionUrl = _configuration.ServerWithApiUrl + 'department/';
 
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<Department[]> => {
        console.log(this.actionUrl)
        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <Department[]>response.json())
//            .catch(this.handleError);
    }
 
    public GetSingle = (id: number): Observable<Department> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id)
            .map((response: Response) => <Department>response.json())
//            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<Department> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <Department>response.json())
//            .catch(this.handleError);
    }
 
    public Add = (department: Department): Observable<Department> => {
        let toAdd = JSON.stringify(department);
        //console.log('department.service ' + toAdd)
        return this._http.post(this.actionUrl + 'create', toAdd, { headers: this.headers })
            .map((response: Response) => <Department>response.json())
 //           .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: Department): Observable<Department> => {
        return this._http.put(this.actionUrl + '/update', JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <Department>response.json())
 //           .catch(this.handleError);
    }
 
    //Add functionality to delete dependents of department here I believe, not sure how yet.
    public Delete = (id: number): Observable<Response> => {
        return this._http.delete(this.actionUrl + 'delete?rowID=' + id)
 //           .catch(this.handleError);
    }
 
    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}