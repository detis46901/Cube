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
          this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       this.getUserItems(this.userID);
    }

    changePW() {
        //console.log(this.oldPw);
        //console.log(this.newPw);

        this.oldPw = Md5.hashStr(this.oldPw).toString();
        this.newPw = Md5.hashStr(this.newPw).toString();
        this.confPw = Md5.hashStr(this.confPw).toString();

        if (this.oldPw == this.user.password && this.newPw == this.confPw) {
            this.user.password = this.newPw
            this.userService
                .Update(this.user) //this method doesn't work the way it's intended to
                .subscribe()
            alert("Password successfully changed.")
        } else if (this.oldPw == this.user.password && this.newPw != this.confPw) {
            alert("New password does not match confirmation input.")
        } else {
            alert("Old password does not match database records.")
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