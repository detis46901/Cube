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
 
    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'users/';
    }

    public GetByRole = (roleID): Observable<User[]> => {
        return this._http.get(this.actionUrl + 'getbyrole?roleID=' + roleID)
            .map((response: Response) => <User[]>response.json())
            .catch(this.handleError);
    }

    public login(email: string, password: string) {        
        return this._http.post(this.actionUrl + 'login', '{"email": "' + email + '", "password": "' + password + '"}')
        .map((response: Response) => {
            //console.log(response)
            if(response.ok) {
                return response.json().token
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