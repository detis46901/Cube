import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { Configuration } from '../../../../_api/api.constants';
import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { LayerPermission } from '../../../../_models/layer.model';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'layer-permission',
    templateUrl: './layerPermission.component.html',
    styleUrls: ['./layerPermission.component.scss'],
    providers: [UserService, GroupService, Configuration, LayerService, LayerPermissionService]
})

export class LayerPermissionComponent implements OnInit {
    @Input() layerID: number;
    @Input() layerName: string;
    private closeResult: string;
    private permlessUsers = new Array<User>();
    private permlessGroups = new Array<Group>();
    private newLayerPermission = new LayerPermission;
    private layerPermissions = new Array<LayerPermission>();
    private token: string;
    private userID: number;
    private permNames = new Array<string>();
    private layerOwner: number;
    private isGroup: boolean = false;

    constructor(private layerPermissionService: LayerPermissionService, private userService: UserService, private groupService: GroupService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getPermissionItems();
        this.newLayerPermission.edit = false;
        this.newLayerPermission.delete = false;
        this.newLayerPermission.owner = false;
        this.newLayerPermission.canGrant = false;

        //Initialize mat-slide-toggle state to user
        //this.isUser = true;
    }

    private getPermissionItems(): void {
        this.permNames = [];
        this.layerPermissionService
            .GetByLayer(this.layerID)
            .subscribe((data:LayerPermission[]) => {
                this.layerPermissions = data;
                for(let p of data) {
                    //If permission applies to a user
                    if(p.userID && !p.groupID) {
                        if(p.owner) {
                            this.layerOwner = p.userID
                        }
                        this.userService
                            .GetSingle(p.userID)
                            .subscribe((u: User) => {
                                //Add name to an array for interpolation under "Current Permissions"
                                this.permNames.push(u.firstName + " " + u.lastName);
                            });
                    //If permission applies to a group
                    } else if(p.groupID && !p.userID) {
                        this.groupService
                            .GetSingle(p.groupID)
                            .subscribe((g: Group) => {
                                //Add name to an array for interpolation under "Current Permissions"
                                this.permNames.push(g.name);
                            });
                    }
                }
                this.getUserItems();
                this.getGroupItems();
            });
    }

    private getUserItems(): void {
        this.permlessUsers = [];
        this.userService
            .GetAll()
            .subscribe((data:User[]) => {             
                for(let u of data) {
                    //If no existing permission exists for the user
                    if(this.permNames.indexOf(u.firstName + " " + u.lastName) == -1) {
                        this.permlessUsers.push(u);
                    }
                }
            });
    }

    private getGroupItems(): void {
        this.permlessGroups = [];
        this.groupService
            .GetAll()
            .subscribe((data:Group[]) => {             
                for(let g of data) {
                    //If no existing permission exists for the group
                    if(this.permNames.indexOf(g.name) == -1) {
                        this.permlessGroups.push(g);
                    }
                }
            });
    }
    
    private initNewPermission(): void {
        this.newLayerPermission.edit = false;
        this.newLayerPermission.delete = false;
        this.newLayerPermission.owner = false;
        this.newLayerPermission.canGrant = false;
        this.newLayerPermission.grantedBy = null;
        this.newLayerPermission.comments = null;
        this.newLayerPermission.userID = null;
        this.newLayerPermission.layerID = null;
        this.newLayerPermission.groupID = null;
    }

    private addLayerPermission(newLayerPermission: LayerPermission): void {
        this.newLayerPermission = newLayerPermission;
        this.newLayerPermission.layerID = this.layerID;
        this.newLayerPermission.grantedBy = this.userID;
        
        this.layerPermissionService
            .Add(this.newLayerPermission)
            .subscribe(() => {
                this.initNewPermission();
                this.getPermissionItems();
            });
    }

    private updateLayerPermission(permission: LayerPermission): void {
        this.layerPermissionService
            .Update(permission)
            .subscribe();
    }

    private updateLayerPermissions(): void {
        for(let p of this.layerPermissions) {
            this.updateLayerPermission(p)
        }
    }

    private deleteLayerPermission(permissionID: number): void {
        this.layerPermissionService
            .Delete(permissionID)
            .subscribe(() => {
                this.getPermissionItems();
            });
    }

    private switchPermType() {
        this.isGroup = !this.isGroup;

        // 2/2/18: Find a way to accomplish this without having to click control twice as-is currently
        /* if(this.isGroup) {
            document.getElementById('layerPermNewUser').style.display = "inline";
            document.getElementById('layerPermNewGroup').style.display = "none";
        } else {
            document.getElementById('layerPermNewUser').style.display = "none";
            document.getElementById('layerPermNewGroup').style.display = "inline";
        } */
    }
}