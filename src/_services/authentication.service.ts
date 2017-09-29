import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { Configuration } from '../_api/api.constants';

@Injectable()
export class AuthenticationService {
    private token: string;
    private JWT: string;
    private actionUrl: string;

    constructor(private http: Http, private configuration: Configuration) {  
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.actionUrl = configuration.serverWithApiUrl + 'authenticate';
    }
 
    login(username: string, password: string): Observable<number> {        
        return this.http.post(this.actionUrl, {email: username, password: password})
            .map((response: Response) => {
                // login is successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                if (token) {
                    this.token = token;
                    let userID = response.json() && response.json().userid;
                    let admin = response.json() && response.json().admin;

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({
                        userid: userID, 
                        admin: admin, 
                        token: token
                    }));
                    return userID;
                } else {
                    // return false to indicate failed login
                    return 0;
                }
            });
    }
 
    // clear token, remove user from local storage to log user out
    logout(): void {
        this.token = null;
        localStorage.removeItem('currentUser');
    }
}