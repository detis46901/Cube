import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';
import { LoginLog } from '../../_models/loginlog.model'
import { LoginLogService } from '../../_services/_loginlog.service'

@Component({
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.scss']
})

export class LoginComponent implements OnInit {
    model: any = {};
    public user = new User;
    loading = false;
    error = '';
    public token;

    constructor(private router: Router, private authenticationService: AuthenticationService, private userService: UserService, private loginlogService: LoginLogService) {}

    ngOnInit() {
        //reset login status
        this.authenticationService.logout();
        this.token = null;
        localStorage.clear();
        document.getElementById("loginPassword")
            .addEventListener("keyup", function (event) {
                event.preventDefault();
                if (event.keyCode === 13) {
                    document.getElementById("loginSubmit").click();
                }
            })
    }

    ngOnDestroy() {
        //emit this.token to application for use with API calls
    }

    public login(): void {
        console.log(this.model)
        if (!this.model.username) {
            alert("Please enter a value for username.");
            this.clearInputs();
            return;
        }
        if (this.model.username && !this.model.password) {
            alert("Please enter a value for password.");
            this.clearInputs();
            return;
        }
        if (!this.model.username && !this.model.password) {
            alert("Please enter a value for username and password.");
            this.clearInputs();
            return;
        }
        else {
            console.log("Logging in")
            this.loading = true;
            let username: string = this.model.username
            this.userService.login(username.toLowerCase(), this.model.password)
                .subscribe(res => {
                    console.log(res)
                    if(res['token']) {
                                let ll = new LoginLog
                                ll.username = username
                                ll.result = 'Success'
                                this.loginlogService.addLoginLog(ll).subscribe((x) => {})

                                 this.token = res['token'];
                                 let userID = res['userID']
                                 let admin = res['admin']

                                 localStorage.setItem('currentUser', JSON.stringify({
                                     userID: userID,
                                     admin: admin,
                                     token: this.token,
                                     firstName: res['firstName'],
                                     lastName: res['lastName']
                                 }))
                    this.token = res
                    this.loading = false;
                    this.router.navigate(['/'])
                                }
                }, error => {
                    this.loading = false;
                    let ll = new LoginLog
                                ll.username = username
                                ll.result = 'Incorrect password or username'
                                this.loginlogService.addLoginLog(ll).subscribe((x) => {})
                    alert("Incorrect password or username.")
                })
        }

        this.clearInputs();
    }

    private clearInputs(): void {
        this.model.username = "";
        this.model.password = ""
    }

    getUser(userID): void {
        this.userService
            .GetSingle(userID)
            .subscribe((data: User) =>
                this.user = data,
                error => console.error(error)
            );

    }
}