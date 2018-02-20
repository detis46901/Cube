import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { MyCubeField } from '../_models/layer.model';
 
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
            console.log("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n"+err)
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
        return this._http.get(this.actionUrl + 'getschema?table=' + id, this.options)
            .map((response: Response) => <MyCubeField[]>response.json()[0])
            .catch(this.handleError);
    }
 
    public GetSingle = (table: number, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?table=' + table + '&id=' + id, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Create = (layerName: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'create?table=' + layerName, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public CreateCommentTable = (layerName: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'createcommenttable?table=' + layerName, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public getComments = (table: number, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'getcomments?table=' + table + '&id=' + id, this.options)
        .map((response: Response) => <any>response.json())
        .catch(this.handleError);
    }

    public addComment = (table: number, featureID: number, comment: string, userID: number): Observable<any> => {
        console.log(this.actionUrl + 'addcomment?table=' + table + '&featureID=' + featureID + '&comment=' + comment + '&userID=' + userID)
        return this._http.get(this.actionUrl + 'addcomment?table=' + table + '&featureID=' + featureID + '&comment=' + comment + '&userID=' + userID, this.options)
        .map((response: Response) => <any>response.json())
        .catch(this.handleError);
    }

    public setSRID = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'setSRID?table=' + table, this.options)
    }
    
    public addRecord = (table: number, geometry: JSON): Observable<any> => {
        return this._http.get(this.actionUrl + 'addRecord?table=' + table + '&geometry=' + JSON.stringify(geometry['geometry']), this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError)
    }
    public Update = (table: number, id: string, field: string, type: string, value: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'update?table=' + table + "&id=" + id + "&field=" + field + "&type=" + type + "&value=" + value, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }
 
    public Delete = (table: number, id: any): Observable<Response> => {
        return this._http.get(this.actionUrl + 'deleteRecord?table=' + table + '&id=' + id, this.options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public addColumn = (table: number, field: MyCubeField): Observable<any> => {
        return this._http.get(this.actionUrl + 'addColumn?table=' + table + '&field=' + field.field + '&type=' + field.type + '&label=' + field.label, this.options)
            .catch(this.handleError)
    }

    public deleteTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteTable?table=' + table, this.options)
    }

    public deleteCommentTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deletecommenttable?table=' + table, this.options)
    }

    public deleteComment = (table: number, id: number): Observable<Response> => {
        return this._http.get(this.actionUrl + 'deletecomment?table=' + table + "&id=" + id, this.options)
    }

    public getOID = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'getOID?table=' + table, this.options)
    }

    public getColumnCount = (table: number): Observable<any> => {
        //console.log(this.actionUrl + 'getColumnCount?table=' + table)
        return this._http.get(this.actionUrl + 'getColumnCount?table=' + table, this.options)
    }

    public getIsLabel = (oid: number, field: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'getIsLabel?oid=' + oid + "&field=" + field, this.options)
    }
 
    protected handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'any error');
    }
}