import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { UserPage } from '../../../../_models/user.model';
import { Group, GroupMember } from '../../../../_models/group.model';
import { GroupService } from '../../../../_services/_group.service';
import { GroupMemberService } from '../../../../_services/_groupMember.service';
import { UserPageLayer, LayerPermission } from '../../../../_models/layer.model';
import { UserPageService } from '../../../../_services/_userPage.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { UserPageLayerService } from '../../../../_services/_userPageLayer.service';
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
    
    private selectedUserPage: UserPage;
    private userGroups = new Array<Group>();
    private availableLPs = new Array<LayerPermission>();

    private token: string;
    private foo;

    
    constructor(private userPageLayerService: UserPageLayerService, private userPageService: UserPageService, 
        private groupService: GroupService, private groupMemberService: GroupMemberService, 
        private layerPermissionService: LayerPermissionService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    ngOnInit() {
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
                groupIDS = data
                for(let gm of data) {
                    this.groupService
                        .GetSingle(gm.groupID)
                        .subscribe((group: Group) => {
                            this.userGroups.push(group)
                        })
                }
                // this.userGroups = groups;
                console.log(this.userGroups)
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
        var layerMatch = false;
        this.getByUser().then(() => {
            this.getByGroup().then(() => {    
                this.availableLPs = []
                for(let LP of this.layerPermissions) {
                    for(let UPL of this.userPageLayers) {         
                        if(LP.layerID == UPL.layerID) {
                            layerMatch = true;
                            break;                            
                        }
                    }
                    if(!layerMatch) {
                        console.log(LP)
                        this.availableLPs.push(LP)
                    }
                    layerMatch = false;
                }
                console.log(this.availableLPs)
            })
        })

        //Array.prototype.
            
        
    }

    private getByUser(): Promise<any> {
        this.layerPermissions = []
        var prom = new Promise((resolve, reject) => {
            var userPerms = new Array<LayerPermission>();
            this.layerPermissionService //run this logic as one promise
                .GetByUser(this.userID)
                .subscribe((data: LayerPermission[]) => {
                    for(let LP of data) {
                        //userPerms.push(i)
                        this.layerPermissions.push(LP)
                        console.log("\nU Iterated       ID:" + LP.ID + "    Name: " + LP.layer.layerName)
                    }
                    resolve();
                }); 
        })
        return prom;
        
    }

    private getByGroup(): Promise<any> {
        var prom = new Promise((resolve, reject) => {
            for(let g of this.userGroups) { //only start this logic once the previous promise has resolved by chaining it
                console.log(this.userGroups)
                this.layerPermissionService
                    .GetByGroup(g.ID)
                    .subscribe((LPs: LayerPermission[]) => {
                        console.log(LPs)
                        for(let LP of LPs) {
                            //groupPerms.push(i)
                            console.log(this.layerPermissions.indexOf(LP))
                            //if(this.layerPermissions.indexOf(LP) == -1) {
                            for(let userLP of this.layerPermissions)
                                //console.log("\nG Iterated:      ID: " + LP.ID + "    Name: " + LP.layer.layerName)
                                if(LP.layerID != userLP.layerID) {
                                    this.layerPermissions.push(LP)
                                    console.log("\n\nG Adding:      ID: " + LP.ID + "    Name: " + LP.layer.layerName)
                                }      
                        }
                        console.log(this.layerPermissions)
                        //console.log

                    })
            }
            resolve();
        })
        return prom;
    }

    private addUserPageLayer(newUserPageLayer: UserPageLayer): void {
        var element = <HTMLInputElement> document.getElementById("pageConfigSubmit");
        
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
            .subscribe((res) => {
                console.log(res)
                this.layerPermissions=[]
                this.getUserPageLayers();
            });
    }

    public enableSubmit(): void {
        var element = <HTMLInputElement> document.getElementById("pageConfigSubmit");
        element.disabled = false;
    }
}