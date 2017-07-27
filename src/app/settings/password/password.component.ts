import { Component, Input, OnInit } from '@angular/core';
import { Api2Service } from '../../api2.service';
import { Configuration } from '../../../_api/api.constants'
import { Http, Headers, Response } from '@angular/http';
import { User } from '../../../_models/user-model'
import { Md5 } from 'ts-md5/dist/md5'

@Component({
  selector: 'password',
  templateUrl: './password.component.html',
  providers: [Api2Service, Configuration],
  styleUrls: ['./password.component.less'],
})

export class PasswordComponent implements OnInit{

    public oldPw: string = "";
    public newPw: string = "";
    public token: string;
    public userID: string;
    public user = new User;
    public error;

    constructor(private dataService: Api2Service) {
       var currentUser = JSON.parse(localStorage.getItem('currentUser'));
          this.token = currentUser && currentUser.token;
          this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       this.getUserItems(this.userID)
    }

    changePW() {
        console.log(this.oldPw)
        console.log(this.newPw)

        this.oldPw = Md5.hashStr(this.oldPw).toString()
        this.newPw = Md5.hashStr(this.newPw).toString()

        if (this.oldPw == this.user.password) {
            this.user.password = this.newPw
            this.dataService
            .Update(this.user) //this method doesn't work the way it's intended to
            /*.subscribe((response:User) =>
                () => console.log(response)
            )*/
        }
        else {
            alert("Incorrect Password.")
        }
        this.oldPw = "";
        this.newPw = "";
    }

    //It would be wise to implement sending an email for password reset, or allowing a user to choose security questions
    getUserItems(userID): void {
        this.dataService
        .GetSingle(userID)
        .subscribe((data:User) => this.user = data,
            error => console.log(error),
            () => console.log(this.user.email));
            
    }

    /*public updateUser(user) {
        this.api2service
            .Update(user)
            .subscribe(result => {
                console.log(result);
                this.getUserItems();
            })
    }*/
}