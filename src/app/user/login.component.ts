import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
 
import { AuthenticationService } from '../../_services/authentication.service';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model'
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
    public token;
 
    constructor(private router: Router, private authenticationService: AuthenticationService, private userService: UserService) {
    }
 
    ngOnInit() {
        //reset login status
        this.authenticationService.logout();
    }

    ngOnDestroy() {
        //emit this.token to application for use with API calls
    }
 
    login() {
        this.loading = true;
        this.userService
        .login(this.model.username, this.model.password)
        .subscribe(res => {
            if (res) {
                this.token = res
                this.loading=false;
                this.router.navigate(['/']);
            } else {
                this.model.password="";
                this.loading=false;
            }
        })
    }

    getAllItems(userID): void {
         this.userService
            .GetSingle(userID)
            .subscribe((data:User) => 
                this.user = data,
                error => console.error(error)
            );
            
    }
}