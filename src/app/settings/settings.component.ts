import { Component } from '@angular/core';
import { Api2Service } from '../api2.service';
import { Configuration } from '../../_api/api.constants';
import { User } from '../../_models/user-model'

@Component({
  selector: 'app-root',
  templateUrl: './settings.component.html',
  providers: [Api2Service, Configuration],
  //styleUrls: ['./app.component.css', './styles/w3.css'],
})

export class SettingsComponent{
    public user = new User;
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

//User settings tab, should be a lot like the admin menu in look and feel