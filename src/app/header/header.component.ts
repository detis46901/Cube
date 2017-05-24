import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { User } from '../../_models/user-model'

@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['header.component.css'] 
})
export class HeaderComponent { 
    
    constructor() {}
    /*constructor(private renderer: Renderer2) {
    }
    onInit(element: HTMLElement){
        this.renderer.createElement(element, )
    } Maybe this is how to render the static pngs*/

    @Input() user: User
    //@Input() isHome = false; //Not currently being used
    @Input() screenCode = 0; //1 for home (map) screen, 2 for admin menu screen, 3 for user settings screen
    @Input() isOpen = false;

    public menu_toggle(sCode) {
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


    //Code 1
    public home_toggle() {
        if(!this.isOpen) {
            document.getElementById("mySidenav").style.display = "block";
            document.getElementById("mySidenav").style.width = "250px";
            document.getElementById("place-input").style.marginLeft = "265px";
            document.getElementById("goto").style.marginLeft = "565px";
            document.getElementById("add-marker").style.marginLeft = "610px";
            document.getElementById("remove-marker").style.marginLeft = "650px";
        }
        else {
            document.getElementById("mySidenav").style.width = "0";
            document.getElementById("place-input").style.marginLeft = "15px";
            document.getElementById("goto").style.marginLeft = "315px";
            document.getElementById("add-marker").style.marginLeft = "360px";
            document.getElementById("remove-marker").style.marginLeft = "400px";
        }
        this.isOpen = !this.isOpen
    }

    //Code 2
    public admin_toggle() {
        if(!this.isOpen) {
            document.getElementById("admin_nav").style.display = "block";
            document.getElementById("admin_nav").style.width = "230px";
        }
        else {
            document.getElementById("admin_nav").style.width = "0";
            document.getElementById("admin_nav").style.display = "none";
        }
        this.isOpen = !this.isOpen
    }

    //Code 3
    public user_toggle() {
        if(!this.isOpen) {
            document.getElementById("settings_nav").style.display = "block";
            document.getElementById("settings_nav").style.width = "230px";
        }
        else {
            document.getElementById("settings_nav").style.width = "0";
            document.getElementById("settings_nav").style.display = "none";
        }
        this.isOpen = !this.isOpen
    }

    /*public w3_close() {
        document.getElementById("mySidenav").style.width = "0";
    }*/
}

//width:250px;background-color: rgba(255,255,255,.7);top:43px; bottom:200px (sidenav specs)