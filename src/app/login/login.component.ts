import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';

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
 
    constructor(private router: Router, private authenticationService: AuthenticationService, private userService: UserService) {
    }
 
    ngOnInit() {
        //reset login status
        this.authenticationService.logout();
        this.token = null;
        localStorage.clear();

        document.getElementById("loginPassword")
            .addEventListener("keyup", function(event) {
                event.preventDefault();
                if(event.keyCode === 13) {
                    document.getElementById("loginSubmit").click();
                }
            })
    }

    ngOnDestroy() {
        //emit this.token to application for use with API calls
    }

    private login(): void {
        if(!this.model.username) {
            alert("Please enter a value for username.");
            this.clearInputs();
            return;
        } 
        if(this.model.username && !this.model.password) {
            alert("Please enter a value for password.");
            this.clearInputs();
            return;
        }
        if(!this.model.username && !this.model.password) {
            alert("Please enter a value for username and password.");
            this.clearInputs();
            return;
        }
        else {
            let that = this;
            this.loading = true;
            let username:string = this.model.username
            this.userService.login(username.toLowerCase(), this.model.password)
                .subscribe(res => {
                    this.token = res
                    this.loading = false;
                    this.router.navigate(['/'])
                }, error => {
                    this.loading = false;
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
            .subscribe((data:User) => 
                this.user = data,
                error => console.error(error)
            );
            
    }
}