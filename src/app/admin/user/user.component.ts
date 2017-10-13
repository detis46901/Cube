import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { User, UserPage } from '../../../_models/user.model';
import { Configuration } from '../../../_api/api.constants';
import { RoleService } from '../../../_services/_role.service';
import { UserPageService } from '../../../_services/_userPage.service';
import { Role } from '../../../_models/organization.model';
import { PagePipe } from '../../../_pipes/rowfilter2.pipe';
import { NumFilterPipe } from '../../../_pipes/numfilter.pipe';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { PageComponent } from './page/page.component';
import { PageConfigComponent } from './pageConfig/pageConfig.component';
import { ChangePasswordComponent } from './changePassword/changePassword.component';
import { Md5 } from 'ts-md5/dist/md5';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    providers: [UserService, RoleService, UserPageService, Configuration, PagePipe, NumFilterPipe],
    styleUrls: ['./user.component.scss'],
})

export class UserComponent implements OnInit {
    private objCode = 1
    private token: string;
    private userID: number;

    private user = new User;
    private newUser = new User;

    private userPage: UserPage;
    private userPages: Array<UserPage>;
    private users: Array<User>;
    private roles: Array<Role>;
    
    constructor(private userService: UserService, private roleService: RoleService, private userPageService: UserPageService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
    }

    ngOnInit() {
        this.initNewUser();
        this.getUserItems();
        this.getRoleItems();
        this.getUserPageItems();
    }

    private initNewUser(): void {
        this.newUser.firstName = 'First name';
        this.newUser.lastName = 'Last name';
        this.newUser.roleID = null;
        this.newUser.active = true;
        this.newUser.email = 'Email';
        this.newUser.administrator = false;
        this.newUser.password = '';
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

    private getUserPageItems(): void {
        this.userPageService
            .GetAll()
            .subscribe((data:UserPage[]) => {
                this.userPages = data;
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
            if (this.newUser.password == '') {
                this.newUser.password = Md5.hashStr('Monday01').toString();
            } else {
                this.newUser.password = Md5.hashStr(this.newUser.password).toString();
            }

            this.userService
                .Add(this.newUser)
                .subscribe(() => {
                    this.getUserItems();
                    this.initNewUser();
                });
        }
    }

    private updateUser(user: User): void {
        let errorFlag = false;
        for (let x of this.users) {
            if (user.email === x.email) {
                /*This needs to restrict multiple users from having the same email address.
                errorFlag = true;
                this.clearInputs();
                alert(x.email + " is already taken.")*/
            }
        }

        if (errorFlag == false) {
            this.userService
                .Update(user)
                .subscribe(() => {
                    this.getUserItems();
                });
        }
    }

    //rename to change password, add a modal that will ask what new password should be
    private resetPassword(userID: number, password: string): void {
        this.userService
            .GetSingle(userID)
            .subscribe(result => {
                console.log(result);
                this.user = result;
                this.user.password = 'Monday01';
                this.userService
                    .Update(this.user)
                    .subscribe(() => {
                        this.getUserItems();
                    });

            });
    }

    private changePassword(userID: number): void {
        let dialogRef = this.dialog.open(ChangePasswordComponent, {
            height: '250px',
            width: '400px',
            data: { userID: userID }
        });
    }

    //Also delete all user_pages(userID) == userID, user_page_layers(userID), layer_permissions(userID)
    private deleteUser(userID: number): void {
        this.userService
            .Delete(userID)
            .subscribe(() => {
                this.getUserItems();
            });
    }

    private openPages(userID: number, firstName: string, lastName: string): void {
        let dialogRef = this.dialog.open(PageComponent);
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.firstName = firstName;
        dialogRef.componentInstance.lastName = lastName;

        dialogRef.afterClosed()
        .subscribe(() => {
            this.getUserPageItems();
        });
    }

    private openConfDel(user: User): void {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = user.ID;
        dialogRef.componentInstance.objName = user.firstName + ' ' + user.lastName;

        dialogRef.afterClosed()
        .subscribe(result => {
            if (result) {
                this.deleteUser(user.ID);
            }
            this.getUserPageItems();
        });
    }

    private getUserPageItem(pageID: number, userID: number): void {
        let pName: string;
        this.userPageService
            .GetSingle(pageID)
            .subscribe((data:UserPage) => {
                pName = data.page;
                this.openPageConfig(pageID, userID, pName);               
            });
    }

    private openPageConfig(pageID: number, userID: number, name: string): void {
        let dialogRef = this.dialog.open(PageConfigComponent);
        dialogRef.componentInstance.pageID = pageID;
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.pageName = name;

        dialogRef.afterClosed()
        .subscribe(() => {
            this.getUserPageItems();
        });
    }
}