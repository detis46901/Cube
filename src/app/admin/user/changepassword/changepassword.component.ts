import { Component, OnInit, Inject} from '@angular/core';
import { MatDialog, MatDialogRef, MatInputModule, MAT_DIALOG_DATA} from '@angular/material';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { Md5 } from 'ts-md5/dist/md5';

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

        this.oldPw = Md5.hashStr(this.oldPw).toString();
        this.newPw = Md5.hashStr(this.newPw).toString();
        this.confPw = Md5.hashStr(this.confPw).toString();

        if (this.oldPw == this.user.password && this.newPw == this.confPw) {
            this.user.password = this.newPw
            this.userService
                .Update(this.user)
                .subscribe()
            alert("Password successfully changed.")
            this.dialog.closeAll();
        } else if (this.oldPw == this.user.password && this.newPw != this.confPw) {
            alert("New password does not match confirmation input.")
        } else {
            alert("Old password does not match database records.")
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
