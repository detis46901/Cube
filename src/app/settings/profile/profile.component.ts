import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ChangePictureComponent } from './change-picture/change-picture.component';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    providers: [UserService]
})

export class ProfileComponent implements OnInit {
    public token: string;
    public userID: number;
    public user: User;

    constructor(private dialog: MatDialog, private userService: UserService) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getUser(this.userID)
    }

    public getUser(id) {
        this.userService
            .GetSingle(id)
            .subscribe((res) => {
                this.user = res
            })
    }

    public changePicture() {
        const dialogRef = this.dialog.open(ChangePictureComponent);
        dialogRef.componentInstance.userID = this.userID;

        dialogRef.afterClosed()
            .subscribe(() => console.log("closed"));
    }

    public submit(user: User) {
        this.userService
            .Update(user)
            .subscribe()
    }
}
