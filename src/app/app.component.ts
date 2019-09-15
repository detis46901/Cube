import { Component } from '@angular/core';
import { UserService } from '../_services/_user.service';
import { User } from '../_models/user.model';
import { Configuration } from '../_api/api.constants';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
    selector: 'app',
    providers: [UserService, Configuration],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent {
    private user = new User;
    private myItems: User[];

    constructor(private dataService: UserService) { }

    ngOnInit() {
        //this.getAllItems();
    }

    private getAllItems(): void {
        this.dataService
            .GetAll()
            .subscribe((data: User[]) => {
                this.myItems = data,
                    error => console.error(error)
            });
    }
}