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

    private userPages = new Array<UserPage>();
    private newUserPage: string;
    private selectedPage: number;

    constructor(private userPageService: UserPageService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    ngOnInit() {
        this.getUserPageItems();       
    }

    private getUserPageItems(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data:UserPage[]) => {
                this.setupPages(data);
            });
    }
    
    private setupPages(userPages: Array<UserPage>): void {
        this.userPages = []
        for (let userPage of userPages) {
            this.userPages[userPage.pageOrder] = userPage

            if (userPage.default == true) {
                this.selectedPage = userPage.ID;
            }
        }
        for(let userPage of this.userPages) {
            if(userPage == undefined) {
                alert("Page list is incomplete. Error unhandled.")
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
                tempage.active = true;
                this.updateUserPage(tempage);
            }
        } 
    }

    private addUserPage(newUserPage: string): void {
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

    private updateUserPage(userPage: UserPage): void {
        this.userPageService
            .Update(userPage)
            .subscribe(() => {
                this.getUserPageItems();
            });
    }

    private openConfDel(userPage: UserPage): void {
        console.log("aisd;ioasjidnasi;dfjasdiolasdf")
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


    private deleteUserPage(userpageID: number): void {
        this.userPageService
            .Delete(userpageID)
            .subscribe(() => {
                //this.getUserPageItems();
            });
    }

    private decrementPageOrders(order: number) {
        for(let page of this.userPages) {
            if(page.pageOrder > order) {
                page.pageOrder = page.pageOrder - 1;
                this.updateUserPage(page);
            }
        }
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
        if(userPage.pageOrder != 0) {
            let swap = this.userPages[userPage.pageOrder-1]
            swap.pageOrder +=1
            userPage.pageOrder -= 1;
            this.updateUserPage(userPage);
            this.updateUserPage(swap);
        }
    }

    private moveDown(userPage: UserPage): void {
        if(userPage.pageOrder != this.userPages.length-1) {
            let swap = this.userPages[userPage.pageOrder+1]
            swap.pageOrder -=1
            userPage.pageOrder += 1;
            this.updateUserPage(userPage);
            this.updateUserPage(swap);
        }
    }
}