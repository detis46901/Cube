import { Component } from '@angular/core';
import { UserService } from '../../_services/_user.service';
import { Configuration } from '../../_api/api.constants';
import { User } from '../../_models/user.model';

@Component({
    selector: 'settings',
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
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getAllItems(this.userID);
    }

    public getAllItems(userid): void {
        this.dataService
            .GetSingle(userid)
            .subscribe((data:User) => {
                return this.user = data;
            }, error => {
                return console.error(error);
            });
            
    }
}

//User settings tab, should be a lot like the admin menu in look and feel