import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { SidenavService } from "../../_services/sidenav.service"

@Component({
    selector: 'sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['sidenav.component.scss'],
    providers: [SidenavService]
})
export class SideNavComponent { 
    constructor(private sidenavService: SidenavService){}
    @Input() bottom : string
    @Input() popup : string

    ngOnInit() {}

    public hideMenu() {
        this.sidenavService.toggleHidden();
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("place-input").style.left = "15px";
        document.getElementById("goto").style.left = "15px";
        document.getElementById("add-marker").style.left = "30px";
        document.getElementById("remove-marker").style.left = "70px";
    }

    drawLineClick() {

    }

    drawPointClick() {

    }

    drawPolygonClick() {
        
    }
}