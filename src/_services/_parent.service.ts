//Parent Service: most services inherit methods from this file.
//The "_" in the files in this directory denotes a service that inherits from this parent service.


import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';

@Injectable()
export class ParentService {
    protected actionUrl: string;
    public options: any;
    protected token: string;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        
    }

    public getOptions() {
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
        return this._http.get<any[]>(this.actionUrl + 'list', this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetSingle = (id: number): Observable<any> => {
        return this._http.get<any>(this.actionUrl + 'single?rowid=' + id, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get<any>(this.actionUrl + 'single?email=' + email, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public Add = (toAdd: any): Observable<any> => {
        return this._http.post(this.actionUrl + 'single', JSON.stringify(toAdd), this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public Update = (itemToUpdate: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public Delete = (id: number): Observable<any> => {
        return this._http.delete(this.actionUrl + 'delete?ID=' + id, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetByUser = (userid): Observable<any> => {
        return this._http.get(this.actionUrl + 'byuser?userid=' + userid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetByUserGroups = (userid): Observable<any> => {
        return this._http.get(this.actionUrl + 'byusergroups?userID=' + userid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetByLayer = (layerid): Observable<any> => {
        return this._http.get(this.actionUrl + 'bylayer?layerID=' + layerid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    public GetByGroup = (groupid): Observable<any> => {
        return this._http.get(this.actionUrl + 'bygroup?groupID=' + groupid, this.getOptions())
            .pipe(catchError(this.handleError));
    }

    protected handleError(error: HttpErrorResponse) {
        // if (error.error instanceof ErrorEvent) {
        //     // A client-side or network error occurred. Handle it accordingly.
        //     console.error('An error occurred:', error.error.message);
        // } else {
        //     // The backend returned an unsuccessful response code.
        //     // The response body may contain clues as to what went wrong,
        //     console.error(
        //         `Backend returned code ${error.status}, ` +
        //         `body was: ${error.error}`);
        // }
        // // return an ErrorObservable with a user-facing error message

        return 'there is an error'
    }
}
