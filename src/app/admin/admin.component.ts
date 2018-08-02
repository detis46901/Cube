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
    private screen = 2;

    private user = new User;
    private token: string;
    private userID: number;

    constructor(private dataService: UserService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getAllItems(this.userID);
        // let foo = new Array<number>();      
        // let bar = [4, 5, 6]
        // foo.push.apply(foo,bar)
        // console.log(foo)
        // console.log(bar)
    }

    private getAllItems(userid: number): void {
        this.dataService
            .GetSingle(userid)
            .subscribe((data: User) => {
                this.user = data
            });
    }
}