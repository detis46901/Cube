import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MatInputModule, MAT_DIALOG_DATA } from '@angular/material';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';

@Component({
    selector: 'change-password',
    templateUrl: './changepassword.component.html',
    styleUrls: ['./changepassword.component.scss'],
    providers: [UserService]
})

export class ChangePasswordComponent implements OnInit {
    public userID: number;
    public user: User;
    public oldPw: string = "";
    public newPw: string = "";
    public confPw: string = "";

    constructor(private dialog: MatDialog, private userService: UserService, @Inject(MAT_DIALOG_DATA) private data: any) {
        this.userID = data.userID;
    }

    ngOnInit() {
        this.getUserItems(this.userID);
    }

    public getUserItems(userID: number): void {
        this.userService
            .GetSingle(userID)
            .subscribe((data: User) => {
                this.user = data;
            });
    }

    // 2/2/18: Fix to update controls to recognize password has changed (perhaps using a callback/observer)
    public changePW(): void {
        //1/11/18
        // bcrypt.compare(this.oldPw, this.user.password, (err, result) => {
        //     if(err) { //bcrypt hashing error
        //         console.error(err);
        //     } else if(result) {
        //         alert("Curent password is correct.")
        //     } else {
        //         alert("Current password is incorrect.")
        //     }
        // })
        if (this.newPw == this.oldPw) {
            alert("New password matches old password.")
        } else if (this.newPw != this.confPw) {
            alert("Confirm password entry did not match new password entry.")
        } else {
            this.userService.updatePassword(this.user, this.oldPw, this.newPw)
                .subscribe(() => {
                    this.dialog.closeAll()
                    this.getUserItems(this.userID); // 2/2/18 fixed?
                })
        }

        this.oldPw = "";
        this.newPw = "";
        this.confPw = "";
    }
}
