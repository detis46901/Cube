import { Component, OnInit, Inject} from '@angular/core';
import { MdDialog, MdDialogRef, MdInputModule, MD_DIALOG_DATA} from '@angular/material';
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
    private oldHash: string;  
    private newHash: string;
    private confHash: string;

    //HTML variables
    private oldPassword: string;
    private newPassword: string;
    private confPassword: string;

    constructor(private dialog: MdDialog, private userService: UserService, @Inject(MD_DIALOG_DATA) private data: any) {
        //Figure out what datatype "data" needs to be.
        this.userID = data.userID;
    }

    ngOnInit() {
        this.getUserItems();
    }

    private getUserItems(): void {
        this.userService
            .GetSingle(this.userID)
            .subscribe((data:User) => {
                this.user = data;
            });
    }

    private setHashes(Old: string, New: string, Conf: string): void {
        //9/8/17 This is the closest to working, but still throws several npm errors with paths and dependencies. 
        /*let saltRounds = 10;
        hash(Old, saltRounds, function(err, hash) {
            if(err) 
                console.log(err)
            oldHash = hash;
        })*/

        this.oldHash = Md5.hashStr(Old).toString();
        this.newHash = Md5.hashStr(New).toString();
        this.confHash = Md5.hashStr(Conf).toString();
        let bool = this.confirm(this.oldHash);
        if (this.confirm(this.oldHash)) {
            console.log('success');
        }
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
