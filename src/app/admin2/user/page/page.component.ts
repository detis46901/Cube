import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User, UserPage } from '../../../../_models/user.model';
import { UserPageService } from '../../../../_services/_userPage.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDeleteComponent } from '../../confirmdelete/confirmdelete.component';

@Component({
    selector: 'page',
    templateUrl: './page.component.html',
    providers: [UserService], //removed Configuration, FilterPipe, NumFilterPipe
    styleUrls: ['./page.component.scss'],
})

export class PageComponent2 implements OnInit {
    @Input() userID;
    @Input() firstName;
    @Input() lastName;

    public objCode = 7;
    public token: string;

    public user = new User;
    public userPage = new UserPage;

    public userPages = new Array<UserPage>();
    public newUserPage: string;
    public selectedPage: number;

    constructor(public userPageService: UserPageService, public dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    ngOnInit() {
        this.getUserPageItems();
    }

    public getUserPageItems(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data: UserPage[]) => {
                this.setupPages(data);
            });
    }

    public setupPages(userPages: Array<UserPage>): void {
        this.userPages = []
        for (let userPage of userPages) {
            this.userPages[userPage.pageOrder] = userPage

            if (userPage.default == true) {
                this.selectedPage = userPage.ID;
            }
        }
        for (let userPage of this.userPages) {
            if (userPage == undefined) {
                alert("Page list is incomplete. Error unhandled.")
            }
        }
    }

    public updateDefaultPage(userPage: UserPage): void {
        for (let tempage of this.userPages) {
            if (tempage.default == true) {
                tempage.default = false;
                this.updateUserPage(tempage);
            }
        }
        for (let tempage of this.userPages) {
            if (tempage.ID == userPage.ID) {
                tempage.default = true;
                tempage.active = true;
                this.updateUserPage(tempage);
            }
        }
    }

    public addUserPage(newUserPage: string): void {
        this.userPage.page = newUserPage;
        this.userPage.userID = this.userID;
        this.userPage.active = true;
        this.userPage.pageOrder = this.userPages.length;
        this.userPage.default = false;
        this.userPageService
            .Add(this.userPage)
            .subscribe(() => {
                this.getUserPageItems();
            });
    }

    public updateUserPage(userPage: UserPage): void {
        this.userPageService
            .Update(userPage)
            .subscribe(() => {
                this.getUserPageItems();
            });
    }

    public openConfDel(userPage: UserPage): void {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = userPage.ID;
        dialogRef.componentInstance.objName = userPage.page;

        dialogRef.afterClosed()
            .subscribe(result => {
                if (result == this.objCode) {
                    this.deleteUserPage(userPage.ID);
                    this.decrementPageOrders(userPage.pageOrder);
                    //START 2/22/18
                    //decrement all pageOrder values that are greater than the value of pageOrder on deleted page by 1.
                    //(i.e. pageOrders of 0,1,2,3,4 on pages a,b,c,d,e. Delete page b => decrement c,d,e pageOrders by 1)
                }
                this.getUserPageItems();
            });
    }


    public deleteUserPage(userpageID: number): void {
        this.userPageService
            .Delete(userpageID)
            .subscribe(() => {
                this.getUserPageItems();
            });
    }

    public decrementPageOrders(order: number) {
        for (let page of this.userPages) {
            if (page.pageOrder > order) {
                page.pageOrder = page.pageOrder - 1;
                this.updateUserPage(page);
            }
        }
    }

    public onClose(): void {
        let count = 0;
        for (let x of this.userPages) {
            x.pageOrder = count;
            this.updateUserPage(x);
            count = count + 1;
        }
    }

    public radio(userPage: UserPage): void {
        for (let x of this.userPages) {
            x.default = false;
            if (x == userPage) {
                x.default = true;
                this.updateUserPage(x);
            }
        }
    }

    public moveUp(userPage: UserPage): void {
        if (userPage.pageOrder != 0) {
            let swap = this.userPages[userPage.pageOrder - 1]
            swap.pageOrder += 1
            userPage.pageOrder -= 1;
            this.updateUserPage(userPage);
            this.updateUserPage(swap);
        }
    }

    public moveDown(userPage: UserPage): void {
        if (userPage.pageOrder != this.userPages.length - 1) {
            let swap = this.userPages[userPage.pageOrder + 1]
            swap.pageOrder -= 1
            userPage.pageOrder += 1;
            this.updateUserPage(userPage);
            this.updateUserPage(swap);
        }
    }
    public closeDialog() {
        this.dialog.closeAll()
    }
}