//Parent Service: most services inherit methods from this file.
//The "_" in the files in this directory denotes a service that inherits from this parent service.

import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';

@Injectable()
export class ParentService {
    protected actionUrl: string;
    public options: any;
    protected token: string;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
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

    public GetAll = (): Observable<any[]> => {
        return this._http.get<any[]>(this.actionUrl + 'list', this.options)
            .pipe(catchError(this.handleError));
    }

    public GetSingle = (id: number): Observable<any> => {
        return this._http.get<any>(this.actionUrl + 'one?rowid=' + id, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get<any>(this.actionUrl + 'one?email=' + email /*+API key 12/27/17*/, this.options)
            .pipe(catchError(this.handleError));
    }

    public Add = (toAdd: any): Observable<any> => {
        console.log("adding: " + this.actionUrl)
        return this._http.post(this.actionUrl + 'create', JSON.stringify(toAdd), this.options)
            .pipe(catchError(this.handleError));
    }

    public Update = (itemToUpdate: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), this.options)
            .pipe(catchError(this.handleError));
    }

    public Delete = (id: number): Observable<any> => {
        return this._http.delete(this.actionUrl + 'delete?ID=' + id, this.options)
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