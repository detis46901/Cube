import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { UserPageService } from '../../../_services/_userPage.service';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { User, UserPage } from '../../../_models/user.model';
import { UserPageLayer } from '../../../_models/layer.model'
import { PagePipe } from '../_pipes/rowfilter2.pipe';
import { NumFilterPipe } from '../../../_pipes/numfilter.pipe';
import { ConfirmDeleteComponent } from '../confirmdelete/confirmdelete.component';
import { PageComponent } from './page/page.component';
import { PageConfigComponent } from './pageconfig/pageconfig.component';
import { ChangePasswordComponent } from './changepassword/changepassword.component';
import { NewUserComponent } from './newUser/newUser.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { UserDetailsComponent } from '../details/userDetails/userDetails.component';
//import { UserDataSource } from './userTable/userData';

//Material Table list
//var userList: Array<User>;

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    providers: [UserService, UserPageLayerService, UserPageService, PagePipe, NumFilterPipe],
    styleUrls: ['./user.component.scss'],
})


export class UserComponent implements OnInit {
    public objCode = 1
    public publicFilter: boolean = false
    public user = new User;
    public newUser = new User;
    public userPage: UserPage;
    public userPages: Array<UserPage>;
    public users: Array<User>;

    public userColumns = ['userID', 'firstName', 'lastName', 'email', 'active', 'administrator', 'actionsColumn']
    public dataSource: any;
    public ds = new MatTableDataSource()

    constructor(private userService: UserService, private userPageLayerService: UserPageLayerService, private userPageService: UserPageService, private dialog: MatDialog) {}

    ngOnInit() {
        this.ds.filterPredicate = this.tableFilter();
        this.getUserItems();
        this.getUserPageItems();
    }

    public getUserItems(): void {
        this.userService
            .GetAll()
            .subscribe((users: User[]) => {
                this.users = users;
                this.dataSource = users;
                this.ds.data = users
                this.applyFilter()
            });
    }

    public applyFilter(): void {
        let g:string
       if (this.publicFilter == true) {
        g = 'true'
       }
       else {
           g = 'false'
       }
        this.ds.filter = g
        console.log(this.ds.filteredData)
    }

    tableFilter(): (data: any, filter: string) => boolean {
        let filterFunction = function(data, filter): boolean {
          let g: string
          if (data.public) {
            g = 'true'
          }
          else {
              g = 'false'
          }
          console.log(g)
          return g.indexOf(filter) !== -1
        }
        return filterFunction;
      }

    public getUserPageItems(): void {
        this.userPageService
            .GetAll()
            .subscribe((data: UserPage[]) => {
                this.userPages = data;
            });
    }

    public updateUser(user: User): void {
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
    public resetPassword(userID: number, password: string): void {
        this.userService
            .GetSingle(userID)
            .subscribe(result => {
                this.user = result;
                this.user.password = 'Monday01';
                this.userService
                    .Update(this.user)
                    .subscribe(() => {
                        this.getUserItems();
                    });

            });
    }

    public changePassword(userID: number): void {
        let dialogRef = this.dialog.open(ChangePasswordComponent, {
            data: { userID: userID }
        });
    }

    //Also delete all user_pages(userID) == userID, user_page_layers(userID), layer_permissions(userID)
    public deleteUser(userID: number): void {
        this.userService
            .Delete(userID)
            .subscribe(() => {
                this.getUserItems();
            });
    }

    public openPages(userID: number, firstName: string, lastName: string): void {
        const dialogRef = this.dialog.open(PageComponent, { width: "380px" });
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.firstName = firstName;
        dialogRef.componentInstance.lastName = lastName;

        dialogRef.afterClosed()
            .subscribe(() => {
                this.getUserPageItems();
            });
    }

    public openConfDel(user: User): void {
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

    public getUserPageItem(pageID: number, userID: number): void {
        let pName: string;
        this.userPageService
            .GetSingle(pageID)
            .subscribe((data: UserPage) => {
                pName = data.page;
                this.openPageConfig(pageID, userID, pName);
            });
    }

    public openPageConfig(pageID: number, userID: number, name: string): void {
        let dialogRef = this.dialog.open(PageConfigComponent, { width: "700px" });
        dialogRef.componentInstance.pageID = pageID;
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.pageName = name;

        dialogRef.afterClosed()
            .subscribe((response: UserPageLayer[]) => {
                console.log("openPageConfig afterClosed")
                if (response != null) {
                    for (let i of response) {
                        this.userPageLayerService.Update(i).subscribe();
                    }
                    this.getUserPageItems();
                }
            });
    }

    public openNewUser(): void {
        const dialogRef = this.dialog.open(NewUserComponent, { width: "380px" });//need to make this responsive
        dialogRef.afterClosed()
            .subscribe(() => {
                this.getUserItems();
                this.getUserPageItems();
                //call userTableService method and subcribe to refresh list in userTable.
            });
    }

    public openDetails(id: number, fName: string, lName: string) {
        //open a dialog to edit the layer data
        const dialogRef = this.dialog.open(UserDetailsComponent);
        dialogRef.componentInstance.ID = id;
        dialogRef.componentInstance.name = fName + " " + lName;
        dialogRef.afterClosed()
            .subscribe(() => {
                this.getUserItems();
                this.getUserPageItems();
            })
    }

    public boo(row) {
        row.confirmEditCreate()
        row.editing = !row.editing;
    }
}
