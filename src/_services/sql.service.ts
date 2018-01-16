import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { MyCubeField } from '../_models/layer.model'
 
@Injectable()
export class SQLService {
    protected headers: Headers;
    private actionUrl = this.configuration.serverWithApiUrl + 'sql/';
    protected token: string;
    protected options: RequestOptions;
 
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

    public GetSchema = (id:number): Observable<MyCubeField[]> => {
        console.log(this.actionUrl + 'getschema?table=' + id)           
        return this._http.get(this.actionUrl + 'getschema?table=' + id, this.options)
            .map((response: Response) => <MyCubeField[]>response.json()[0])
            .catch(this.handleError);
    }
 
    public GetSingle = (table: number, id: string): Observable<any> => {
        console.log(this.actionUrl + 'one?table=' + table + '&id=' + id)
        return this._http.get(this.actionUrl + 'one?table=' + table + '&id=' + id, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Create = (layerName: string, fields: any): Observable<any> => {
        console.log('Creating a table.' + layerName)
        console.log(this.actionUrl + 'create', layerName, {headers: this.headers})
        return this._http.get(this.actionUrl + 'create?table=' + layerName, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public addRecord = (table: number, geometry: JSON): Observable<any> => {
        console.log(this.actionUrl + 'addRecord?table=' + table + '&geometry="' + JSON.stringify(geometry['geometry']))
        return this._http.get(this.actionUrl + 'addRecord?table=' + table + '&geometry=' + JSON.stringify(geometry['geometry']))
            .map((response: Response) => <any>response.json())
            .catch(this.handleError)
    }
    public Update = (table: number, id: string, field: string, type: string, value: any): Observable<any> => {
        console.log(this.actionUrl + 'update?table=' + table + "&id=" + id + "&field=" + field + "&type=" + type + "&value=" + value)
        return this._http.get(this.actionUrl + 'update?table=' + table + "&id=" + id + "&field=" + field + "&type=" + type + "&value=" + value, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Delete = (table: number, id: string): Observable<Response> => {
        console.log(this.actionUrl + 'delete?table=' + table + '&id=' + id)
        return this._http.delete(this.actionUrl + 'delete?table=' + table + '&id=' + id, this.options)
            .catch(this.handleError);
    }

    public addColumn = (table: string, field: MyCubeField): Observable<any> => {
        console.log(this.actionUrl + 'addColumn?table=' + table + '&field=' + field.field + '&type=' + field.type)
        return this._http.get(this.actionUrl + 'addColumn?table=' + table + '&field=' + field.field + '&type=' + field.type, this.options)
            .catch(this.handleError)
    }

    public deleteTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteTable?table=' + table, this.options)
    }
 
    protected handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'any error');
    }
}