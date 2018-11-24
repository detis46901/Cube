import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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


    ngOnInit() {
        this.hideMenu()
    }

    public hideMenu() {
        this.sideNavService.toggleHidden();
        document.getElementById("mySidenav").style.width = "0";
    }
}