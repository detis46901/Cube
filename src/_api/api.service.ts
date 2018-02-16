import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import { User } from '../_models/user.model';
import { Configuration } from './api.constants';
 
@Injectable()
export class DataService {
    private actionUrl: string;
    private options: any;
    private token: string;
 
    constructor(private _http: HttpClient, private configuration: Configuration) {
        this.actionUrl = configuration.serverWithApiUrl + 'users/one?rowid=';
        this.options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'// need to add token authorization, left out to prevent breaking functionality
            })
        }
    }
 
    public getAll = (): Observable<User[]> => {
        return this._http.get(this.actionUrl, this.options)
            .pipe(catchError(this.handleError));
    }
 
    public getSingle = (id: number): Observable<User> => {
        return this._http.get(this.actionUrl + id)
            .pipe(catchError(this.handleError));
    }
 
    public add = (itemName: string): Observable<User> => {
        const toAdd = JSON.stringify({ ItemName: itemName });
        return this._http.post(this.actionUrl, toAdd, this.options)
            .pipe(catchError(this.handleError));
    }
 
    public update = (id: number, itemToUpdate: User): Observable<User> => {
        return this._http.put(this.actionUrl + id, JSON.stringify(itemToUpdate), this.options)
            .pipe(catchError(this.handleError));
    }
 
    public delete = (id: number): Observable<Response> => {
        return this._http.delete(this.actionUrl + id, this.options)
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