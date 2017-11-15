import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User, UserPage } from '../../../../_models/user.model';
import { UserPageService } from '../../../../_services/_userPage.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmDeleteComponent } from '../../confirmDelete/confirmDelete.component';

@Component({
    selector: 'page',
    templateUrl: './page.component.html',
    providers: [UserService], //removed Configuration, FilterPipe, NumFilterPipe
    styleUrls: ['./page.component.scss'],
})

export class PageComponent implements OnInit {
    @Input() userID;
    @Input() firstName;
    @Input() lastName;

    private objCode = 7;
    private token: string;

    private user = new User;
    private userPage = new UserPage;

    private userPages: Array<UserPage>;
    private newUserPage: string;
    private selectedPage: number;

    constructor(private userpageService: UserPageService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    ngOnInit() {
        this.getUserPageItems();       
    }

    private getUserPageItems(): void {
        this.userpageService
            .GetSome(this.userID)
            .subscribe((data:UserPage[]) => {
                this.setDefaultPage(data);
            });
    }
    
    private setDefaultPage(userPages: Array<UserPage>): void {
        this.userPages = userPages;
        for (let userPage of userPages) {
            if (userPage.default == true) {
                this.selectedPage = userPage.ID;
            }
        }
    }

    private updateDefaultPage(userPage: UserPage): void {
        for (let tempage of this.userPages) {
            if (tempage.default == true) {
                tempage.default = false;
                this.updateUserPage(tempage);
            }
        }
        for (let tempage of this.userPages) {
            if (tempage.ID == userPage.ID) {
                tempage.default = true;
                this.updateUserPage(tempage);
            }
        }
    }

    //this should order the pages
    private orderUserPages(userPages: Array<UserPage>): void {
        this.userPages = userPages;

        /*console.log(up)
        let temp: number[] = []
        for (let x of up) {
            temp.push(x.pageOrder)
        }
        for (let i=0; i<up.length; i++) {
            console.log(temp[i])
            console.log(up[temp[i]])
            this.userPages[i] = up[temp[i]];
        }
        console.log(up[2])
        console.log(this.userPages)*/
    }

    private addUserPage(newUserPage: string): void {
        this.userPage.page = newUserPage;
        this.userPage.userID = this.userID;
        this.userPage.active = true;
        this.userPage.pageOrder = this.userPages.length;
        this.userPage.default = false;
        this.userpageService
            .Add(this.userPage)
            .subscribe(() => {
                this.getUserPageItems();
            });
    }

    private updateUserPage(userPage: UserPage): void {
        this.userpageService
            .Update(userPage)
            .subscribe(() => {
                this.getUserPageItems();
            });
    }

    private openConfDel(userPage: UserPage): void {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = userPage.ID;
        dialogRef.componentInstance.objName = userPage.page;

        dialogRef.afterClosed()
        .subscribe(result => {
            if (result == this.objCode) {
                this.deleteUserPage(userPage.ID);
            }
            this.getUserPageItems();
        });
    }

    private deleteUserPage(userpageID: number): void {
        this.userpageService
            .Delete(userpageID)
            .subscribe(() => {
                this.getUserPageItems();
            });
    }

    private onClose(): void {
        let count = 0;
        for (let x of this.userPages) {
            x.pageOrder = count;
            this.updateUserPage(x);
            count = count+1;
        }
    }

    private radio(userPage: UserPage): void {
        for (let x of this.userPages) {
            x.default = false;
            if (x == userPage) {
                x.default = true;
                this.updateUserPage(x);
            }
        }
    }

    private moveUp(userPage: UserPage): void {
        let temp = userPage.pageOrder;
        for (let x of this.userPages) {
            if (x.pageOrder == temp-1) {
                x.pageOrder = temp;
                userPage.pageOrder = temp-1;
            }
        }
        this.getUserPageItems();
    }

    //For use in ordering page items.
    private moveDown(userPage: UserPage): void {
    }
}