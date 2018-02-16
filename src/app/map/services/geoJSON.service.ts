import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { RequestOptions } from '@angular/http';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../../../_api/api.constants';
import { MyCubeField } from '../../../_models/layer.model'
 
@Injectable()
export class geoJSONService {
    protected options: any;
    protected token: string;
    private actionUrl = this.configuration.serverWithApiUrl + 'geoJSON/';
 
    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        try {
            this.token = JSON.parse(localStorage.getItem('currentUser')).token
        } catch(err) {
            console.error("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n"+err)
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
 
    public GetAll = (layerID: number): Observable<GeoJSON.GeoJsonObject> => {       
        return this._http.get(this.actionUrl + 'all?table=' + layerID, this.options)
            .pipe(catchError(this.handleError));
    }
 
    public GetSingle = (id: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id, this.options)
            .pipe(catchError(this.handleError));
    }
    
    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .pipe(catchError(this.handleError));
    }
 
    public Create = (layerName: string, fields: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'create?table=' + layerName, this.options)
            .pipe(catchError(this.handleError));
    }
 
    public Update = (itemToUpdate: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), this.options)
            .pipe(catchError(this.handleError));
    }
 
    public Delete = (id: number): Observable<Response> => {
        return this._http.delete(this.actionUrl + 'delete?ID=' + id, this.options)
            .pipe(catchError(this.handleError));
    }

    public addColumn = (table: string, field: MyCubeField): Observable<any> => {
        return this._http.get(this.actionUrl + 'addColumn?table=' + table + '&field=' + field.field + '&type=' + field.type, this.options)
            .pipe(catchError(this.handleError));
    }

    public deleteTable = (table: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'deleteTable?table=' + table, this.options)
            .pipe(catchError(this.handleError));
    }
 
    public updateGeometry(table: number, json2: JSON): Observable<any> {
        let id = JSON.stringify(json2['id'])
        return this._http.get(this.actionUrl + 'updateGeometry?table=' + table + '&geometry=' + JSON.stringify(json2['geometry']) + '&id=' + id, this.options)
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