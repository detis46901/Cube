import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ChangePictureComponent } from './change-picture/change-picture.component';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
    private token: string;
    private userID: number;

    constructor(private dialog: MatDialog) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {

    }

    private changePicture() {
        const dialogRef = this.dialog.open(ChangePictureComponent);
        dialogRef.componentInstance.userID = this.userID;

        dialogRef.afterClosed()
            .subscribe(()=>console.log("closed"));
    }
}
