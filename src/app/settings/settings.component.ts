import { Component, OnInit } from '@angular/core';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    providers: [UserService],
    styleUrls: ['./settings.component.scss'],
})

export class SettingsComponent implements OnInit{
    //Screen code (see home.component.ts)
    public screen = 3;
    public user = new User;
    public myItems: any;
    public userID: number;

    constructor(private dataService: UserService) {}

    ngOnInit() {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
        this.getAllItems(this.userID);
    }

    public getAllItems(userid): void {
        this.dataService
            .GetSingle(userid)
            .subscribe((data: User) => {
                return this.user = data;
            }, error => {
                return console.error(error);
            });
    }
}