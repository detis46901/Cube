import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { Configuration } from '../../../_api/api.constants';
import { Http, Headers, Response } from '@angular/http';
import { User } from '../../../_models/user.model';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'password',
  templateUrl: './password.component.html',
  providers: [UserService, Configuration],
  styleUrls: ['./password.component.scss'],
})

export class PasswordComponent implements OnInit{

    private oldPw: string = "";
    private newPw: string = "";
    private confPw: string = "";

    private token: string;
    private userID: string;
    private user = new User;
    private error;

    constructor(private userService: UserService) {
       var currentUser = JSON.parse(localStorage.getItem('currentUser'));
          this.token = currentUser && currentUser.token;
          this.userID = currentUser && currentUser.userID; 
    }

    ngOnInit() {
       this.getUserItems(this.userID);
    }

    changePW() {
        if(this.newPw == this.oldPw) {
            console.log("New password matches old password.")
            alert("New password matches old password.")
        } else if(this.newPw != this.confPw) {
            console.log("Confirm password entry did not match new password entry.")
            alert("Confirm password entry did not match new password entry.")
        } else {
            console.log("userService.updatePassword initiated")
            this.userService.updatePassword(this.user, this.oldPw, this.newPw)
            .subscribe()
        }

        this.oldPw = "";
        this.newPw = "";
        this.confPw = "";
    }

    //It would be wise to implement sending an email for password reset, or allowing a user to choose security questions
    getUserItems(userID): void {
        this.userService
        .GetSingle(userID)
        .subscribe((data:User) => this.user = data,
            error => console.log(error),
            () => console.log(this.user.email));
            
    }
}