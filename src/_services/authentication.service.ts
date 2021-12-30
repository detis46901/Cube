
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { UserService } from './_user.service';
import { environment } from '../environments/environment'
import { LoginLogService } from './_loginlog.service'
import { LoginLog } from '../_models/loginlog.model'

@Injectable()
export class AuthenticationService {
    private token: string;
    private actionUrl: string;

    constructor(private http: HttpClient, private userService: UserService, private loginlogService: LoginLogService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.actionUrl = environment.apiUrl + environment.apiUrlPath + 'authenticate';
    }

    // clear token, remove user from local storage to log user out
    logout(): void {
        console.log(JSON.parse(localStorage.getItem('currentUser')))
        if (JSON.parse(localStorage.getItem('currentUser'))) {
            let ll = new LoginLog
            ll.username =  JSON.parse(localStorage.getItem('currentUser'))['firstName'] + ' ' + JSON.parse(localStorage.getItem('currentUser'))['lastName']
            ll.result = 'Logout'
            this.loginlogService.addLoginLog(ll).subscribe((x) => {console.log(x)
            })
        }
        this.token = null;
        localStorage.removeItem('currentUser');
    }

    public publicLogin(publicName: string): Promise<any> {
        let promise = new Promise<void>((resolve) => {
            this.userService.login(publicName.toLocaleLowerCase() + '@' + environment.domain, environment.publicPassword)
                .subscribe(res => {
                    let ll = new LoginLog
                    ll.username =  'Anonymous'
                    ll.result = 'Public Access To ' + publicName
                    this.loginlogService.addLoginLog(ll).subscribe((x) => {console.log(x)})
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