import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { SidenavService } from "../../_services/sidenav.service"

@Component({
    selector: 'sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['sidenav.component.css'],
    providers: [SidenavService]
})
export class SideNavComponent { 
    constructor(private sidenavService: SidenavService){}
    @Input() bottom : string
    @Input() popup : string

    ngOnInit() {
       console.log(this.bottom)
       //this.bottomtx = "Set from something"
    }

    //ngDoCheck() {console.log(this.popup)}

    public hideMenu() {
        this.onclick()
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("place-input").style.left = "15px";
        document.getElementById("goto").style.left = "15px";
        document.getElementById("add-marker").style.left = "15px";
        document.getElementById("remove-marker").style.left = "15px";
        console.log(this.sidenavService.getOpen())
    }

    public onclick() {
        this.sidenavService.setFalse();
        console.log(this.sidenavService.getOpen())
    }

}