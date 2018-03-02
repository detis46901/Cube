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
 
    login() {
        let that = this;
        console.log(this.model)
        this.loading = true;
        let username:string = this.model.username
        this.userService
            .login(username.toLowerCase(), this.model.password)
            .subscribe(res => {
                if (res) {
                    console.log(localStorage.getItem('currentUser'))
                    this.token = res
                    this.loading=false;
                    this.router.navigate(['/']);
                } else {
                    this.loading=false;
                    this.model.password="";
                }
            })
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