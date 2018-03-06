import { Component, Input, OnInit } from '@angular/core';
import { SideNavService } from "../../_services/sidenav.service";
import { MatDialog } from '@angular/material';
import { NewUserComponent } from '../admin/user/newUser/newUser.component';
import { UserComponent } from '../admin/user/user.component';
import { MatToolbar } from '@angular/material';
import { PageComponent } from '../admin/user/page/page.component'
import { User } from '../../_models/user.model';
import { UserPage } from '../../_models/user.model';
import { UserService } from '../../_services/_user.service';
import { UserPageService } from '../../_services/_userPage.service';
import { NotificationService } from '../../_services/notification.service';

@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['header.component.scss'],
    providers: [SideNavService, UserService, UserPageService]
})

export class HeaderComponent implements OnInit {
    @Input() user: User;
    @Input() screenCode: number = 0; 
    private isOpen: boolean;
    private isNotifOpen: boolean = false;

    private token: string;
    private userID: number;

    private currUser: User;
    private userPages: UserPage[];

    constructor(private sideNavService: SideNavService, private dialog: MatDialog, private userService: UserService, private userPageService: UserPageService, private notificationService: NotificationService ) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
        console.log(this.user)
    }

    ngOnInit() {
        this.getUserItems()
        this.getUserPageItems()
    }

    private getUserItems(): void {
        this.userService
            .GetSingle(this.userID)
            .subscribe((user: User) => {
                this.currUser = user
            })
    }

    private getUserPageItems(): void {
        this.userPageService
            .GetAll()
            .subscribe((data: UserPage[]) => {
                this.userPages = data;
            });
    }

    private openPages(userID: number, firstName: string, lastName: string): void {
        const dialogRef = this.dialog.open(PageComponent);
        dialogRef.componentInstance.userID = this.userID;
        dialogRef.componentInstance.firstName = this.currUser.firstName;
        dialogRef.componentInstance.lastName = this.currUser.lastName;

        dialogRef.afterClosed()
        .subscribe(() => {
            this.getUserPageItems();
        });
    }

    private menuToggle(sCode: number): void {
        if (this.sideNavService.getHidden() == null) {
            this.isOpen = true;
        } else {
            this.isOpen = this.sideNavService.getHidden();
        }

        switch(sCode) {
            case 0:
                //throw exception here for a call without a screen code (will default to 0 as assigned above)
                console.log("Exception")
                break;
            case 1:
                console.log("homeToggle()")
                this.homeToggle();
                break;
            case 2:
                console.log("adminToggle()")
                this.adminToggle();
                break;
            case 3:
                console.log("userToggle()")
                this.userToggle();
                break;
            default:
                console.log("Exception")
        }
    }

    //Code 1
    private homeToggle(): void {

        // 2/2/18 What I was trying to do below is to get some typical menu functions (file, edit, view, etc.) available on the header navigation bar.
        //document.getElementById("headerCreateUserBtn").style.visibility = "hidden"; //Figure this out to appear only on admin/user. create buttons could go in header.

        if(!this.isOpen) {
            document.getElementById("mySidenav").style.display = "block";
            document.getElementById("mySidenav").style.width = "250px";
            document.getElementById("place-input").style.position = "absolute";
            document.getElementById("place-input").style.left = "265px";
            document.getElementById("goto").style.position = "absolute";
            document.getElementById("goto").style.left = "265px";
            document.getElementById("add-marker").style.position = "absolute";
            document.getElementById("add-marker").style.left = "280px";
            document.getElementById("remove-marker").style.position = "absolute";
            document.getElementById("remove-marker").style.left = "320px";
            this.sideNavService.toggleHidden();
        } else {
            document.getElementById("mySidenav").style.width = "0";
            document.getElementById("place-input").style.left = "15px";
            document.getElementById("goto").style.left = "15px";
            document.getElementById("add-marker").style.left = "30px";
            document.getElementById("remove-marker").style.left = "70px";
            this.sideNavService.toggleHidden();
        }

        this.isOpen = this.sideNavService.getHidden();
    }

    //Code 2
    public adminToggle() {
        document.getElementById("headerCreateUserBtn").style.visibility = "visible";
        if(!this.isOpen) {
            document.getElementById("admin_nav").style.display = "block";
            document.getElementById("admin_nav").style.width = "230px";
            this.sideNavService.toggleHidden();
        } else {
            document.getElementById("admin_nav").style.width = "0";
            document.getElementById("admin_nav").style.display = "none";
            this.sideNavService.toggleHidden();
        }
    }

    //Code 3
    public userToggle() {
        document.getElementById("headerCreateUserBtn").style.visibility = "hidden";
        if(!this.isOpen) {
            document.getElementById("settings_nav").style.display = "block";
            document.getElementById("settings_nav").style.width = "230px";
            this.sideNavService.toggleHidden();
        } else {
            document.getElementById("settings_nav").style.width = "0";
            document.getElementById("settings_nav").style.display = "none";
            this.sideNavService.toggleHidden();
        }
    }

    private openNewUser(): void {
        // const dialogRef = this.dialog.open(NewUserComponent, {height:'370px', width:'500px'});
        // dialogRef.afterClosed()
        // .subscribe(() => {
        //     this.getUserItems();
        //     this.getUserPageItems();
        // });
    }

    private openNotifications(id): void {
        console.log("notif opened")
        if(this.isNotifOpen) {
            document.getElementById("notificationMenu").style.display = "none";
        } else {
            document.getElementById("notificationMenu").style.display = "inline-block";
        }
        this.isNotifOpen = !this.isNotifOpen
    }
}