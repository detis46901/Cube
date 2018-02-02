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
        return this._http.get(this.actionUrl + 'getbyrole?roleID=' + roleID, this.options)
            .map((response: Response) => <User[]>response.json())
            .catch(this.handleError);
    }

    public generateKey(email: string, firstName: string, lastName: string) {
        return this._http.post(this.actionUrl + "generateKey", {email: email, firstName: firstName, lastName: lastName}, this.options)
        .map((response) => {
            if(response.ok) {
                return response.json()
            } else {
                return false
            }
        })
    }

    public updatePassword(user: User, oldPw: string, newPw: string) {
        return this._http.put(this.actionUrl + "updatePassword", {currUser: user, password: user.password, oldPassword: oldPw, newPassword: newPw}, this.options)
        .map((response) => {
            if(response.ok) {
                console.log("HTTP Response OK")
                return response.json()
            } else {
                console.log("HTTP Response failed")
                return false
            }
        })
    }

    public login(username: string, password: string) {
        return this._http.post(this.actionUrl + "login", {email: username, password: password})
        .map((response) => {
            if(response.ok) {
                var token = response.json().token
                if (token) {//if(token.isValid())
                    this.token = token;
                    var userID = response.json() && response.json().userID;
                    var admin = response.json() && response.json().admin;

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({
                        userID: userID, 
                        admin: admin, 
                        token: token
                    }));
                    return token
                } else {
                    // return false to indicate failed login
                    console.log("Failed login")
                    return 0;
                }
            } else {
                alert("Authentication error.")
            }
        });
    }
}