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

    constructor(private layerPermissionService: LayerPermissionService, private userService: UserService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
    }

    ngOnInit() {
        this.getPermissionItems();
        console.log(this.permNames)
        this.getUserItems();
    }

    private getPermissionItems(): void {
        this.layerPermissionService
            .GetSome(this.layerID)
            .subscribe((data:LayerPermission[]) => {
                this.layerPermissions = data;
                for(let p of data) {
                    this.userService
                        .GetSingle(p.userID)
                        .subscribe((u: User) => {
                            this.permNames.push(u.firstName + " " + u.lastName);
                            console.log(this.permNames[0])
                        });
                }
                //this.getUserItems()    
            });
    }

    private getUserItems(): void {
        this.userService
            .GetAll()
            .subscribe((data:User[]) => {
                // for(let u of data) {
                //     if(u.ID != this.layerPermissions[data.indexOf(u)].userID) {
                //         this.users.push(u);
                //     }
                // }
                this.users = data;
            });
    }
    
    private initNewPermission(): void {
        this.newLayerPermission.edit = null;
        this.newLayerPermission.userID = 0;
    }

    private addLayerPermission(newLayerPermission: LayerPermission): void {
        this.newLayerPermission = newLayerPermission;
        this.newLayerPermission.layerAdminID = this.layerID;
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
            .subscribe(() => {});
    }

    private deleteLayerPermission(permissionID: number): void {
        this.layerPermissionService
            .Delete(permissionID)
            .subscribe(() => {
                this.getPermissionItems();
            });
    }
}