import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Configuration } from '../_api/api.constants';
import { RequestOptions, Headers } from '@angular/http';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';

 
@Injectable()
export class NotificationService {
    private actionUrl: string;
    public options: any;
    private token: string;
    private userID: number;
    private headers;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        this.headers = new Headers();
        try {
            this.token = JSON.parse(localStorage.getItem('currentUser')).token
        } catch(err) {
            console.log("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n"+err)
        }

        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        //this.headers.append('Authorization', 'Bearer ' + this.token);
        this.headers.append('Access-Control-Allow-Origin', '*');
        this.options = new RequestOptions({headers: this.headers})
        this.actionUrl = this.configuration.serverWithApiUrl + 'notification/';
    }

    public GetByUser = (userID): Observable<Notification[]> => {
        return this._http.get<Notification[]>(this.actionUrl + 'getbyuser?userID=' + userID, this.options)
            .pipe(catchError(this.handleError));
    }

    public openNotifications(id) {
        this.userID = id;
        console.log("notif-service")
    }

    private handleError(error: HttpErrorResponse) {
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