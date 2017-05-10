import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
 
import { AuthenticationService } from '../../_services/authentication.service';
 import { Api2Service } from '../api2.service';
 import { User } from '../../_models/user-model'

@Component({
    //moduleId: module.id, (why does this not need to be there???)
    templateUrl: 'login.component.html'
})
 
export class LoginComponent implements OnInit {
    model: any = {};
    public user = new User;
    loading = false;
    error = '';
 
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private dataService: Api2Service) { }
 
    ngOnInit() {
        // reset login status
        this.authenticationService.logout();
    }
 
    login() {
        this.loading = true;
        console.log(this.model.username)
        this.authenticationService.login(this.model.username, this.model.password)
            .subscribe(result => {
                if (result > 0 ) {
                    // login successful
                    this.router.navigate(['/']); //may want to change this so it redirects to a url with the user's ID in it
                } else {
                    // login failed
                    this.error = 'Username or password is incorrect';
                    this.loading = false;
                }
            });
    }

    public getAllItems(userID): void {
         this.dataService
            .GetSingle(userID)
            .subscribe((data:User) => this.user = data,
                error => console.log(error),
                () => console.log(this.user.email));
            
    }
}