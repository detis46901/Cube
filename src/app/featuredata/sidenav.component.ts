import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable ,  Subscription } from 'rxjs';
import { LayerPermissionService } from "../../_services/_layerPermission.service"

@Component({
    moduleId: module.id,
    selector: 'sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['sidenav.component.scss'],
    providers: [LayerPermissionService]
})
export class SideNavComponent implements OnInit {
    private flag = 0;
    private token: string;
    private userID: number;

    constructor(private layerPermissionService: LayerPermissionService) {
        // subscribe to map component messages
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }


    ngOnInit() {
        this.hideMenu()
    }

    public hideMenu() {
        document.getElementById("mySidenav").style.width = "0";
    }
}