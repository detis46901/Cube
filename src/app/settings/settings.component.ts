import { Component } from '@angular/core';
import { UserService } from '../../_services/user.service';
import { Configuration } from '../../_api/api.constants';
import { User } from '../../_models/user-model'

@Component({
  selector: 'app-root',
  templateUrl: './settings.component.html',
  providers: [UserService, Configuration],
  styleUrls: ['./settings.component.css'],
})

export class SettingsComponent{
    //Screen code (see home.component.ts)
    private screen = 3;

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

//User settings tab, should be a lot like the admin menu in look and feel