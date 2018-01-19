import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { Configuration } from '../../../../_api/api.constants';
import { LayerAdminService } from '../../../../_services/_layerAdmin.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { LayerPermission } from '../../../../_models/layer.model';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'layer-permission',
    templateUrl: './layerPermission.component.html',
    styleUrls: ['./layerPermission.component.scss'],
    providers: [UserService, Configuration, LayerAdminService, LayerPermissionService]
})

export class LayerPermissionComponent implements OnInit {
    @Input() layerID: number;
    @Input() layerName: string;
    private closeResult: string;
    private users = new Array<User>();
    private newLayerPermission = new LayerPermission;
    private layerPermissions = new Array<LayerPermission>();
    private token: string;
    private userID: number;
    private permNames = new Array<string>();
    private layerOwner: number;

    constructor(private layerPermissionService: LayerPermissionService, private userService: UserService, private dialog: MatDialog) {
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
    }

    private getPermissionItems(): void {
        this.permNames = [];
        this.layerPermissionService
            .GetByLayer(this.layerID)
            .subscribe((data:LayerPermission[]) => {
                this.layerPermissions = data;
                for(let p of data) {
                    if(p.owner) {
                        this.layerOwner = p.userID
                    }
                    this.userService
                        .GetSingle(p.userID)
                        .subscribe((u: User) => {
                            this.permNames.push(u.firstName + " " + u.lastName);
                            console.log(this.permNames[0])
                        });

                    //if(!(p.userID == this.users. ))
                }
                this.getUserItems()    
            });
    }

    private getUserItems(): void {
        this.users = [];
        this.userService
            .GetAll()
            .subscribe((data:User[]) => {             
                for(let u of data) {
                    if(this.permNames.indexOf(u.firstName + " " + u.lastName) == -1) {
                        this.users.push(u);
                    }
                }
                console.log(this.users);
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
        this.newLayerPermission.layerAdminID = null;
        this.newLayerPermission.groupID = null;
    }

    private addLayerPermission(newLayerPermission: LayerPermission): void {
        this.newLayerPermission = newLayerPermission;
        this.newLayerPermission.layerAdminID = this.layerID;
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
            .subscribe((res) => {
                console.log(res)
            });
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
}