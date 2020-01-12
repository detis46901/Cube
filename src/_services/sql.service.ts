import 'rxjs/add/operator/map';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuration } from '../_api/api.constants';
import { MyCubeField, MyCubeComment } from '../_models/layer.model';

@Injectable()
export class SQLService {
    protected headers: Headers;
    private actionUrl = this.configuration.serverWithApiUrl + 'sql/';
    protected token: string;
    protected options;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        this.headers = new Headers();
        try {
            this.token = JSON.parse(localStorage.getItem('currentUser')).token
        } catch (err) {
            console.log("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n" + err)
        }
        this.options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.token,
                //'Access-Control-Allow-Origin': '*'
            })
        }
    }

    public GetAll = (): Observable<any> => {
        return this._http.get(this.actionUrl + 'list', this.options)
            .catch(this.handleError);
    }

    public GetSchema = (schema: string, id: string): Observable<any> => {
        console.log(schema)
        console.log(id)
        return this._http.get(this.actionUrl + "getschema?schema=" + schema + "&table=" + id, this.options)
            // .map((response: Response) => <MyCubeField[]>response.json()[0])
            .catch(this.handleError);
    }

    public GetSingle = (table: string, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?table=' + table + '&id=' + id, this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public GetAnySingle = (table: string, field: string, value: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'anyone?table=' + table + '&field=' + field + '&value=' + value, this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email, this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public Create = (layerName: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'create?table=' + layerName, this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public getConstraints = (schema: string, table: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'getconstraints?schema=' + schema + '&table=' + table, this.options)
    }
    
    public CreateCommentTable = (layerName: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'createcommenttable?table=' + layerName, this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public getComments = (table: number, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'getcomments?table=' + table + '&id=' + id, this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public addCommentWithGeom = (comment:MyCubeComment): Observable<any> => {
        return this._http.post(this.actionUrl + 'addcommentwithgeom',JSON.stringify(comment), this.options)
            .pipe(catchError(this.handleError));
    }

    public addImage = (formdata:FormData): Observable<any> => {
        const HttpUploadOptions = {
            headers: new HttpHeaders({
            //"Content-Type": "multipart/form-data",
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + this.token,   
               }), reportProgress: true
          }
        console.log(formdata)
        return this._http.post(this.actionUrl + 'addimage',formdata, HttpUploadOptions)
            .pipe(catchError(this.handleError));
    }

    public addCommentWithoutGeom = (comment:MyCubeComment): Observable<any> => {        
        return this._http.post(this.actionUrl + 'addcommentwithoutgeom',JSON.stringify(comment), this.options)
            .pipe(catchError(this.handleError));
    }

    public setSRID = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'setSRID?table=' + table, this.options)
    }

    public addRecord = (table: number, geometry: JSON): Observable<any> => {
        return this._http.get(this.actionUrl + 'addRecord?table=' + table + '&geometry=' + JSON.stringify(geometry['geometry']), this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError)
    }

    public addAnyRecord = (schema: string, table: string, field: string, value: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'addAnyRecord?schema=' + schema + '&table=' + table + '&field=' + field + '&value=' + value, this.options)
    }

    public fixGeometry = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'fixGeometry?table=' + table, this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError)
    }

    public Update = (table: number, id: string, MyCubeField: MyCubeField): Observable<any> => {
        // console.log(JSON.stringify(MyCubeField))
        // console.log(this.actionUrl + 'update', '{"table":' + table + ',"id":' + id + ',"mycubefield":' + JSON.stringify(MyCubeField) + '}')
        return this._http.put(this.actionUrl + 'update', '{"table":' + table + ',"id":' + id + ',"mycubefield":' + JSON.stringify(MyCubeField) + '}', this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public UpdateAnyRecord = (schema: string, table: string, id: string, MyCubeField: MyCubeField): Observable<any> => {
        // console.log(JSON.stringify(MyCubeField))
        console.log(this.actionUrl + 'updateAnyRecord', '{"schema":"' + schema + '","table":"' + table + '","id":' + id + ',"mycubefield":' + JSON.stringify(MyCubeField) + '}')
        return this._http.put(this.actionUrl + 'updateAnyRecord', '{"schema":"' + schema + '","table":"' + table + '","id":' + id + ',"mycubefield":' + JSON.stringify(MyCubeField) + '}', this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public Delete = (table: number, id: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteRecord?table=' + table + '&id=' + id, this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public deleteAnyRecord = (schema: string, table: string, id: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteAnyRecord?schema=' + schema + '&table=' + table + '&id=' + id, this.options)
            // .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    public addColumn = (table: number, field: MyCubeField): Observable<any> => {
        // console.log(field)
        return this._http.get(this.actionUrl + 'addColumn?table=' + table + '&field=' + field.field + '&type=' + field.type + '&label=' + field.label, this.options)
            .catch(this.handleError)
    }

    public deleteTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteTable?table=' + table, this.options)
    }

    public deleteCommentTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deletecommenttable?table=' + table, this.options)
    }

    public deleteComment = (table: number, id: number): Observable<any> => {
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
        console.error('this is an error: ' + error.text);
        return Observable.throw(error.json().error || 'any error');
    }

}