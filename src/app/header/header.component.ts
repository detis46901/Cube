import { Component, Input } from '@angular/core';
import { User } from '../../_models/user.model';
import { SideNavService } from "../../_services/sidenav.service";
import { MatDialog } from '@angular/material';
import { NewUserComponent } from '../admin/user/newUser/newUser.component';
import { UserComponent } from '../admin/user/user.component';
import { MatToolbar } from '@angular/material';

// declare var Vue: any;

// var vue = new Vue({
//     el: '#imgur',
//     data: {
//         image: '/avatar2.png'
//     }
// })

@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['header.component.scss'],
    providers: [SideNavService]
})

export class HeaderComponent { 
    @Input() user: User;
    @Input() screenCode: number = 0; 
    private isOpen: boolean;

    private imgURL = "avatar2.png"

    constructor(private sideNavService: SideNavService) {}

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

}