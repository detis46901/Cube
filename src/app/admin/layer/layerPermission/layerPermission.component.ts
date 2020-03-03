import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { Configuration } from '../../../../_api/api.constants';
import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { LayerPermission } from '../../../../_models/layer.model';

@Component({
    selector: 'layer-permission',
    templateUrl: './layerPermission.component.html',
    styleUrls: ['./layerPermission.component.scss'],
    providers: [UserService, GroupService, Configuration, LayerService, LayerPermissionService]
})

export class LayerPermissionComponent implements OnInit {
    @Input() layerID: number;
    @Input() layerName: string;
    public closeResult: string;
    public permlessUsers = new Array<User>();
    public permlessGroups = new Array<Group>();
    public newLayerPermission = new LayerPermission;
    public layerPermissions = new Array<LayerPermission>();
    public userID: number;
    public permNames = new Array<string>();
    public layerOwner: number;
    public isGroup: boolean = false;

    public currDeletedPermObj: any; //Group or User Object
    public currDeletedPermIsUser: boolean; //True if it is a User object from the permission.

    constructor(private layerPermissionService: LayerPermissionService, private userService: UserService, private groupService: GroupService) {}

    ngOnInit() {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
        this.getPermissionItems(false);
        this.newLayerPermission.edit = false;
        this.newLayerPermission.delete = false;
        this.newLayerPermission.owner = false;
        this.newLayerPermission.canGrant = false;

        //Initialize mat-slide-toggle state to user
        //this.isUser = true;
    }

    public getPermissionItems(calledByDelete: boolean): void {
        this.layerPermissionService
            .GetByLayer(this.layerID)
            .subscribe((data: LayerPermission[]) => {
                this.layerPermissions = data;
                console.log(data)
                for (let p of data) {
                    //If permission applies to a user
                    if (p.userID && !p.groupID) {
                        //If user is the owner of the layer
                        if (p.owner) {
                            this.layerOwner = p.userID
                        }
                        this.userService
                            .GetSingle(p.userID)
                            .subscribe((u: User) => {
                                //Add name to an array for checking for "Permissionless" users
                                this.permNames.push(u.firstName + " " + u.lastName);
                            });
                        //If permission applies to a group
                    } else if (p.groupID && !p.userID) {
                        this.groupService
                            .GetSingle(p.groupID)
                            .subscribe((g: Group) => {
                                //Add name to an array for checking for "Permissionless" groups
                                this.permNames.push(g.name);
                            });
                    }
                }
                this.getUserItems(calledByDelete);
                this.getGroupItems(calledByDelete);
            });
    }

    //2/9/18 this is the last part that needs fixed to get the list to return correctly
    public getUserItems(calledByDelete: boolean): void {
        this.permlessUsers = [];

        if (this.currDeletedPermIsUser == true && calledByDelete) {
            this.permlessUsers.push(this.currDeletedPermObj)
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
    public getGroupItems(calledByDelete: boolean): void {
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

    public initNewPermission(): void {
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

    public addLayerPermission(newLayerPermission: LayerPermission): void {
        this.newLayerPermission = newLayerPermission;
        this.newLayerPermission.layerID = this.layerID;
        this.newLayerPermission.grantedBy = this.userID;

        this.layerPermissionService
            .Add(this.newLayerPermission)
            .subscribe(() => {
                this.initNewPermission();
                this.getPermissionItems(false);
            });
    }

    public updateLayerPermission(permission: LayerPermission): void {
        this.layerPermissionService
            .Update(permission)
            .subscribe(() => {
                this.initNewPermission();
                this.getPermissionItems(false);
            });
    }

    public updateLayerPermissions(): void {
        for (let p of this.layerPermissions) {
            this.updateLayerPermission(p)
        }
    }

    // 2/8/18: permless users/groups are not being updated correctly once an object is deleted. Object deletion should add the object that was
    // deleted to the correct permless list
    public deleteLayerPermission(perm: LayerPermission): void {
        this.currDeletedPermObj = perm
        //perm.groupID ? this.currDeletedPermIsUser=false : this.currDeletedPermIsUser=true;

        if (!perm.groupID) {
            this.currDeletedPermIsUser = true;
        } else {
            this.currDeletedPermIsUser = false;
        }

        this.layerPermissionService
            .Delete(perm.ID)
            .subscribe(() => {
                this.initNewPermission();
                this.getPermissionItems(true);
            });
    }

    public switchPermType() {
        this.isGroup = !this.isGroup;
    }
}
