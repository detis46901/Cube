
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { User } from '../_models/user.model';

@Injectable()
export class UserService /*extends ParentService*/ {
    protected actionUrl: string;
    protected headers: Headers;
    protected token: string;
    protected options;

    constructor(protected _http: HttpClient, protected configuration: Configuration) {
        //super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'users/';
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
    public GetByRole = (roleID): Observable<any> => {
        return this._http.get(this.actionUrl + 'byrole?roleID=' + roleID, this.getOptions())
        //.catch(this.handleError);
    }

    public GetAll = (): Observable<any> => {
        return this._http.get(this.actionUrl + 'list', this.getOptions())
        //.catch(this.handleError);
    }

    public GetSingle = (id: any): Observable<any> => {
        return this._http.get(this.actionUrl + 'single?rowid=' + id, this.getOptions())
        //.catch(this.handleError);
    }

    public GetSingleFromEmail = (email: string): Observable<any> => {
        return this._http.get(this.actionUrl + 'single?email=' + email /*+API key 12/27/17*/, this.getOptions())
        //.catch(this.handleError);
    }

    public Add = (toAdd: any): Observable<any> => {
        console.log(JSON.stringify(toAdd))
        return this._http.post(this.actionUrl + 'single', JSON.stringify(toAdd), this.getOptions())
        //.catch(this.handleError);
    }

    public Update = (itemToUpdate: any): Observable<any> => {
        return this._http.put(this.actionUrl + 'update', JSON.stringify(itemToUpdate), this.getOptions())
        //.catch(this.handleError);
    }

    public Delete = (id: number): Observable<any> => {
        return this._http.delete(this.actionUrl + 'delete?ID=' + id, this.getOptions())
        //.catch(this.handleError);
    }

    public generateKey(email: string, firstName: string, lastName: string) {
        return this._http.post(this.actionUrl + "generateKey", { email: email, firstName: firstName, lastName: lastName }, this.getOptions())
    }

    public updatePassword(user: User, oldPw: string, newPw: string) {
        return this._http.put(this.actionUrl + "updatePassword", { currUser: user, password: user.password, oldPassword: oldPw, newPassword: newPw }, this.getOptions())
    }

    public login(username: string, password: string) {
        return this._http.post(this.actionUrl + "login", { email: username, password: password })
     }
}
