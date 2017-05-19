
import { Component, Input } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Api2Service } from './api2.service';
import { User } from '../_models/user-model'
import { Configuration } from '../_api/api.constants'

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  //styleUrls: ['./app.component.css', './styles/w3.css'],
})
export class HomeComponent {
public user = new User;
public isHome = true;
public myItems: any;
public token: string;
public userID: number;

    constructor(private dataService: Api2Service) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       this.getAllItems(this.userID);
        
    }

    public getAllItems(userid): void {
         this.dataService
            .GetSingle(userid)
            .subscribe((data:User) => this.user = data,
                error => console.log(error),
                () => console.log(this.user.email));
            
    }
}