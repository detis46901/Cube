import { Component, OnInit, Inject} from '@angular/core';
import { MatDialog, MatDialogRef, MatInputModule, MAT_DIALOG_DATA} from '@angular/material';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { Md5 } from 'ts-md5/dist/md5';
import bcrypt = require('bcrypt');

@Component({
    selector: 'change-password',
    templateUrl: './changePassword.component.html',
    styleUrls: ['./changePassword.component.scss'],
    providers: [UserService]
})

export class ChangePasswordComponent implements OnInit {
    private userID: number;
    private user: User;   
    private oldPw: string = "";
    private newPw: string = "";
    private confPw: string = "";

    constructor(private dialog: MatDialog, private userService: UserService, @Inject(MAT_DIALOG_DATA) private data: any) {
        this.userID = data.userID;
    }

    ngOnInit() {
        this.getUserItems(this.userID);
    }

    private getUserItems(userID: number): void {
        this.userService
            .GetSingle(userID)
            .subscribe((data:User) => {
                this.user = data;
            });
    }

    changePW() {
        //console.log(this.oldPw);
        //console.log(this.newPw);
        //console.log(this.confPw);

        //last working code
        // this.oldPw = Md5.hashStr(this.oldPw).toString();
        // this.newPw = Md5.hashStr(this.newPw).toString();
        // this.confPw = Md5.hashStr(this.confPw).toString();
        // if (this.oldPw == this.user.password && this.newPw == this.confPw) {
        //     this.user.password = this.newPw
        //     this.userService
        //         .Update(this.user)
        //         .subscribe()
        //     alert("Password successfully changed.")
        //     this.dialog.closeAll();
        // } else if (this.oldPw == this.user.password && this.newPw != this.confPw) {
        //     alert("New password does not match confirmation input.")
        // } else {
        //     alert("Old password does not match database records.")
        // }

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
        if(this.newPw == this.oldPw) {
            console.log("New password matches old password.")
            alert("New password matches old password.")
        } else if(this.newPw != this.confPw) {
            console.log("Confirm password entry did not match new password entry.")
            alert("Confirm password entry did not match new password entry.")
        } else {
            console.log("userService.updatePassword initiated")
            this.userService.updatePassword(this.user, this.oldPw, this.newPw)
            .subscribe(() => {
               this.dialog.closeAll()
            })
        }

        this.oldPw = "";
        this.newPw = "";
        this.confPw = "";
    }

    /**
    * Confirms that the hashed old password entered in dialog matches existing database hashed password. Returns true if it matches.
    */
    private confirm(oldHash:string): boolean {
        if (oldHash == this.user.password) {
            return true;
        } else {
            return false;
        }
    }
}
