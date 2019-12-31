import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { UserPage } from '../../../../_models/user.model';
import { Group } from '../../../../_models/group.model';
import { GroupService } from '../../../../_services/_group.service';
import { GroupMemberService } from '../../../../_services/_groupMember.service';
import { UserPageLayer, LayerPermission } from '../../../../_models/layer.model';
import { UserPageInstance, ModulePermission } from '../../../../_models/module.model'
import { UserPageService } from '../../../../_services/_userPage.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ModulePermissionService } from '../../../../_services/_modulePermission.service'
import { UserPageLayerService } from '../../../../_services/_userPageLayer.service';
import { UserPageInstanceService } from '../../../../_services/_userPageInstance.service'
import { MatDialog } from '@angular/material';
import { FeatureModulesAdminService } from '../../../feature-modules/feature-modules-admin.service'

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
    providers: [UserService, GroupService, GroupMemberService, UserPageLayerService, UserPageService, ModulePermissionService, UserPageInstanceService, FeatureModulesAdminService],
    styleUrls: ['./pageConfig.component.scss']
})

export class PageConfigComponent implements OnInit {
    @Input() pageID;
    @Input() userID;
    @Input() pageName;

    public newUserPage: string;
    public newUserPageLayer = new UserPageLayer;
    public newUserPageInstance = new UserPageInstance;
    public layerPermissions = new Array<LayerPermission>();
    public modulePermissions = new Array<ModulePermission>();
    public userPageLayers = new Array<UserPageLayer>(); //insert instantiation if error **REMOVE**
    public userPageInstances = new Array<UserPageInstance>();
    public selectedUserPage: UserPage;
    public userGroups = new Array<Group>();
    public availableLPs = new Array<LayerPermission>();
    public selectedLP = new LayerPermission

    constructor(public userPageLayerService: UserPageLayerService,
        private layerPermissionService: LayerPermissionService,
        private modulePermissionService: ModulePermissionService,
        private dialog: MatDialog,
        public userPageInstanceService: UserPageInstanceService,
        public featureModuleAdminService: FeatureModulesAdminService) {}

    ngOnInit() {
        this.layerPermissions = [];
        this.modulePermissions = [];
        this.getAllByUser();
    }

    public getAllByUser() {
        this.layerPermissionService.GetByUserGroups(this.userID)
        .subscribe((x: LayerPermission[]) => {
            this.layerPermissions = x.filter(LP => LP.layer.layerType != 'Module')

        })
        this.modulePermissionService.GetByUserGroups(this.userID)
        .subscribe((y: ModulePermission[]) => {
            this.modulePermissions = y
        })
        this.getUserPageLayers();
        this.getUserPageInstances();
    }


    public getUserPageLayers(): void {
        this.userPageLayerService
            .GetPageLayers(this.pageID)
            .subscribe((data: UserPageLayer[]) => {
                this.userPageLayers = data;
                // this.getLayerPermissions();
            });
    }

    public getUserPageInstances(): void {
        this.userPageInstanceService
            .GetPageInstances(this.pageID)
            .subscribe((data: UserPageInstance[]) => {
                this.userPageInstances = data;
                console.log(data)
            });
    }

    public addUserPageLayer(newUserPageLayer: UserPageLayer): void {
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
                this.getAllByUser()
                this.getUserPageLayers();
            });
    }

    public addUserPageInstance(newUserPageInstance: UserPageInstance): void {
        console.log(newUserPageInstance)
        var element = <HTMLInputElement>document.getElementById("pageConfigSubmit");
        console.log(this.selectedLP)
        this.newUserPageInstance.userPageID = this.pageID;
        this.newUserPageInstance.userID = this.userID;
        this.newUserPageInstance.defaultON = true;
        this.newUserPageInstance.moduleInstanceID = newUserPageInstance.module_instance.ID;
        this.newUserPageInstance.module_instance = newUserPageInstance.module_instance
        this.userPageInstanceService
            .Add(this.newUserPageInstance)
            .subscribe((data: UserPageInstance) => {
                console.log(data)
                newUserPageInstance.ID = data.ID
                this.layerPermissions = [];
                this.featureModuleAdminService.addModuleToPage(newUserPageInstance)
                this.getUserPageInstances();
                this.getUserPageLayers()
            });
    }

    public updateUserPageLayer(userPageLayer: UserPageLayer): void {
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

    public deleteUserPageInstance(userPageInstance: UserPageInstance): void {
        //this.featureModuleAdminService.removeModuleFromPage(userPageInstance)
        this.userPageLayers.forEach(x => {
            if (x.userPageInstanceID == userPageInstance.ID) {
                this.deleteUserPageLayer(x.ID)
                this.userPageInstanceService
                .Delete(userPageInstance.ID)
                .subscribe((res) => {
                    console.log(res)
                    this.layerPermissions = [];
                    this.getUserPageInstances();
                    
                });    
            }
            else {
                this.userPageInstanceService
                .Delete(userPageInstance.ID)
                .subscribe((res) => {
                    console.log(res)
                    this.layerPermissions = [];
                    this.getUserPageInstances();
                    
                }); 
            }
        })
       
        
    }

    public enableSubmit(LP: LayerPermission): void {
        var element = <HTMLInputElement>document.getElementById("pageConfigSubmit");
        this.selectedLP = LP
        element.disabled = false;
    }

    public addButton(newUserPageLayer: UserPageLayer): void {
        this.addUserPageLayer(newUserPageLayer);
        var element = <HTMLInputElement>document.getElementById("pageConfigSubmit");
        element.disabled = true;
    }
    public addInstance(newUserPageInstance: UserPageInstance): void {
        this.addUserPageInstance(newUserPageInstance);
        var element = <HTMLInputElement>document.getElementById("pageConfigSubmit");
        element.disabled = true;
    }

    public closeDialog() {
        this.dialog.closeAll()
    }
}