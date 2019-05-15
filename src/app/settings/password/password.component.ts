import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { Configuration } from '../../../_api/api.constants';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http'
import { User } from '../../../_models/user.model';

@Component({
    selector: 'password',
    templateUrl: './password.component.html',
    providers: [UserService, Configuration],
    styleUrls: ['./password.component.scss'],
})

export class PasswordComponent implements OnInit {
    public oldPw: string = "";
    public newPw: string = "";
    public confPw: string = "";

    public token: string;
    public userID: string;
    public user = new User;
    public error;

    constructor(private userService: UserService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getUserItems(this.userID);
    }

    public changePW(): void {
        if (!this.oldPw) {
            if (!this.newPw) {
                alert("Please enter a value for old password and new password.");
                this.clearInputs();
                return;
            } else {
                alert("Please enter a value for old password.");
                this.clearInputs();
                return;
            }
        }
        if (this.oldPw && !this.newPw) {
            alert("Please enter a value for new password.");
            this.clearInputs();
            return;
        }
        if (this.oldPw && this.newPw && !this.confPw) {
            alert("Please enter a value for confirm password.");
            this.clearInputs();
            return;
        }
        if (this.newPw.length < 8) {
            alert("Please enter a password that is at least 8 characters long.")
            this.clearInputs();
            return;
        }
        if (this.newPw == this.oldPw) {
            alert("New password matches old password.")
            this.clearInputs();
            return;
        }
        if (this.newPw != this.confPw) {
            alert("Confirm password entry did not match new password entry.")
            this.clearInputs();
            return;
        } else {
            this.userService.updatePassword(this.user, this.oldPw, this.newPw)
                .subscribe(() => {
                    this.getUserItems(this.userID);
                    alert("Password successfully changed.");
                }, error => {
                    alert("Incorrect password.")
                })
        }

        this.clearInputs();
    }

    public clearInputs(): void {
        this.oldPw = "";
        this.newPw = "";
        this.confPw = "";
        this.getUserItems(this.userID);
    }

    //It would be wise to implement sending an email for password reset, or allowing a user to choose security questions
    getUserItems(userID): void {
        this.userService
            .GetSingle(userID)
            .subscribe((data: User) =>
                this.user = data,
                error => console.error(error)
            );
    }
}