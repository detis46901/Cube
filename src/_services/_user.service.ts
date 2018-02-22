import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { User } from '../_models/user.model';

@Injectable()
export class UserService /*extends ParentService*/ {
    protected actionUrl: string;
    protected headers: Headers;
    protected token: string;
    protected options;
 
    constructor(protected _http: Http, protected configuration: Configuration) {
        //super(_http, configuration);
        this.headers = new Headers();
        try {
            this.token = JSON.parse(localStorage.getItem('currentUser')).token
            console.log(this.token)
        } catch(err) {
            console.log("Could not find user in local storage. Did you reinstall your browser or delete cookies?\n"+err)
        }
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + this.token);
        this.headers.append('Access-Control-Allow-Origin', '*');
        this.options = new RequestOptions({headers: this.headers})
        this.actionUrl = this.configuration.serverWithApiUrl + 'users/';
    }

    public GetByRole = (roleID): Observable<any> => {
        return this._http.get(this.actionUrl + 'getbyrole?roleID=' + roleID, this.options)
            .map((response: Response) => <User[]>response.json())
            //.catch(this.handleError);
    }

    public GetAll = (): Observable<any[]> => {           
        return this._http.get(this.actionUrl + 'list', this.options)
            .map((response: Response) => <any[]>response.json())
            //.catch(this.handleError);
    }
 
    public GetSingle = (id: number): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id, this.options)
            .map((response: Response) => <any>response.json())
            //.catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'one?email=' + email /*+API key 12/27/17*/, this.options)
            .map((response: Response) => <any>response.json())
            //.catch(this.handleError);
    }

    public Add = (toAdd: any): Observable<any> => {
        return this._http.post(this.actionUrl + 'create', JSON.stringify(toAdd), this.options)
            .map((response: Response) => <any>response.json())
            //.catch(this.handleError);
    }
 
    public Update = (itemToUpdate: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), this.options)
            .map((response: Response) => <any>response.json())
            //.catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<any> => {
        return this._http.delete(this.actionUrl + 'delete?ID=' + id, this.options)
            //.catch(this.handleError);
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