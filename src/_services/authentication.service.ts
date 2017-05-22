import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { User } from '../_models/user-model';

 
@Injectable()
export class AuthenticationService {
    public token: string;
    public JWT: string;

    constructor(private http: Http) { //need to implement JWT here
        var CryptoJS = require("crypto-js") //Required to use CryptoJS
        var AES = require("crypto-js/aes")
        var SHA256 = require("crypto-js/sha256")

        // set token if saved in local storage    
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if(currentUser != null) {
            var header = {
                "alg": "HS256",
                "typ": "JWT"
            }

            var payload = {
                currentUser
            }

            //this.token = CryptoJS.enc.base64.stringify(header) + "." + CryptoJS.enc.base64.stringify(payload) //working on jwt here
            console.log(this.token)
        }

        //console.log(CryptoJS.enc.base64.stringify(currentUser))
        console.log(currentUser)
        console.log(header)
    }
 
    login(username: string, password: string): Observable<number> {
        //console.log('http://foster2.cityofkokomo.org:5000/api/authenticate', { email: username, password: password })
        return this.http.post('http://foster2.cityofkokomo.org:5000/api/authenticate', { email: username, password: password })
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