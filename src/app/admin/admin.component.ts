
import { Component, Input } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { UserService } from '../../_services/user.service';
import { User } from '../../_models/user-model'
import { Configuration } from '../../_api/api.constants'

@Component({
  selector: 'app-root',
  templateUrl: './admin.component.html',
  providers: [UserService, Configuration],
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
    //screen code (see home.component.html)
    private screen = 2;

    public user = new User;
    public myItems: any;
    public token: string;
    public userID: number;

    constructor(private dataService: UserService) {
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