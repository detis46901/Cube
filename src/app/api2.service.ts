import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { User } from '../_models/user-model';
import { Configuration } from '../_api/api.constants';
 
@Injectable()
export class Api2Service {
 
    private actionUrl: string;
    private headers: Headers;
 
    constructor(private _http: Http, private _configuration: Configuration) {
 
        this.actionUrl = _configuration.ServerWithApiUrl + 'users/';
 
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
 
    public GetAll = (): Observable<User[]> => {
        //console.log(this.actionUrl + 'list')
        //console.log(this._http.get(this.actionUrl + 'list').map((response: Response) => <User[]>response.json()))

        return this._http.get(this.actionUrl + 'list')
            .map((response: Response) => <User[]>response.json())
//            .catch(this.handleError);
    }

    //To fix faulty get user list procedure
    /*public GetSome = (userid): Observable<User[]> => {
        
    }*/
 
    public GetSingle = (id: number): Observable<User> => {
        return this._http.get(this.actionUrl + 'one?rowid=' + id)
            .map((response: Response) => <User>response.json())
//            .catch(this.handleError);
    }
    
    public GetSingleFromEmail = (email: string): Observable<User> => {
        return this._http.get(this.actionUrl + 'one?email=' + email)
            .map((response: Response) => <User>response.json())
//            .catch(this.handleError);
    }
 
    public Add = (itemName: User): Observable<User> => {
        /*var password = require('password-hash-and-salt')
        var salt = "secret"

        password('Monday01').hash(salt, function(salt, hash) {
            console.log(hash)
            //if(error)
                //throw new Error('Hash error')
            itemName.password = hash

            password('hack').verifyAgainst(this.newuser.password, function(error, verified) {
                if(error)
                    throw new Error('Hack error')
                if(!verified) {
                    console.log('hack attempt')
                } else {
                    console.log('The secret is')
                }       
            })
        })*/   

        let toAdd = JSON.stringify({ ItemName: itemName }); //Should hash the password to be posted here
        console.log(JSON.stringify(itemName.password)) 
        console.log(this.headers)

        return this._http.post(this.actionUrl + 'create', JSON.stringify(itemName), { headers: this.headers })
            .map((response: Response) => <User>response.json())
 //           .catch(this.handleError);
    }
    
    //WHAT IS WRONG WITH THIS look at layeradmin service
    public Update = (itemToUpdate: User): Observable<User> => {
        console.log(this._http.put(this.actionUrl + '/update', JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <User>response.json()))
        return this._http.put(this.actionUrl + '/update', JSON.stringify(itemToUpdate), { headers: this.headers })
            .map((response: Response) => <User>response.json())
 //           .catch(this.handleError);
    }
 
    public Delete = (id: number): Observable<Response> => {
        console.log (this.actionUrl + 'delete?rowID=' + id, { headers: this.headers })
        return this._http.delete(this.actionUrl + 'delete?rowID=' + id, { headers: this.headers })
 //           .catch(this.handleError);
    }
 
    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}