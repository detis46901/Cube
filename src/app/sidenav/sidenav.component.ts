import { Component } from '@angular/core';

@Component({
    selector: 'sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['sidenav.component.css']
})
export class SideNavComponent { 
    public w3_close() {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("place-input").style.marginLeft = "15px";
        document.getElementById("goto").style.marginLeft = "315px";
        document.getElementById("add-marker").style.marginLeft = "360px";
        document.getElementById("remove-marker").style.marginLeft = "400px";
    }
}