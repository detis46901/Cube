import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { UserPage } from '../../../../_models/user.model';
import { Group, GroupMember } from '../../../../_models/group.model';
import { GroupService } from '../../../../_services/_group.service';
import { GroupMemberService } from '../../../../_services/_groupMember.service';
import { UserPageLayer, LayerPermission } from '../../../../_models/layer.model';
import { UserPageInstance, ModulePermission } from '../../../../_models/module.model'
import { UserPageService } from '../../../../_services/_userPage.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ModulePermissionService } from '../../../../_services/_modulePermission.service'
import { UserPageLayerService } from '../../../../_services/_userPageLayer.service';
import { UserPageInstanceService } from '../../../../_services/_userPageInstance.service'
import { MatDialog, MatDialogRef } from '@angular/material';
import { MapConfig } from '../../../map/models/map.model';

/************************************************************************************************************************************************************
* 2/9/18: All changes that need to happen  (Mark off as you complete)                                                                                       *
*                                                                                                                                                           *
* -"Layers" (UserPageLayers) accordion menu on map must update when a UPL is added to the current page (This may require this module sending an             *
*   observable to a listener on the other end)                                                                                                              *
* -pageConfig dialog needs to have a similar system to layerPerm like "permless" list, but with layers that have already been added to UPL (deduplication)  *
* -All group handling must be accomplished:                                                                                                                 *
* 1.) Available UPL options granted by Group membership must appear in a user's pageConfig dialog for the specific page they're using, whether:             *
*     a.) The User is added to an applicable Group, and must get all of that Group's permissions                                                            *
*     b.) The Group is given a Layer Permission, and now when pageConfig opens, all users in that group need to get that layer available.                   *
* 2.) Revoked UPL options for each user when Group entity permission is revoked, UNLESS individual user has permission to layer still (query)               *
* 3.) When these layer permissions become revoked, all CURRENT UPLs that the user no longer has group-given or individual-given permission to use           *
*     in a page must be deleted from the database. i.e. (UPLs and LayerPerms) => (WHERE LayerID), but not Layers themselves.                                *
*                                                                                                                                                           *
************************************************************************************************************************************************************/

@Component({
    selector: 'page-config',
    templateUrl: './pageConfig.component.html',
    providers: [UserService, GroupService, GroupMemberService, UserPageLayerService, UserPageService, ModulePermissionService, UserPageInstanceService],
    styleUrls: ['./pageConfig.component.scss']
})

export class PageConfigComponent implements OnInit {
    @Input() pageID;
    @Input() userID;
    @Input() pageName;

    private newUserPage: string;
    private newUserPageLayer = new UserPageLayer;
    private newUserPageInstance = new UserPageInstance;
    private layerPermissions = new Array<LayerPermission>();
    private modulePermissions = new Array<ModulePermission>();
    private userPageLayers = new Array<UserPageLayer>(); //insert instantiation if error **REMOVE**
    private userPageInstances = new Array<UserPageInstance>();
    private selectedUserPage: UserPage;
    private userGroups = new Array<Group>();
    private availableLPs = new Array<LayerPermission>();
    private selectedLP = new LayerPermission

    private token: string;
    private foo;


    constructor(public userPageLayerService: UserPageLayerService, private userPageService: UserPageService,
        private groupService: GroupService, private groupMemberService: GroupMemberService,
        private layerPermissionService: LayerPermissionService, private modulePermissionService: ModulePermissionService, public userPageInstanceService: UserPageInstanceService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    ngOnInit() {
        this.layerPermissions = [];
        this.modulePermissions = [];
        this.getGroups();
        //this.getUserPageLayers();
        //this.getLayerPermissions().then((allPerms)=>this.layerPermissions=allPerms);
        //  .then((/*ARRAY OF ALL PERMISSIONS GATHERED BY USER AND GROUPS*/) => this.layerPermissions = /*ARRAY*/); //********************* */
        this.foo = this.groupMemberService
            .GetByUser(this.userID)
    }

    private getGroups(): void {
        let groupIDS = new Array<GroupMember>();

        this.groupMemberService
            .GetByUser(this.userID)
            .subscribe((data: GroupMember[]) => {
                groupIDS = data;
                for (let gm of data) {
                    this.groupService
                        .GetSingle(gm.groupID)
                        .subscribe((group: Group) => {
                            this.userGroups.push(group);
                        })
                }
                // this.userGroups = groups;
                this.getUserPageLayers();
                this.getUserPageInstances();
            })

    }

    private getUserPageLayers(): void {
        this.userPageLayerService
            .GetPageLayers(this.pageID)
            .subscribe((data: UserPageLayer[]) => {
                this.userPageLayers = data;
                this.getLayerPermissions();
            });
    }

    private getUserPageInstances(): void {
        this.userPageInstanceService
            .GetPageInstances(this.pageID)
            .subscribe((data: UserPageInstance[]) => {
                this.userPageInstances = data;
                console.log(data)
            });
    }


    private getLayerPermissions() {
        var layerMatch = false;
        this.getByUser().then(() => {
            console.log('getting by groups')
            this.getByGroup().then(() => {
                console.log("in getbygroup");
                this.availableLPs = [];
                for (let LP of this.layerPermissions) {
                    for (let UPL of this.userPageLayers) {
                        if (LP.layerID == UPL.layerID) {
                            layerMatch = true;
                            break;
                        }
                    }
                    if (!layerMatch) {
                        this.availableLPs.push(LP);
                    }
                    layerMatch = false;
                }
            })
        })
        //Array.prototype.
    }

    private getByUser(): Promise<any> {
        console.log("get by user")

        var prom = new Promise((resolve, reject) => {
            var userPerms = new Array<LayerPermission>();
            this.layerPermissionService //run this logic as one promise
                .GetByUser(this.userID)
                .subscribe((data: LayerPermission[]) => {
                    for (let LP of data) {
                        //userPerms.push(i)
                        this.layerPermissions.push(LP);
                        // console.log("\nU Iterated       ID:" + LP.ID + "    Name: " + LP.layer.layerName)
                    }
                    console.log(this.layerPermissions)
                    this.modulePermissionService
                    .GetByUser(this.userID)
                    .subscribe((data: ModulePermission[]) => {
                        console.log(data)
                        for (let LP of data) {
                            this.modulePermissions.push(LP);
                        }
                    })
                    resolve();
                });
        })
        return prom;
    }

    private getByGroup(): Promise<any> {
        //This method is ugly and needs work.
        var prom = new Promise((resolve, reject) => {
            for (let g of this.userGroups) { //only start this logic once the previous promise has resolved by chaining it
                this.layerPermissionService
                    .GetByGroup(g.ID)
                    .subscribe((LPs: LayerPermission[]) => {
                        for (let LP of LPs) {
                            //groupPerms.push(i)
                            //if(this.layerPermissions.indexOf(LP) == -1) {
                            if (this.layerPermissions.length > 0) {
                                for (let userLP of this.layerPermissions) {
                                    // console.log("\nG Iterated:      ID: " + LP.ID + "    Name: " + LP.layer.layerName)
                                    if (LP.layerID != userLP.layerID) {
                                        this.layerPermissions.push(LP);
                                        break;
                                    }
                                }
                            }
                            else {
                                this.layerPermissions.push(LP)
                            }
                        }
                    })
                    this.modulePermissionService
                    .GetByGroup(g.ID)
                    .subscribe((LPs: ModulePermission[]) => {
                        for (let LP of LPs) {
                            //groupPerms.push(i)
                            //if(this.layerPermissions.indexOf(LP) == -1) {
                            if (this.modulePermissions.length > 0) {
                                for (let userLP of this.modulePermissions) {
                                    // console.log("\nG Iterated:      ID: " + LP.ID + "    Name: " + LP.layer.layerName)
                                    if (LP.moduleInstanceID != userLP.moduleInstanceID) {
                                        this.modulePermissions.push(LP);
                                        break;
                                    }
                                }
                            }
                            else {
                                this.modulePermissions.push(LP)
                            }
                        }
                    })
            }
            resolve();
        })
        return prom;
    }

    private addUserPageLayer(newUserPageLayer: UserPageLayer): void {
        var element = <HTMLInputElement>document.getElementById("pageConfigSubmit");
        console.log(this.selectedLP)
        this.newUserPageLayer.userPageID = this.pageID;
        this.newUserPageLayer.userID = this.userID;
        this.newUserPageLayer.defaultON = true;
        this.newUserPageLayer.layerID = newUserPageLayer.layerID;
        this.newUserPageLayer.style = this.selectedLP.layer.defaultStyle
        this.userPageLayerService
            .Add(this.newUserPageLayer)
            .subscribe(() => {
                this.layerPermissions = [];
                this.getUserPageLayers();
            });
    }

    private addUserPageInstance(newUserPageInstance: UserPageInstance): void {
        var element = <HTMLInputElement>document.getElementById("pageConfigSubmit");
        console.log(this.selectedLP)
        this.newUserPageInstance.userPageID = this.pageID;
        this.newUserPageInstance.userID = this.userID;
        this.newUserPageInstance.defaultON = true;
        this.newUserPageInstance.moduleInstanceID = newUserPageInstance.moduleInstanceID;
        this.newUserPageInstance.style = null
        this.userPageInstanceService
            .Add(this.newUserPageInstance)
            .subscribe(() => {
                this.layerPermissions = [];
                this.getUserPageInstances();
            });
    }

    private updateUserPageLayer(userPageLayer: UserPageLayer): void {
        let uplSave = new UserPageLayer
        uplSave.ID = userPageLayer.ID
        uplSave.defaultON = userPageLayer.defaultON
        console.log(uplSave)
        this.userPageLayerService
            .Update(uplSave)
            .subscribe((data) => {
                console.log(data)
                //this.layerPermissions = [];
                //this.getUserPageLayers();
            });
    }

    // 2/8/18: Must do the same update function that layerPermission needs as well, needs to update available list of objects to add correctly
    public deleteUserPageLayer(userPageLayerID: number): void {
        this.userPageLayerService
            .Delete(userPageLayerID)
            .subscribe((res) => {
                this.layerPermissions = [];
                this.getUserPageLayers();
            });
    }

    public deleteUserPageInstance(userPageInstanceID: number): void {
        this.userPageInstanceService
            .Delete(userPageInstanceID)
            .subscribe((res) => {
                this.layerPermissions = [];
                this.getUserPageInstances();
            });
    }

    public enableSubmit(LP: LayerPermission): void {
        var element = <HTMLInputElement>document.getElementById("pageConfigSubmit");
        this.selectedLP = LP
        element.disabled = false;
    }

    private addButton(newUserPageLayer: UserPageLayer): void {
        this.addUserPageLayer(newUserPageLayer);
        var element = <HTMLInputElement>document.getElementById("pageConfigSubmit");
        element.disabled = true;
    }
    private addInstance(newUserPageInstance: UserPageInstance): void {
        this.addUserPageInstance(newUserPageInstance);
        var element = <HTMLInputElement>document.getElementById("pageConfigSubmit");
        element.disabled = true;
    }

    
}