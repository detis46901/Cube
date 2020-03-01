
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http'
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';
import { MapConfig } from 'app/map/models/map.model';


@Injectable()

export class MapConfigService {
    protected actionUrl: string;
    public options: any;
    protected token: string;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        this.actionUrl = this.configuration.serverWithApiUrl + 'mapconfig/';
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
    public GetSingle = (mapConfig: MapConfig): Observable<any> => {
        return this._http.get<any[]>(this.actionUrl + 'single?mapconfig=' + JSON.stringify(mapConfig), this.options)
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
        return 'There is an error';
    }
}
