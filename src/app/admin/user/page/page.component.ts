
import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { UserService } from '../../../../_services/user.service';
import { User } from '../../../../_models/user.model'
import { Configuration } from '../../../../_api/api.constants'
import { UserPageService } from '../../../../_services/userPage.service'
import { UserPage } from '../../../../_models/user.model'
import { FilterPipe } from '../../../../_pipes/rowfilter.pipe'
import { NumFilterPipe } from '../../../../_pipes/numfilter.pipe'
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { ConfirmdeleteComponent } from '../../confirmdelete/confirmdelete.component';


@Component({
  selector: 'page',
  templateUrl: './page.component.html',
  providers: [UserService, Configuration, FilterPipe, NumFilterPipe],
  styleUrls: ['./page.component.scss'],
})

export class PageComponent implements OnInit {
    @Input () userID;
    @Input () firstName;
    @Input () lastName;

    //for confirm delete dialog
    private objCode = 7;

    public user = new User;
    public userpage = new UserPage;
    public userpages: any;
    public token: string;
    public selecteduserpage: UserPage;
    public newuserpage: string;
    public selectedPage: number;


    constructor(private userpageService: UserPageService, private dialog: MdDialog) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        //this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
        this.getUserPageItems();
        //this.getGroupItems();
        //this.getRoleItems();
        
    }

    private getUserPageItems(): void {
        this.userpageService
        .GetSome(this.userID)
        .subscribe((data:UserPage[]) => this.setDefaultPage(data),
            error => console.log(error)
            );
        //console.log(this.userpages)
    }
    
    private setDefaultPage(userpages) {
        this.userpages = userpages 
        for (let userpage of userpages) {
            if (userpage.default == true) {
                this.selectedPage = userpage.ID
            }
        }
        //console.log("updating default userpage")
        console.log(this.selectedPage)
    }

    private updateDefaultPage(userpage) {
        console.log(userpage.page)
        for (let tempage of this.userpages) {
            if (tempage.default == true) {
                tempage.default = false
                this.updateUserPage(tempage)
            }
        }
        for (let tempage of this.userpages) {
            if (tempage.ID == userpage.ID) {
                tempage.default = true
                this.updateUserPage(tempage)
            }
        }
        //console.log(userpage.default)
    }

    private orderUserPages(up) { //this should order the pages
        this.userpages = up;
        console.log(this.userpages)
        /*console.log(up)
        let temp: number[] = []
        for (let x of up) {
            temp.push(x.pageOrder)
        }
        for (let i=0; i<up.length; i++) {
            console.log(temp[i])
            console.log(up[temp[i]])
            this.userpages[i] = up[temp[i]];
        }
        console.log(up[2])
        console.log(this.userpages)*/
    }

    private addUserPage(newuserpage) {
        console.log("addUserPage")
        this.userpage.page = newuserpage;
        this.userpage.userID = this.userID
        this.userpage.active = true;
        this.userpage.pageOrder = this.userpages.length
        this.userpage.default = false
        console.log(this.userpage.page, this.userpage.active);
        this.userpageService
            .Add(this.userpage)
            .subscribe(result => {
                console.log(result);
                this.getUserPageItems();
            })      
    }

    private updateUserPage(userpage) {
        //console.log(userpage)
        this.userpageService
            .Update(userpage)
            .subscribe(result => {
                //console.log(result);
                this.getUserPageItems();
            })
    }

    private openConfDel(userpage) {
        const dialogRef = this.dialog.open(ConfirmdeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = userpage.ID;
        dialogRef.componentInstance.objName = userpage.page;

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.deleteUserPage(userpage.ID)
            }
            this.getUserPageItems();
        })
    }

    private deleteUserPage(userpageID) {
        this.userpageService
            .Delete(userpageID)
            .subscribe(result => {
                console.log(result);
                this.getUserPageItems();
            })
    }

    private onClose() {
        console.log(this.userpages)
        let count= 0;
        for (let x of this.userpages) {
            x.pageOrder = count;
            this.updateUserPage(x)
            count = count+1
        }
        //this.activeModal.close()
    }

    private radio(userpage) {
        for (let x of this.userpages) {
            x.default = false
            if (x == userpage) {
                x.default = true;
                console.log("setting true")
                this.updateUserPage(x)
            }
        }
    }

    private moveUp(userpage) {
        //console.log(userpage)
        let temp = userpage.pageOrder;
        for (let x of this.userpages) {
            if (x.pageOrder == temp-1) {
                x.pageOrder = temp;
                userpage.pageOrder = temp-1;
            }
        }
        console.log(userpage.pageOrder);
        this.getUserPageItems();
    }

    private moveDown(userpage) {
        //console.log(userpage)
    }
}