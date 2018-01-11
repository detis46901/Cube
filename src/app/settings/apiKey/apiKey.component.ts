import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';

@Component({
    selector: 'apiKey',
    templateUrl: './apiKey.component.html',
    styleUrls: ['./apiKey.component.scss'],
    providers: [UserService]
})

export class ApiKeyComponent implements OnInit {

    private apiKeyToken: string;
    private user: User;
    private token: string;
    private userID: number;

    constructor(private userService: UserService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
          this.token = currentUser && currentUser.token;
          this.userID = currentUser && currentUser.userID; 
    }

    ngOnInit() {
        this.getUserItems(this.userID)
    }

    getUserItems(userID): void {
        this.userService
        .GetSingle(userID)
        .subscribe((data:User) => {
            this.user = data
            this.userService
            .generateKey(data.email, data.firstName, data.lastName) //error: 500 hash comparison failed on API
            .subscribe((key:string) => {
                this.apiKeyToken = key;
            })
        })
    }
}
