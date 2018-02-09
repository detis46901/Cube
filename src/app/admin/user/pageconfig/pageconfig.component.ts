import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { UserPage } from '../../../../_models/user.model';
import { Group } from '../../../../_models/group.model';
import { GroupService } from '../../../../_services/_group.service';
import { GroupMember } from '../../../../_models/groupMember.model';
import { GroupMemberService } from '../../../../_services/_groupMember.service';
import { UserPageLayer, LayerPermission } from '../../../../_models/layer.model';
import { UserPageService } from '../../../../_services/_userPage.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { UserPageLayerService } from '../../../../_services/_userPageLayer.service';
import { MatDialog, MatDialogRef } from '@angular/material';

/****************************************************************************************************************************************************
* 2/9/19: All changes that need to happen  (Mark off as you complete)                                                                               *
*                                                                                                                                                   *
* -"Layers" (UserPageLayers) accordion menu on map must update when a UPL is added to the current page (This may require this module sending an     *
*   observable to a listener on the other end)                                                                                                      *
* -pageConfig dialog needs to have a similar system to layerPerm like "permless" list, but with layers that have already been added to UPL (dedup)  *
* -All group handling must be accomplished:                                                                                                         *
* 1.) Available UPL options granted by Group membership must appear in a user's pageConfig dialog for the specific page they're using, whether:     *
*     a.) The User is added to an applicable Group, and must get all of that Group's permissions                                                    *
*     b.) The Group is given a Layer Permission, and now when pageConfig opens, all users in that group need to get that layer available.           *
* 2.) Revoked UPL options for each user when Group entity permission is revoked, UNLESS individual user has permission to layer still (query)       *
* 3.) When these layer permissions become revoked, all CURRENT UPLs that the user no longer has group-given or individual-given permission to use   *
*     in a page must be deleted from the database. i.e. (UPLs and LayerPerms) => (WHERE LayerID), but not Layers themselves.                        *
* 4.) Deleting a layer must still delete all layerPerms and UPLs (probably not a conern really, this should still work)                             *
****************************************************************************************************************************************************/

@Component({
    selector: 'page-config',
    templateUrl: './pageConfig.component.html',
    providers: [UserService, GroupService, GroupMemberService, UserPageLayerService, UserPageService],
    styleUrls: ['./pageConfig.component.scss']
})

export class PageConfigComponent implements OnInit {
    @Input() pageID;
    @Input() userID;
    @Input() pageName;

    private newUserPage: string;
    private newUserPageLayer = new UserPageLayer;
    private layerPermissions = new Array<LayerPermission>();
    private userPageLayers = new Array<UserPageLayer>(); //insert instantiation if error **REMOVE**
    private token: string;
    private selectedUserPage: UserPage;
    private userGroups: Group[];
    
    constructor(private userPageLayerService: UserPageLayerService, private userPageService: UserPageService, private groupService: GroupService, private groupMemberService: GroupMemberService, private layerPermissionService: LayerPermissionService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    ngOnInit() {
        this.getGroups();
        //this.getUserPageLayers();
        //this.getLayerPermissions().then((allPerms)=>this.layerPermissions=allPerms);
          //  .then((/*ARRAY OF ALL PERMISSIONS GATHERED BY USER AND GROUPS*/) => this.layerPermissions = /*ARRAY*/); //********************* */
    }

    private getGroups(): void {
        let groupIDS = new Array<GroupMember>();
        let groups = new Array<Group>();
        this.groupMemberService
            .GetByUser(this.userID)
            .subscribe((data: GroupMember[]) => {
                groupIDS = data
                for(let gm of data) {
                    this.groupService
                        .GetSingle(gm.groupID)
                        .subscribe((group: Group) => {
                            groups.push(group)
                        })
                }
                this.userGroups = groups;
                this.getUserPageLayers();
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

    private getLayerPermissions() {
        // var prom = new Promise ((resolve, reject) => {
        //     var allPerms = new Array<LayerPermission>();
        //     this.getByUser()
        //         .then((userPerms) => {
        //             allPerms.push.apply(allPerms, userPerms)
        //                 this.getByGroup()
        //                     .then((groupPerms) => {
        //                         allPerms.push.apply(allPerms, groupPerms)
        //                     })
        //         });
        //     resolve(allPerms)
        // })
        // return prom;
        this.getByUser().then(()=>this.getByGroup())
        
    }

    private getByUser(): Promise<any> {
        var prom = new Promise ((resolve, reject) => {
            var userPerms = new Array<LayerPermission>();
            this.layerPermissionService //run this logic as one promise
                .GetByUser(this.userID)
                .subscribe((data: LayerPermission[]) => {
                    for(let i of data) {
                        //userPerms.push(i)
                        this.layerPermissions.push(i)
                    }
                    resolve();
                });
            //resolve(userPerms);
            
        });

        return prom;
    }

    private getByGroup(): Promise<any> {
        var prom = new Promise ((resolve, reject) => {
            var groupPerms = new Array<LayerPermission>();
            console.log(this.userGroups)
            for(let g of this.userGroups) { //only start this logic once the previous promise has resolved by chaining it
                this.layerPermissionService
                    .GetByGroup(g.ID)
                    .subscribe((data: LayerPermission[]) => {
                        console.log(data)
                        for(let i of data) {
                            //groupPerms.push(i)
                            this.layerPermissions.push(i)
                        }
                        //console.log
                        resolve()
                    })
            }
            //resolve(groupPerms);
        });

        return prom;
    }

    private addUserPageLayer(newUserPageLayer: UserPageLayer): void {
        console.log(newUserPageLayer)
        
        this.newUserPageLayer.userPageID = this.pageID ;
        this.newUserPageLayer.userID = this.userID ;
        this.newUserPageLayer.layerON = true;
        this.newUserPageLayer.layerID = newUserPageLayer.layerID;

        this.userPageLayerService
            //.Add(this.newUserPageLayer, this.token)
            .Add(this.newUserPageLayer)
            .subscribe(() => {
                this.layerPermissions=[]
                this.getUserPageLayers();
            });
    }

    private updateUserPageLayer(userPage: UserPage): void {
        this.userPageLayerService
            .Update(userPage)
            .subscribe(() => {
                this.layerPermissions=[]
                this.getUserPageLayers();
            });
    }

    // 2/8/18: Must do the same update function that layerPermission needs as well, needs to update available list of objects to add correctly
    public deleteUserPageLayer(userPageID: number): void {
        this.userPageLayerService
            .Delete(userPageID)
            .subscribe(() => {
                this.layerPermissions=[]
                this.getUserPageLayers();
            });
    }
}