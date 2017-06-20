import { Component, Input, Output, OnInit, Renderer2, EventEmitter } from '@angular/core';
import { User } from '../../_models/user-model'
import { SidenavService } from "../../_services/sidenav.service"

@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['header.component.css'],
    providers: [SidenavService]
})
export class HeaderComponent { 
    
    constructor(private sidenavService: SidenavService) {}
    /*constructor(private renderer: Renderer2) {
    }
    onInit(element: HTMLElement){
        this.renderer.createElement(element, )
    } Maybe this is how to render the static pngs*/

    @Input() user: User
    //@Input() isHome = false; //Not currently being used
    @Input() screenCode = 0; //1 for home (map) screen, 2 for admin menu screen, 3 for user settings screen
    //@Output() open: EventEmitter<boolean> = new EventEmitter<boolean>();

    public isOpen: boolean;

    public menu_toggle(sCode) {
        //console.log(this.sidenavService.getOpen()) //should be getting false after hit from line 27 of sidenav component
        if (this.sidenavService.getOpen() == null) {
            this.isOpen = true;
        }
        else {
            this.isOpen = this.sidenavService.getOpen();
        }
        console.log(this.isOpen)
        switch(sCode) {
            case 0: 
                //throw exception here for a call without a screen code (will default to 0 as assigned above)
                break
            case 1:
                this.home_toggle()
                break
            case 2:
                this.admin_toggle()
                break
            case 3:
                this.user_toggle()
                break
        }
    }

    public showCons() {
        console.log(this.sidenavService.getOpen())
    }

    //Code 1
    public home_toggle() {
        if(!this.isOpen) {
            document.getElementById("mySidenav").style.display = "block";
            document.getElementById("mySidenav").style.width = "250px";
            document.getElementById("place-input").style.position = "absolute";
            document.getElementById("place-input").style.left = "265px";
            document.getElementById("goto").style.position = "absolute";
            document.getElementById("goto").style.left = "265px";
            document.getElementById("add-marker").style.position = "absolute";
            document.getElementById("add-marker").style.left = "265px";
            document.getElementById("remove-marker").style.position = "absolute";
            document.getElementById("remove-marker").style.left = "265px";
            this.sidenavService.setTrue();
        }
        else {
            document.getElementById("mySidenav").style.width = "0";
            document.getElementById("place-input").style.left = "15px";
            document.getElementById("goto").style.left = "15px";
            document.getElementById("add-marker").style.left = "15px";
            document.getElementById("remove-marker").style.left = "15px";
            this.sidenavService.setFalse();
        }
        //this.isOpen = !this.isOpen
        //this.open.emit(this.isOpen)
        this.isOpen = this.sidenavService.getOpen()
        console.log(this.sidenavService.getOpen())
    }

    //Code 2
    public admin_toggle() {
        if(!this.isOpen) {
            document.getElementById("admin_nav").style.display = "block";
            document.getElementById("admin_nav").style.width = "230px";
            this.sidenavService.setTrue();
        }
        else {
            document.getElementById("admin_nav").style.width = "0";
            document.getElementById("admin_nav").style.display = "none";
            this.sidenavService.setFalse();
        }
        //this.isOpen = !this.isOpen
        //this.open.emit(this.isOpen)
    }

    //Code 3
    public user_toggle() {
        if(!this.isOpen) {
            document.getElementById("settings_nav").style.display = "block";
            document.getElementById("settings_nav").style.width = "230px";
            this.sidenavService.setTrue();
        }
        else {
            document.getElementById("settings_nav").style.width = "0";
            document.getElementById("settings_nav").style.display = "none";
            this.sidenavService.setFalse();
        }
        //this.isOpen = !this.isOpen
        //this.open.emit(this.isOpen)
    }

    /*public w3_close() {
        document.getElementById("mySidenav").style.width = "0";
    }*/
}

//width:250px;background-color: rgba(255,255,255,.7);top:43px; bottom:200px (sidenav specs)