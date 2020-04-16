
import {throwError as observableThrowError,  Observable } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { MyCubeField, MyCubeComment } from '../_models/layer.model';
import { LogFormConfig, LogField} from '../app/shared.components/data-component/data-form.model'
import { environment } from 'environments/environment'

@Injectable()
export class SQLService {
    protected headers: Headers;
    private actionUrl = environment.apiUrl + environment.apiUrlPath + 'sql/';
    protected token: string;
    protected options;

    constructor(protected _http: HttpClient) {
    }

    public getOptions() {
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
        return this.options
    }
    public GetAll = (): Observable<any> => {
        return this._http.get(this.actionUrl + 'list', this.getOptions()).pipe(
            catchError(this.handleError));
    }

    public GetSchema = (schema: string, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + "getschema?schema=" + schema + "&table=" + id, this.getOptions()).pipe(
            catchError(this.handleError));
    }

    public GetSingle = (table: string, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'single?table=' + table + '&id=' + id, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public GetAnySingle = (schema: string, table: string, field: string, value: string | number): Observable<any> => {
        return this._http.get(this.actionUrl + 'anyone?schema=' + schema + '&table=' + table + '&field=' + field + '&value=' + value, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public Create = (layerName: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'create?table=' + layerName, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public getConstraints = (schema: string, table: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'constraints?schema=' + schema + '&table=' + table, this.getOptions())
    }

    public updateConstraint = (schema: string, table, mcf:MyCubeField): Observable<any> => {
        console.log(mcf)
        console.log(this.actionUrl + 'updateconstraint?schema=' + schema + '&table' + table + 'myCubeField=' + JSON.stringify(mcf), this.getOptions())
        return this._http.get(this.actionUrl + 'updateconstraint?schema=' + schema + '&table=' + table + '&myCubeField=' + JSON.stringify(mcf), this.getOptions())
    }

    public CreateCommentTable = (layerName: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'createcommenttable?table=' + layerName, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public getComments = (table: number, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'getcomments?table=' + table + '&id=' + id, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public getSingleLog = (schema: number, table: number, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'singlelog?schema=' + schema + '&table=' + table + '&id=' + id, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
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

    public addAnyImage = (formdata:FormData): Observable<any> => {
        const HttpUploadOptions = {
            headers: new HttpHeaders({
            //"Content-Type": "multipart/form-data",
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + this.token,
               }), reportProgress: true
          }
        console.log(formdata)
        return this._http.post(this.actionUrl + 'addanyimage',formdata, HttpUploadOptions)
            .pipe(catchError(this.handleError));
    }

    // public addCommentWithGeom = (comment:MyCubeComment): Observable<any> => {
    //     return this._http.post(this.actionUrl + 'addanycommentwithoutgeom',JSON.stringify(comment), this.getOptions())
    //         .pipe(catchError(this.handleError));
    // }

    // public addCommentWithoutGeom = (comment:MyCubeComment): Observable<any> => {
    //     return this._http.post(this.actionUrl + 'addcommentwithoutgeom',JSON.stringify(comment), this.getOptions())
    //         .pipe(catchError(this.handleError));
    // }

    public addAnyComment = (logField:LogField): Observable<any> => {
        return this._http.post(this.actionUrl + 'addanycommentwithoutgeom',JSON.stringify(logField), this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public setSRID = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'setSRID?table=' + table, this.getOptions())
    }

    public addRecord = (table: number, geometry: JSON): Observable<any> => {
        return this._http.get(this.actionUrl + 'addRecord?table=' + table + '&geometry=' + JSON.stringify(geometry['geometry']), this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError))
    }

    public addAnyRecord = (schema: string, table: string, field: string, value: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'addAnyRecord?schema=' + schema + '&table=' + table + '&field=' + field + '&value=' + value, this.getOptions())
    }

    public fixGeometry = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'fixGeometry?table=' + table, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError))
    }

    public Update = (table: number, id: string, MyCubeField: MyCubeField): Observable<any> => {
        // console.log(JSON.stringify(MyCubeField))
        // console.log(this.actionUrl + 'update', '{"table":' + table + ',"id":' + id + ',"mycubefield":' + JSON.stringify(MyCubeField) + '}')
        return this._http.put(this.actionUrl + 'update', '{"table":' + table + ',"id":' + id + ',"mycubefield":' + JSON.stringify(MyCubeField) + '}', this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public UpdateAnyRecord = (schema: string, table: string, id: string, MyCubeField: MyCubeField): Observable<any> => {
        // console.log(JSON.stringify(MyCubeField))
        return this._http.put(this.actionUrl + 'updateAnyRecord', '{"schema":"' + schema + '","table":"' + table + '","id":' + id + ',"mycubefield":' + JSON.stringify(MyCubeField) + '}', this.getOptions())
            // .map((response: Response) => <any>response.json())
            //.catch(this.handleError);
    }

    public Delete = (table: number, id: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteRecord?table=' + table + '&id=' + id, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public deleteAnyRecord = (schema: string, table: string, id: any): Observable<any> => {
        console.log(this.actionUrl + 'deleteAnyRecord?schema=' + schema + '&table=' + table + '&id=' + id)
        return this._http.get(this.actionUrl + 'deleteAnyRecord?schema=' + schema + '&table=' + table + '&id=' + id, this.getOptions()).pipe(
            // .map((response: Response) => <any>response.json())
            catchError(this.handleError));
    }

    public addColumn = (table: number, myCubeField: MyCubeField): Observable<any> => {
        // console.log(field)
        return this._http.get(this.actionUrl + 'addColumn?table=' + table + '&myCubeField=' + JSON.stringify(myCubeField), this.getOptions()).pipe(
            catchError(this.handleError))
    }

    public deleteColumn = (table: number, myCubeField: MyCubeField): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteColumn?table=' + table + '&myCubeField=' + JSON.stringify(myCubeField), this.getOptions()).pipe(
            catchError(this.handleError))
    }

    public moveColumn = (table: number, myCubeField: MyCubeField): Observable<any> => {
        return this._http.get(this.actionUrl + 'moveColumn?table=' + table + '&myCubeField=' + JSON.stringify(myCubeField), this.getOptions()).pipe(
            catchError(this.handleError))
    }

    public deleteTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteTable?table=' + table, this.getOptions())
    }

    public deleteCommentTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deletecommenttable?table=' + table, this.getOptions())
    }

    public deleteComment = (table: number, id: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deletecomment?table=' + table + "&id=" + id, this.getOptions())
    }

    public getOID = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'getOID?table=' + table, this.getOptions())
    }

    public getColumnCount = (table: number): Observable<any> => {
        //console.log(this.actionUrl + 'getColumnCount?table=' + table)
        return this._http.get(this.actionUrl + 'getColumnCount?table=' + table, this.getOptions())
    }

    public getIsLabel = (oid: number, field: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'getIsLabel?oid=' + oid + "&field=" + field, this.getOptions())
    }

    protected handleError(error: Response) {
        console.error('this is an error: ' + error.text);
        return observableThrowError(error || 'any error');
    }

}
