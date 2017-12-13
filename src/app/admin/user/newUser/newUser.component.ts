import { Component, OnInit } from '@angular/core';
import { User, UserPage } from '../../../../_models/user.model';
import { Role } from '../../../../_models/organization.model';
import { UserService } from '../../../../_services/_user.service';
import { RoleService } from '../../../../_services/_role.service';
import { Md5 } from 'ts-md5/dist/md5';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'newUser',
    templateUrl: './newUser.component.html',
    styleUrls: ['./newUser.component.scss'],
    providers: [UserService]
})

export class NewUserComponent implements OnInit {
    private token: string;
    private userID: number;

    private user = new User;
    private newUser = new User;
    private users: Array<User>;

    private roles: Array<Role>;

    constructor(private dialog: MatDialog, private userService: UserService, private roleService: RoleService) { 
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
    }

    ngOnInit() {
        this.getUserItems();
        this.getRoleItems();
    }

    private getUserItems(): void {
        this.userService
            .GetAll()
            .subscribe((data:User[]) => {
                this.users = data;
            });
    }

    private getRoleItems(): void {
        this.roleService
            .GetAll()
            .subscribe((data:Role[]) => {
                this.roles = data;
            });
    }

    private clearInputs(): void {
        this.newUser.email = '';
        this.newUser.password = '';
    }

    private addUser(newUser: User): void {
        this.newUser = newUser;
        let errorFlag = false;

        for (let x of this.users) {
            if (this.newUser.email === x.email) {
                errorFlag = true;
                this.clearInputs();
                alert(x.email + ' is already taken.');
            }
        }

        if (errorFlag == false) {
            if (this.newUser.password == '' || this.newUser.password == null) {
                this.newUser.password = Md5.hashStr('Monday01').toString();
            } else {
                console.log(this.newUser.password)
                this.newUser.password = Md5.hashStr(this.newUser.password).toString();
            }

            this.userService
                .Add(this.newUser)
                .subscribe(() => {
                    this.dialog.closeAll();
                });
        }
    }

}
