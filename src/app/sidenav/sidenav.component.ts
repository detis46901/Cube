import { Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { SideNavService } from "../../_services/sidenav.service"
import { LayerPermissionService } from "../../_services/_layerPermission.service"

@Component({
    moduleId: module.id,
    selector: 'sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['sidenav.component.scss'],
    providers: [SideNavService, LayerPermissionService]
})
export class SideNavComponent implements OnInit { 
    private flag = 0;
    private token: string;
    private userID: number;

    constructor(private sideNavService: SideNavService, private layerPermissionService: LayerPermissionService) {
         // subscribe to map component messages
         let currentUser = JSON.parse(localStorage.getItem('currentUser'));
         this.token = currentUser && currentUser.token;
         this.userID = currentUser && currentUser.userID;
    } 

    @Input() canEdit: boolean;
    @Input() myCubeData: any;
    
    ngOnInit() {
        let json = <JSON>this.myCubeData
        this.hideMenu()
    }

    public hideMenu() {
        this.sideNavService.toggleHidden();
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
        this.myCubeData = ""
    }
}