import { Component, Input, OnInit, Inject} from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MdDialog, MdDialogRef, MdInputModule, MD_DIALOG_DATA} from '@angular/material';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { genSalt, hash } from 'bcrypt'
import { Md5 } from 'ts-md5/dist/md5'

@Component({
    selector: 'change-password',
    templateUrl: './changepassword.component.html',
    styleUrls: ['./changepassword.component.scss'],
    providers: [UserService]
})
export class ChangePasswordComponent implements OnInit {
    private userID: any;
    private user: User;

    private oldPassword: string;
    private oldHash: string;

    private newPassword: string;
    private newHash: string;

    private confPassword: string;
    private confHash: string;

    constructor(private dialog: MdDialog, private userService: UserService, @Inject(MD_DIALOG_DATA) public data: any) { 
        this.userID = data.userID;
    }

    ngOnInit() {
        this.getUserItems()
    }

    private getUserItems(): void {
        this.userService
           .GetSingle(this.userID)
           .subscribe((data:User) => this.user = data,
               error => console.log(error),
               () => console.log(this.user)
           );
    }

    private setHashes(Old:string, New:string, Conf:string) {
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
        let bool = this.confirm(this.oldHash)
        if (this.confirm(this.oldHash)) {
            console.log("success");
            //this.compare();
        }
    }

    /** 
     * Confirms that the hashed old password entered in dialog matches existing database hashed password. Returns true if it matches.
     * @param {string} oldHash - Existing database password hash.
     */
    private confirm(oldHash:string): boolean {
        if(oldHash == this.user.password)
            return true;
        else
            return false;
    }

    private compare() {

    }
}
