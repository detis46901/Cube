import { Component, OnInit, ViewChild, OnChanges } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';
import { Group } from '../../../_models/group.model';
import { GroupMember } from '../../../_models/groupMember.model';
import { GroupService } from '../../../_services/_group.service';
import { GroupMemberService } from '../../../_services/_groupMember.service'
import { NewGroupComponent } from './newGroup/newGroup.component';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { MatDialog, MatDialogRef, MatSelectionList } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { from } from 'rxjs/observable/from';

@Component({
    selector: 'group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
    providers: [UserService] //removed Configuration, FilterPipe, NumFilterPipe
})

export class GroupComponent implements OnInit, OnChanges {

    @ViewChild('groupUsers') groupSelectionList:any;

    private token: string;
    private userID: number;
    private objCode = 3;
    private type = "Group"
    private boi = 3

    private group = new Group;
    private groups: Array<Group>;
    private users: Array<User>;

    private selectedUser: User;
    private selectedGroup: Group;

    private availableGroups;
    private availableGroups$;
    private memberGroups;
    private memberGroups$;
    private showGroup: boolean;

    constructor(private userService: UserService, private groupService: GroupService, private groupMemberService: GroupMemberService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
        //console.log(this.token)
    }

    ngOnInit() {
        this.getGroupItems();
        this.getUserItems();
        console.log(this.boi)
    }

    ngOnChanges() {
        this.boi = this.boi + 1
        console.log(this.boi)
    }

    private getGroupItems(): void {
        this.availableGroups$ = from(this.groupService.GetAll());
        this.groupService.GetAll().subscribe((data) => this.availableGroups = data);
        this.availableGroups$.subscribe((x) => console.log(x))

        // this.availableGroups$ = new Observable<Group[]>((observer: Subscriber<Group[]>) => {
        //     observer.next(this.groupService.GetAll())
        // })

        // this.groupService
        //     .GetAll()
        //     .subscribe((data:Group[]) => {
        //         this.groups = data;
        //     },
        //     error => {
        //         console.error(error);
        //     });
    }

    private getUserItems(): void {
        this.userService
            .GetAll()
            .subscribe((data:User[]) => {
                this.users = data;
            },
            error => {
                console.error(error);
            })
    }

    private addGroup(newGroup: string): void {
        this.group.name = newGroup;
        this.groupService
            // .Add(this.group, this.token)
            .Add(this.group)            
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    private updateGroup(group: Group): void {
        this.groupService
            .Update(group)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    private openConfDel(group: Group): void {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objID = group.ID;
        dialogRef.componentInstance.objName = group.name;
        dialogRef.componentInstance.objCode = this.objCode;

        dialogRef.afterClosed().subscribe(result => {
            if (result == this.objCode) {
                this.deleteGroup(group.ID);
            }
            this.getGroupItems();
        });
    }

    private confDelGroup(group: Group) {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = group.ID;
        dialogRef.componentInstance.objName = group.name;

        dialogRef
            .afterClosed()
            .subscribe(result => {
                if (result == this.objCode) {
                    this.deleteGroup(group.ID);
                }
            });
    }

    private deleteGroup(groupID): void {
        this.groupService
            .Delete(groupID)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    private openNewGroup() {
        const dialogRef = this.dialog.open(NewGroupComponent, {width:'325px'});
        dialogRef.afterClosed()
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    private remove(arr, el) {
        const index = arr.indexOf(el)
        arr.splice(index, 1)
    }

    private selectUser(user: User): void {
        console.log("selectUser called")
        //this.groupSelectionList.deselectAll();
        this.selectedUser = user;
        this.groupMemberService
            .GetByUser(user.ID)
            .subscribe((data) => {
                var tempA = new Array<Group>();
                var tempB = new Array<Group>();

                for(let group of data) {
                    tempA.push(group.group)
                }

                // var sub = this.availableGroups$.subscribe(
                //     x => tempB.push(x),
                //     e => console.log(e),
                //     () => this.availableGroups = tempB[0]
                // )

                // for(let gA of tempA) {
                //     for (let gB of tempB) {
                //         if(gA.ID == gB.ID) {
                //             this.remove(tempB, gA)
                //         }
                //     }
                // }

                console.log(tempA)             

                this.memberGroups$ = from(tempA)
                this.memberGroups = tempA
                //this.availableGroups = tempB
                //this.memberGroups$ = temp
            })
        
    }

    //CHECK THIS OUT FOR ASYNC SOLUTION
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // import { Component }              from '@angular/core';
    // import { HEROES }                 from './heroes';

    // @Component({
    // selector: 'app-flying-heroes',
    // templateUrl: './flying-heroes.component.html',
    // styles: ['#flyers, #all {font-style: italic}']
    // })
    // export class FlyingHeroesComponent {
    // heroes: any[] = [];
    // canFly = true;
    // mutate = true;
    // title = 'Flying Heroes (pure pipe)';

    // constructor() { this.reset(); }

    // addHero(name: string) {
    //     name = name.trim();
    //     if (!name) { return; }
    //     let hero = {name, canFly: this.canFly};
    //     if (this.mutate) {
    //     // Pure pipe won't update display because heroes array reference is unchanged
    //     // Impure pipe will display
    //     this.heroes.push(hero);
    //     } else {
    //     // Pipe updates display because heroes array is a new object
    //     this.heroes = this.heroes.concat(hero);
    //     }
    // }

    // reset() { this.heroes = HEROES.slice(); }
    // }

    // ////// Identical except for impure pipe //////
    // @Component({
    // selector: 'app-flying-heroes-impure',
    // templateUrl: './flying-heroes-impure.component.html',
    // styles: ['.flyers, .all {font-style: italic}'],
    // })
    // export class FlyingHeroesImpureComponent extends FlyingHeroesComponent {
    // title = 'Flying Heroes (impure pipe)';
    // }


    // /*
    // Copyright 2017-2018 Google Inc. All Rights Reserved.
    // Use of this source code is governed by an MIT-style license that
    // can be found in the LICENSE file at http://angular.io/license
    // */
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////










    //this is running too much. *ngFor in matList is culprit
    // private checkGroup(group: Group): boolean {
    //     console.log("checkGroup called")
    //     let member = false;
    //     if(this.selectedUserGroups) {
    //         for(let assoc of this.selectedUserGroups) {
    //             if(assoc.groupID == group.ID) {
    //                 member = true;
    //                 break;
    //             }
    //         }
    //     }
    //     return member;
    // }

    // private removeUserGrp(group: Group) {
    //     if(this.selectedUserGroups) {
    //         for(let assoc of this.selectedUserGroups) {
    //             if(assoc.groupID == group.ID) {
    //                 this.groupMemberService
    //                     .Delete(assoc.ID)
    //                     .subscribe(() => {
    //                         this.getGroupItems();
    //                         this.getUserItems();
    //                         this.selectUser(this.selectedUser)
    //                     });
    //             }
    //         }
    //     }
    // }

    // private addUserGrp(group: Group) {
    //     let groupMember = new GroupMember;        
    //     groupMember.groupID = group.ID
    //     groupMember.userID = this.selectedUser.ID
        
    //     this.groupMemberService
    //         .Add(groupMember)
    //         .subscribe(() => {
    //             this.getGroupItems();
    //             this.getUserItems();
    //             this.selectUser(this.selectedUser)
    //         });
        
    // }
}