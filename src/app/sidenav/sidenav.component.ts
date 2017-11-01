import { Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { SidenavService } from "../../_services/sidenav.service"

@Component({
    moduleId: module.id,
    selector: 'sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['sidenav.component.scss'],
    providers: [SidenavService]
})
export class SideNavComponent implements OnInit { 
    constructor(private sidenavService: SidenavService){
         // subscribe to map component messages
         
        } 
    @Input() mycubedata: any;
    
    ngOnInit() {
        let json = <JSON>this.mycubedata
        console.log("SideName" + json.parse[0])
    }

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
    private clearMessage(): void {
        this.mycubedata = ""
    }
}