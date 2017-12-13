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
import { NewUserComponent } from './newUser/newUser.component';
import { Md5 } from 'ts-md5/dist/md5';
import { MatDialog } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';

//var userList: Array<User>;
var userList: any[] = [
    {ID: 1, firstName: 'Josh', lastName: 'Church', roleID: 1, email: 'gmail@gmail.com', active: 'true', administrator: 'false'}
]
var roleList: Array<Role>;

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

    //For use with Material Data Table
    userColumns = ['userID', 'firstName', 'lastName', 'role', 'email', 'active', 'administrator']
    dataSource: UserDataSource | null;
    //dataSource: TableDataSource<User>;
    
    constructor(private userService: UserService, private roleService: RoleService, private userPageService: UserPageService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
    }

    ngOnInit() {
        this.getUserItems();
        this.getRoleItems();
        this.getUserPageItems();
        //console.log(this.users)
        this.dataSource = new UserDataSource(this.userService)
    }

    public getUserItems(): void {
        this.userService
            .GetAll()
            .subscribe((data:User[]) => {
                this.users = data;
                userList = data;
            });
    }

    private getRoleItems(): void {
        this.roleService
            .GetAll()
            .subscribe((data:Role[]) => {
                this.roles = data;
                roleList = this.roles;
            });
    }

    private getUserPageItems(): void {
        this.userPageService
            .GetAll()
            .subscribe((data:UserPage[]) => {
                this.userPages = data;
            });
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
        let dialogRef = this.dialog.open(ChangePasswordComponent, {height: '300px', width: '340px',
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
        let dialogRef = this.dialog.open(PageComponent, {height: '400px', width: '470px'});
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
            if (result == this.objCode) {
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
        let dialogRef = this.dialog.open(PageConfigComponent, {height: '320px', width: '350px'});
        dialogRef.componentInstance.pageID = pageID;
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.pageName = name;

        dialogRef.afterClosed()
        .subscribe(() => {
            this.getUserPageItems();
        });
    }

    private openNewUser(): void {
        const dialogRef = this.dialog.open(NewUserComponent, {height:'370px', width:'500px'});
        dialogRef.afterClosed()
        .subscribe(() => {
            this.getUserItems();
            this.getUserPageItems();
        });
    }
}

export class UserDataSource extends DataSource<User> {
    private users: Array<User>;

    constructor(private userService: UserService) {
        super();
    }

    ngOnInit() {
        this.userService.GetAll()
        .subscribe((data) => this.users = data)
    }

    connect(): Observable<User[]> {
        //return Observable.of(userList)
        // this.userService.GetAll()
        // .subscribe((response) => {
        //     return Observable.of(response);
        // })
        return this.userService.GetAll()
        .map(data => {
            return data;
        })
    }

    disconnect() {}
}