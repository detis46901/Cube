
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model'
import { Configuration } from '../../../../_api/api.constants'
import { LayerAdminService } from '../../../../_services/_layerAdmin.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { LayerPermission } from '../../../../_models/layer.model'
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
  selector: 'layer-permission',
  templateUrl: './layerPermission.component.html',
  styleUrls: ['./layerPermission.component.scss'],
  providers: [UserService, Configuration, LayerAdminService, LayerPermissionService]
})
export class LayerPermissionComponent implements OnInit{
@Input () layerID;
@Input () layerName;
closeResult: string;
public users: any;
public newlayerpermission = new LayerPermission;
public layerpermissions: any;
public token: string;
public userID: number;
public userperm: string;

    constructor(private layerPermissionService: LayerPermissionService, private userService: UserService, private dialog: MdDialog) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       //console.log(this.layeradmins.layer)
       //this.getGroupItems();
       //this.getRoleItems();
       this.getPermissionItems();
       this.getUserItems();
    }

    private initNewPermission(): void {
        console.log("initNewPermission");
        this.newlayerpermission.edit = null;
        this.newlayerpermission.userID = 0;
        console.log(this.newlayerpermission.userID)
    }


     private getPermissionItems(): void {
         console.log("Getting Permissions")
         this.layerPermissionService
            .GetSome(this.layerID)
            .subscribe((data:LayerPermission[]) => this.layerpermissions = data,
                error => console.log(error),
                () => console.log()
                );
    }

    private getUserItems(): void {
         this.userService
            .GetAll()
            .subscribe((data:User[]) => this.users = data,
                error => console.log(error),
                //() => console.log(this.departments[0].department)
                );
    }
 
private addLayerPermission(newlayerpermission) {
        this.newlayerpermission = newlayerpermission;
        this.newlayerpermission.layerAdminID = this.layerID
        console.log(this.newlayerpermission.userID);
        this.layerPermissionService
            .Add(this.newlayerpermission)
            .subscribe(result => {
               console.log(result);
              this.initNewPermission();
               this.getPermissionItems();
            })      
    }

    private updateLayerPermission(permission) {
        this.layerPermissionService
            .Update(permission)
            .subscribe(result => {
                console.log(result);
            })
    }

     private deleteLayerPermission(permissionID) {
        this.layerPermissionService
            .Delete(permissionID)
            .subscribe(result => {
                console.log(result);
                this.getPermissionItems();
            })
    }
}

/*This is how it should be, but creates errors.
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { Configuration } from '../../../../_api/api.constants';
import { LayerAdminService } from '../../../../_services/_layerAdmin.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { LayerPermission } from '../../../../_models/layer.model';
import { MdDialog, MdDialogRef } from '@angular/material';

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
    private users: User[];
    private newLayerPermission = new LayerPermission;
    private layerPermissions: LayerPermission[];
    private token: string;
    private userID: number;

    constructor(private layerPermissionService: LayerPermissionService, private userService: UserService, private dialog: MdDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
    }

    ngOnInit() {
        this.getPermissionItems();
        this.getUserItems();
    }

    private getPermissionItems(): void {
        this.layerPermissionService
            .GetSome(this.layerID)
            .subscribe(
                (data:LayerPermission[]) => {
                    return this.layerPermissions = data;
                },
                error => {
                    return console.log(error);
                }
            );
    }

    private getUserItems(): void {
        this.userService
            .GetAll()
            .subscribe(
                (data:User[]) => {
                    return this.users = data;
                },
                error => {
                    return console.log(error);
                }
            );
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
            .subscribe(result => {
                this.initNewPermission();
                this.getPermissionItems();
            });
    }

    private updateLayerPermission(permission: LayerPermission): void {
        this.layerPermissionService
            .Update(permission)
            .subscribe(result => {
                console.log(result);
            });
    }

    private deleteLayerPermission(permissionID: number): void {
        this.layerPermissionService
            .Delete(permissionID)
            .subscribe(result => {
                this.getPermissionItems();
            });
    }
}

*/