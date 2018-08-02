import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { Configuration } from '../../../../_api/api.constants';
import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { Layer } from '../../../../_models/layer.model';
import { layer } from 'openlayers';

@Component({
    selector: 'layer-permission',
    templateUrl: './layerStyle.component.html',
    styleUrls: ['./layerStyle.component.scss'],
    providers: [UserService, GroupService, Configuration, LayerService, LayerPermissionService]
})

export class LayerStyleComponent implements OnInit {
    @Input() layerID: number;
    @Input() layerName: string;
    private closeResult: string;
    private layer: Layer
    private defaultStyle: string;
    private permlessUsers = new Array<User>();
    private permlessGroups = new Array<Group>();
    private token: string;
    private userID: number;
    private permNames = new Array<string>();
    private layerOwner: number;
    private isGroup: boolean = false;

    private currDeletedPermObj: any; //Group or User Object
    private currDeletedPermIsUser: boolean; //True if it is a User object from the permission.

    constructor(private layerService: LayerService, private userService: UserService, private groupService: GroupService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getLayerItem(false);
        this.layer = new Layer
        this.defaultStyle = ""
        // this.newLayerPermission.edit = false;
        // this.newLayerPermission.delete = false;
        // this.newLayerPermission.owner = false;
        // this.newLayerPermission.canGrant = false;

        //Initialize mat-slide-toggle state to user
        //this.isUser = true;
    }

    private getLayerItem(calledByDelete: boolean): void {
        this.layerService
            .GetSingle(this.layerID)
            .subscribe((data: Layer) => {
                this.layer = data;
                this.defaultStyle = JSON.stringify(this.layer.defaultStyle)
            });
    }

    //2/9/18 this is the last part that needs fixed to get the list to return correctly
    private getUserItems(calledByDelete: boolean): void {
        this.permlessUsers = [];

        if (this.currDeletedPermIsUser == true && calledByDelete) {
            //this.permlessUsers.push(this.currDeletedPermObj)
            this.currDeletedPermIsUser = null;
            this.currDeletedPermObj = null;
        }

        this.userService
            .GetAll()
            .subscribe((data: User[]) => {
                for (let u of data) {
                    //If no existing permission exists for the user
                    if (this.permNames.indexOf(u.firstName + " " + u.lastName) == -1) {
                        this.permlessUsers.push(u);
                    }
                }
            });
    }

    //2/9/18 this is the last part that needs fixed to get the list to return correctly
    private getGroupItems(calledByDelete: boolean): void {
        this.permlessGroups = [];

        if (this.currDeletedPermIsUser == false && calledByDelete) {
            //this.permlessGroups.push(this.currDeletedPermObj)
            this.currDeletedPermIsUser = null;
            this.currDeletedPermObj = null;
        }

        this.groupService
            .GetAll()
            .subscribe((data: Group[]) => {
                for (let g of data) {
                    //If no existing permission exists for the group
                    if (this.permNames.indexOf(g.name) == -1) {
                        this.permlessGroups.push(g);
                    }
                }
            });
    }


    private updateLayerStyle(layer: Layer): void {
        this.layer.defaultStyle = JSON.parse(this.defaultStyle);
        this.layerService
            .Update(layer)
            .subscribe((result) => {
                this.getLayerItem(false);
            });
    }
}