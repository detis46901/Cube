import { Component, Input, OnInit } from '@angular/core';
import { SideNavService } from "../../_services/sidenav.service";
import { MatDialog } from '@angular/material';
import { User, Notif } from '../../_models/user.model';
import { UserPage } from '../../_models/user.model';
import { UserService } from '../../_services/_user.service';
import { UserPageService } from '../../_services/_userPage.service';
import { NotifService } from '../../_services/notification.service';
import { GeocodingService } from '../map/services/geocoding.service';
import { PageComponent2 } from '../admin2/user/page/page.component'
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['header.component.scss'],
    providers: [SideNavService, UserService, UserPageService, NotifService]
})

export class HeaderComponent implements OnInit {
    //@Input() user: User;
    @Input() public id: string;
    @Input() public screenCode: number = 1;
    public isOpen: boolean;
    public isNotifOpen: boolean = false;
    public userHasUnread: boolean;
    public shaker;
    public userID: number;
    public currUser = new User;
    public userPages: UserPage[];
    public notifications: Notif[];
    public currUser$: Observable<User>;
    public public: boolean

    constructor(private sideNavService: SideNavService, private dialog: MatDialog, private userService: UserService, private userPageService: UserPageService, private notificationService: NotifService,
        public geocodingService: GeocodingService, private route: ActivatedRoute,) { }

    ngOnInit() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
        this.public = currentUser && currentUser.public;
        this.getUserItems()
        this.getUserPageItems()
        if (this.public == true) {
            this.geocodingService.isTracking == false
        } 
    }

    getObservable() {
        return this.userService.GetSingle(this.userID)
      }

    private getUserItems(): void {
        this.currUser$ = this.userService.GetSingle(this.userID)
        this.userService
            .GetSingle(this.userID)
            .subscribe((user: User) => {
                this.currUser = user;
                this.notificationService
                    .GetByUser(user.ID)
                    .subscribe((notifs: Notif[]) => {
                        this.notifications = notifs;
                        for (let n of notifs) {
                            if (!n.read) {
                                this.shakeNotifications()
                                return;
                            }
                        }
                    })
            })
    }

    private getUserPageItems(): void {
        this.userPageService
            .GetAll()
            .subscribe((data: UserPage[]) => {
                this.userPages = data;
            });
    }

    public openPages(userID: number, firstName: string, lastName: string): void {
        //fix this!!
         const dialogRef = this.dialog.open(PageComponent2);
         dialogRef.componentInstance.userID = this.userID;
         dialogRef.componentInstance.firstName = this.currUser.firstName;
         dialogRef.componentInstance.lastName = this.currUser.lastName;

         dialogRef.afterClosed()
             .subscribe(() => {
                 this.getUserPageItems();
             });
    }

    public menuToggle(sCode: number): void {
        if (this.sideNavService.getHidden() == null) {
            this.isOpen = true;
        } else {
            this.isOpen = this.sideNavService.getHidden();
        }
        switch (sCode) {
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
    public homeToggle(): void {

        // 2/2/18 What I was trying to do below is to get some typical menu functions (file, edit, view, etc.) available on the header navigation bar.
        //document.getElementById("headerCreateUserBtn").style.visibility = "hidden"; //Figure this out to appear only on admin/user. create buttons could go in header.

        if (!this.isOpen) {
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
        if (!this.isOpen) {
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
        if (!this.isOpen) {
            document.getElementById("settings_nav").style.display = "block";
            document.getElementById("settings_nav").style.width = "230px";
            this.sideNavService.toggleHidden();
        } else {
            document.getElementById("settings_nav").style.width = "0";
            document.getElementById("settings_nav").style.display = "none";
            this.sideNavService.toggleHidden();
        }
    }

    public openNotifications(id): void {
        //update notifs on click
        //
        // this.notificationService
        //     .GetByUser(this.userID)
        //     .subscribe((notifs: Notif[]) => {
        //         this.notifications = notifs
        document.getElementById('headerNotifications').classList.remove('shake');
        clearInterval(this.shaker)

        if (this.isNotifOpen) {
            document.getElementById("notificationMenu").style.display = "none";
        } else {
            document.getElementById("notificationMenu").style.display = "block";
            for (let n of this.notifications) {
                n.read = true;
                this.notificationService
                    .Update(n)
                    .subscribe()
            }
        }
        this.isNotifOpen = !this.isNotifOpen
        // })
    }

    public shakeNotifications(): void {
        this.shaker = setInterval(function () {
            document.getElementById('headerNotifications').classList.add('shake');
            setTimeout(function () {
                document.getElementById('headerNotifications').classList.remove('shake');
                console.log("second timeout")
            }, 1000)
        }, 3000)
    }

    public setTracking(track: boolean): void {
        this.geocodingService.setTracking(track)
        this.geocodingService.isTracking = track
    }
}