import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { RequestOptions } from '@angular/http';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';
import { MyCubeField } from '../_models/layer.model'
 
@Injectable()
export class SQLService {
    private actionUrl = this.configuration.serverWithApiUrl + 'sql/';
    protected token: string;
    protected options: any;
 
    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        try {
            this.token = JSON.parse(localStorage.getItem('currentUser')).token
        } catch(err) {
            console.log("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n"+err)
        }

        this.options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.token,
                'Access-Control-Allow-Origin': '*'
            })
        }
    }
 
    public GetAll = (): Observable<any[]> => {           
        return this._http.get(this.actionUrl + 'list', this.options)
            .pipe(catchError(this.handleError));
    }

    public GetSchema = (id:number): Observable<MyCubeField[]> => {        
        return this._http.get(this.actionUrl + 'getschema?table=' + id, this.options)
            .pipe(catchError(this.handleError));
    }
 
    public GetSingle = (table: number, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?table=' + table + '&id=' + id, this.options)
            .pipe(catchError(this.handleError));
    }
    
    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email, this.options)
            .pipe(catchError(this.handleError));
    }
 
    public Create = (layerName: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'create?table=' + layerName, this.options)
            .pipe(catchError(this.handleError));
    }

    public CreateCommentTable = (layerName: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'createcommenttable?table=' + layerName, this.options)
            .pipe(catchError(this.handleError));
    }
 
    public getComments = (table: number, id: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'getcomments?table=' + table + '&id=' + id, this.options)
            .pipe(catchError(this.handleError));
    }

    public addComment = (table: number, featureID: number, comment: string, userID: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'addcomment?table=' + table + '&featureID=' + featureID + '&comment=' + comment + '&userID=' + userID, this.options)
            .pipe(catchError(this.handleError));
    }

    public setSRID = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'setSRID?table=' + table, this.options)
    }
    
    public addRecord = (table: number, geometry: JSON): Observable<any> => {
        return this._http.get(this.actionUrl + 'addRecord?table=' + table + '&geometry=' + JSON.stringify(geometry['geometry']), this.options)
            .pipe(catchError(this.handleError));
    }
    public Update = (table: number, id: string, field: string, type: string, value: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'update?table=' + table + "&id=" + id + "&field=" + field + "&type=" + type + "&value=" + value, this.options)
            .pipe(catchError(this.handleError));
    }
 
    public Delete = (table: number, id: any): Observable<Response> => {
        return this._http.get(this.actionUrl + 'deleteRecord?table=' + table + '&id=' + id, this.options)
            .pipe(catchError(this.handleError));
    }

    public addColumn = (table: number, field: MyCubeField): Observable<any> => {
        return this._http.get(this.actionUrl + 'addColumn?table=' + table + '&field=' + field.field + '&type=' + field.type + '&label=' + field.label, this.options)
        .pipe(catchError(this.handleError));
    }

    public deleteTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteTable?table=' + table, this.options)
            .pipe(catchError(this.handleError));
    }

    public deleteCommentTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deletecommenttable?table=' + table, this.options)
            .pipe(catchError(this.handleError));
    }

    public deleteComment = (table: number, id: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deletecomment?table=' + table + "&id=" + id, this.options)
            .pipe(catchError(this.handleError));
    }

    public getOID = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'getOID?table=' + table, this.options)
            .pipe(catchError(this.handleError));
    }

    public getColumnCount = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'getColumnCount?table=' + table, this.options)
            .pipe(catchError(this.handleError));
    }

    public getIsLabel = (oid: number, field: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'getIsLabel?oid=' + oid + "&field=" + field, this.options)
            .pipe(catchError(this.handleError));
    }

    protected handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
              `Backend returned code ${error.status}, ` +
              `body was: ${error.error}`);
        }
        // return an ErrorObservable with a user-facing error message
        return new ErrorObservable('Something bad happened; please try again later.');
    }
}