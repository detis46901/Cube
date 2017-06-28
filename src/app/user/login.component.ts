import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
 
import { AuthenticationService } from '../../_services/authentication.service';
 import { Api2Service } from '../api2.service';
 import { User } from '../../_models/user-model'
 import { Md5 } from 'ts-md5/dist/md5'

@Component({
    //moduleId: module.id, (why does this not need to be there???)
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.css']
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
        //console.log(Md5.hashStr(this.model.password).toString())
        this.model.password = Md5.hashStr(this.model.password).toString() //This works fine in conjunction with user.component.ts.addUser, but existing users can't login if this is left on
        this.authenticationService.login(this.model.username, this.model.password)
            .subscribe(result => {
                if (result > 0 ) {
                    // login successful
                    console.log(result)
                    this.router.navigate(['/']); //may want to change this so it redirects to a url with the user's ID in it
                } else {
                    // login failed
                    console.log(result)
                    this.model.password="";
                    this.error = 'Username or password is incorrect.';
                    this.loading = false;
                }
            });
    }

    getAllItems(userID): void {
         this.dataService
            .GetSingle(userID)
            .subscribe((data:User) => this.user = data,
                error => console.log(error),
                () => console.log(this.user.email));
            
    }
}