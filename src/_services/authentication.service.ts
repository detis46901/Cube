import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuration } from '../_api/api.constants';

@Injectable()
export class AuthenticationService {
    private token: string;
    private actionUrl: string;

    constructor(private http: HttpClient, private configuration: Configuration) {  
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.actionUrl = configuration.serverWithApiUrl + 'authenticate';
    }
 
    // clear token, remove user from local storage to log user out
    logout(): void {
        this.token = null;
        localStorage.removeItem('currentUser');
    }
}