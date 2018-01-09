import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { User } from '../_models/user.model';

@Injectable()
export class UserService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;
    protected token: string;
 
    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'users/';
    }

    public GetByRole = (roleID): Observable<User[]> => {
        return this._http.get(this.actionUrl + 'getbyrole?roleID=' + roleID)
            .map((response: Response) => <User[]>response.json())
            .catch(this.handleError);
    }

    public login(username: string, password: string) {
        return this._http.post(this.actionUrl + "login", {email: username, password: password})
        .map((response) => {
            if(response.ok) {
                var token = response.json().token
                //console.log(token) correct
                if (token) {//if(token.isValid())
                    this.token = token;
                    var userID = response.json() && response.json().userID;
                    var admin = response.json() && response.json().admin;
                    console.log(response.json())
                    console.log(userID)

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({
                        userID: userID, 
                        admin: admin, 
                        token: token
                    }));
                    //return userID;
                    console.log("here")
                    return token
                } else {
                    // return false to indicate failed login
                    console.log("failed")
                    return 0;
                }
            } else {
                alert("Authentication error.")
            }
                // login is successful if there's a jwt token in the response
                // let token = response.json() && response.json().token;
                // if (token) {
                //     this.token = token;
                //     let userID = response.json() && response.json().userid;
                //     let admin = response.json() && response.json().admin;

                //     // store username and jwt token in local storage to keep user logged in between page refreshes
                //     localStorage.setItem('currentUser', JSON.stringify({
                //         userid: userID, 
                //         admin: admin, 
                //         token: token
                //     }));
                //     return userID;
                // } else {
                //     // return false to indicate failed login
                //     return 0;
                // }
            });
    }
}