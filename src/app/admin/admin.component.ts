import { Component } from '@angular/core';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';
import { Configuration } from '../../_api/api.constants';

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html',
    providers: [UserService, Configuration],
    styleUrls: ['./admin.component.scss'],
})

export class AdminComponent {
    //screen code identifier (see home.component.html)
    public screen = 2;

    public user = new User;
    public userID: number;

    constructor(private dataService: UserService) {}

    ngOnInit() {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
        this.getAllItems(this.userID);
    }

    private getAllItems(userid: number): void {
        this.dataService
            .GetSingle(userid)
            .subscribe((data: User) => {
                this.user = data
            });
    }
}