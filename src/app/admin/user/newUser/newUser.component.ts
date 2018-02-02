import { Component, OnInit } from '@angular/core';
import { User, UserPage } from '../../../../_models/user.model';
import { UserService } from '../../../../_services/_user.service';
import { GroupMember } from '../../../../_models/groupMember.model';
import { GroupMemberService } from '../../../../_services/_groupMember.service';
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

    constructor(private dialog: MatDialog, private userService: UserService, private groupMemberService: GroupMemberService) { 
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getUserItems();
    }

    private getUserItems(): void {
        this.userService
            .GetAll()
            .subscribe((data:User[]) => {
                this.users = data;
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
                this.newUser.password = 'Monday01';
            } else {
                this.newUser.password = this.newUser.password;
            }

            this.userService
                .Add(this.newUser)
                .subscribe(() => {
                    this.dialog.closeAll();
                });
        }

        if (this.newUser.administrator) {
            let newAdminEntry: GroupMember
            newAdminEntry.groupID = 2;
            newAdminEntry.userID = this.newUser.ID
            this.groupMemberService
                .Add(newAdminEntry)
                .subscribe()
        }
    }

}
