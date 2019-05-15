import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { Configuration } from '../../../../_api/api.constants';
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service';
import { ModulePermissionService } from '../../../../_services/_modulePermission.service';
import { ModulePermission } from '../../../../_models/module.model';

@Component({
    selector: 'module-permission',
    templateUrl: './modulePermission.component.html',
    styleUrls: ['./modulePermission.component.scss'],
    providers: [UserService, GroupService, Configuration, ModuleInstanceService, ModulePermissionService]
})

export class ModulePermissionComponent implements OnInit {
    @Input() instanceID: number;
    @Input() instanceName: string;
    public closeResult: string;
    public permlessUsers = new Array<User>();
    public permlessGroups = new Array<Group>();
    public newModulePermission = new ModulePermission;
    public modulePermissions = new Array<ModulePermission>();
    public token: string;
    public userID: number;
    public permNames = new Array<string>();
    public instanceOwner: number;
    public isGroup: boolean = false;

    public currDeletedPermObj: any; //Group or User Object
    public currDeletedPermIsUser: boolean; //True if it is a User object from the permission.

    constructor(private modulePermissionService: ModulePermissionService, private userService: UserService, private groupService: GroupService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getPermissionItems(false);
        this.newModulePermission.edit = false;
        this.newModulePermission.delete = false;
        this.newModulePermission.owner = false;
        this.newModulePermission.canGrant = false;

        //Initialize mat-slide-toggle state to user
        //this.isUser = true;
    }

    public getPermissionItems(calledByDelete: boolean): void {
        this.modulePermissionService
            .GetByInstance(this.instanceID)
            .subscribe((data: ModulePermission[]) => {
                console.log(data)
                this.modulePermissions = data;
                for (let p of data) {
                    //If permission applies to a user
                    if (p.userID && !p.groupID) {
                        //If user is the owner of the instance
                        if (p.owner) {
                            this.instanceOwner = p.userID
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
        this.newModulePermission.edit = false;
        this.newModulePermission.delete = false;
        this.newModulePermission.owner = false;
        this.newModulePermission.canGrant = false;
        this.newModulePermission.grantedBy = null;
        this.newModulePermission.comments = null;
        this.newModulePermission.userID = null;
        this.newModulePermission.moduleInstanceID = null;
        this.newModulePermission.groupID = null;
    }

    public addModulePermission(newModulePermission: ModulePermission): void {
        this.newModulePermission = newModulePermission;
        this.newModulePermission.moduleInstanceID = this.instanceID;
        this.newModulePermission.grantedBy = this.userID;

        this.modulePermissionService
            .Add(this.newModulePermission)
            .subscribe(() => {
                this.initNewPermission();
                this.getPermissionItems(false);
            });
    }

    public updateModulePermission(permission: ModulePermission): void {
        this.modulePermissionService
            .Update(permission)
            .subscribe(() => {
                this.initNewPermission();
                this.getPermissionItems(false);
            });
    }

    public updateModulePermissions(): void {
        for (let p of this.modulePermissions) {
            this.updateModulePermission(p)
        }
    }

    // 2/8/18: permless users/groups are not being updated correctly once an object is deleted. Object deletion should add the object that was 
    // deleted to the correct permless list
    public deleteModulePermission(perm: ModulePermission): void {
        this.currDeletedPermObj = perm
        //perm.groupID ? this.currDeletedPermIsUser=false : this.currDeletedPermIsUser=true;

        if (!perm.groupID) {
            this.currDeletedPermIsUser = true;
        } else {
            this.currDeletedPermIsUser = false;
        }

        this.modulePermissionService
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