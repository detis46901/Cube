import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { User } from '../_models/user-model';
 
@Injectable()
export class AuthenticationService {
    public token: string;
 
    constructor(private http: Http) {
        // set token if saved in local storage
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }
 
    login(username: string, password: string): Observable<number> {
        console.log('http://localhost:5000/api/authenticate', { email: username, password: password })
        return this.http.post('http://localhost:5000/api/authenticate', { email: username, password: password })
            .map((response: Response) => {
                console.log(response)
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                
                if (token) {
                    // set token property
                    this.token = token;
                    let userid = response.json() && response.json().userid;
                    let admin = response.json() && response.json().admin;
                    console.log(userid)
                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({ userid: userid, admin: admin, token: token }));
                    // return true to indicate successful login
                    return userid;
                } else {
                    // return false to indicate failed login
                    return 0;
                }
            });
    }
 
    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.removeItem('currentUser');
    }
}