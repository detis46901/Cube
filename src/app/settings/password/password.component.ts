import { Component, Input, OnInit } from '@angular/core';
import { Api2Service } from '../../api2.service';
import { Configuration } from '../../../_api/api.constants'
import { Http, Headers, Response } from '@angular/http';
import { User } from '../../../_models/user-model'

@Component({
  selector: 'password',
  templateUrl: './password.component.html',
  providers: [Api2Service, Configuration],
  styleUrls: ['./password.component.less'],
})

export class PasswordComponent implements OnInit{

    public model: any = {};
    public token: string;
    public userID: string;
    public user = new User;

    constructor(private dataService: Api2Service) {
       var currentUser = JSON.parse(localStorage.getItem('currentUser'));
          this.token = currentUser && currentUser.token;
          this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       
    }

    //It would be wise to implement sending an email for password reset, or allowing a user to choose security questions
    public getUserItems(userID): void {
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