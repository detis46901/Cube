import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { MyCubeField } from '../_models/layer.model'
 
@Injectable()
export class SQLService {
    protected headers: Headers;
    private actionUrl = this.configuration.serverWithApiUrl + 'sql/';
 
    constructor(protected _http: Http, protected configuration: Configuration) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<any[]> => {           
        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <any[]>response.json())
            .catch(this.handleError);
    }

    public GetSchema = (id:number): Observable<MyCubeField[]> => {
        console.log(this.actionUrl + 'getschema?table=' + id)           
        return this._http.get(this.actionUrl + 'getschema?table=' + id)
            .map((response: Response) => <MyCubeField[]>response.json()[0])
            .catch(this.handleError);
    }
 
    public GetSingle = (table: number, id: string): Observable<any> => {
        console.log(this.actionUrl + 'one?table=' + table + '&id=' + id)
        return this._http.get(this.actionUrl + 'one?table=' + table + '&id=' + id)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Create = (layerName: string, fields: any): Observable<any> => {
        console.log('Creating a table.' + layerName)
        console.log(this.actionUrl + 'create', layerName, {headers: this.headers})
        return this._http.get(this.actionUrl + 'create?table=' + layerName)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Update = (table: number, id: string, field: string, type: string, value: any): Observable<any> => {
        console.log(this.actionUrl + 'update?table=' + table + "&id=" + id + "&field=" + field + "&type=" + type + "&value=" + value)
        return this._http.get(this.actionUrl + 'update?table=' + table + "&id=" + id + "&field=" + field + "&type=" + type + "&value=" + value, {headers: this.headers})
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<Response> => {
        console.log(this.actionUrl + 'delete?ID=' + id)
        return this._http.delete(this.actionUrl + 'delete?ID=' + id)
            .catch(this.handleError);
    }

    public addColumn = (table: string, field: MyCubeField): Observable<any> => {
        console.log(this.actionUrl + 'addColumn?table=' + table + '&field=' + field.field + '&type=' + field.type)
        return this._http.get(this.actionUrl + 'addColumn?table=' + table + '&field=' + field.field + '&type=' + field.type)
            .catch(this.handleError)
    }

    public deleteTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteTable?table=' + table)
    }
 
    protected handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'any error');
    }
}