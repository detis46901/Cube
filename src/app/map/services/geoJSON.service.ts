import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../../../_api/api.constants';
import { MyCubeField } from '../../../_models/layer.model'
 
@Injectable()
export class geoJSONService {
    protected headers: Headers;
    protected options: RequestOptions;
    protected token: string;
    private actionUrl = this.configuration.serverWithApiUrl + 'geoJSON/';
 
    constructor(protected _http: Http, protected configuration: Configuration) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + this.token);
        this.headers.append('Access-Control-Allow-Origin', '*');
        this.options = new RequestOptions({headers: this.headers})
    }
 
    public GetAll = (layerID: number): Observable<GeoJSON.GeoJsonObject> => {           
        let ob = this._http.get(this.actionUrl + 'all?table=' + layerID, this.options)
            .map((response: Response) => <GeoJSON.GeoJsonObject[]>response.json())
            .catch(this.handleError);
        return ob
    }
 
    public GetSingle = (id: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id, this.options)
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
        return this._http.get(this.actionUrl + 'create?table=' + layerName, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Update = (itemToUpdate: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<Response> => {
        console.log(this.actionUrl + 'delete?ID=' + id)
        return this._http.delete(this.actionUrl + 'delete?ID=' + id, this.options)
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
 
    public updateGeometry(table: number, json2: JSON): Observable<any> {
        let id = JSON.stringify(json2['id']).slice(1,JSON.stringify(json2['id']).length-1)
        console.log(this.actionUrl + 'updateGeometry?table=' + table + '&geometry="' + JSON.stringify(json2['geometry']) + '"&id=' + id, this.options)
        return this._http.get(this.actionUrl + 'updateGeometry?table=' + table + '&geometry=' + JSON.stringify(json2['geometry']) + '&id=' + id, this.options)
        .map((response: Response) => <any>response.json())
        //console.log(json2['geometry'])
    }

    protected handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'any error');
    }
}