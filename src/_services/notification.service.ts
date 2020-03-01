import { Injectable } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Configuration } from '../_api/api.constants';
import { catchError } from 'rxjs/operators';
import { Notif } from '../_models/user.model';


@Injectable()
export class NotifService {
    private actionUrl: string;
    public options: any;
    private token: string;
    private userID: number;
    private headers;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        this.headers = new HttpHeaders();
        try {
            this.token = JSON.parse(localStorage.getItem('currentUser')).token
        } catch (err) {
            console.log("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n" + err)
        }

        // this.headers.append('Authorization', 'Bearer ' + this.token);
        // this.options = new RequestOptions({headers: this.headers})
        this.actionUrl = this.configuration.serverWithApiUrl + 'notification/';

        this.options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.token
            })
        }
    }

    public GetByUser = (userID): Observable<any> => {
        return this._http.get(this.actionUrl + 'byuser?userID=' + userID, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetByType = (type): Observable<any> => {
        return this._http.get(this.actionUrl + 'bytype?objectType=' + type, this.options)
            .pipe(catchError(this.handleError));
    }

    public GetBySource = (sourceID): Observable<any> => {
        return this._http.get(this.actionUrl + 'bysource?sourceID=' + sourceID, this.options)
            .pipe(catchError(this.handleError));
    }

    public Add = (toAdd: any): Observable<any> => {
        return this._http.post(this.actionUrl + 'create', JSON.stringify(toAdd), this.options)
            .pipe(catchError(this.handleError));
    }

    public Update = (toChange: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(toChange), this.options)
            .pipe(catchError(this.handleError));
    }

    public Delete = (toDelete: any): Observable<any> => {
        return this._http.delete(this.actionUrl + 'delete?ID=' + toDelete, this.options)
            .pipe(catchError(this.handleError));
    }

    public openNotifs(id) {
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
        return 'There is an error';
    }
}
