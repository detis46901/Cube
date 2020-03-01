
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http'
import { Configuration } from '../_api/api.constants';
import { UserService } from './_user.service';
import { environment } from '../environments/environment'

@Injectable()
export class AuthenticationService {
    private token: string;
    private actionUrl: string;

    constructor(private http: HttpClient, private configuration: Configuration, private userService: UserService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.actionUrl = configuration.serverWithApiUrl + 'authenticate';
    }

    // clear token, remove user from local storage to log user out
    logout(): void {
        this.token = null;
        localStorage.removeItem('currentUser');
    }
    public publicLogin(publicName: string): Promise<any> {
        let promise = new Promise((resolve) => {
            this.userService.login(publicName.toLocaleLowerCase() + '@' + environment.domain, environment.publicPassword)
                .subscribe(res => {

                    console.log(res)
                    if (res['token']) {
                        this.token = res['token'];
                        let userID = res['userID']
                        let admin = res['admin']

                        localStorage.setItem('currentUser', JSON.stringify({
                            userID: userID,
                            admin: admin,
                            token: this.token,
                            firstName: res['firstName'],
                            lastName: res['lastName'],
                            public: true
                        }))
                        }
                        resolve()
                }, error => {
                    alert("Incorrect password or username.")
                })

        })
        return promise
    }

}