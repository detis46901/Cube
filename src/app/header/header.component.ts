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
    condition = false;

    public w3_open_close() {
        //document.getElementById("mySidenav").style.width = "20%";
        document.getElementById("mySidenav").style.display = "block";
        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("place-input").style.marginLeft = "265px";
        document.getElementById("goto").style.marginLeft = "565px";
        document.getElementById("add-marker").style.marginLeft = "610px";
        document.getElementById("remove-marker").style.marginLeft = "650px";
    }

    /*public w3_close() {
        document.getElementById("mySidenav").style.width = "0";
    }*/
}

//width:250px;background-color: rgba(255,255,255,.7);top:43px; bottom:200px (sidenav specs)