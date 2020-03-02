import { Component, OnInit, ViewChild, OnChanges } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';
import { Group, GroupMember } from '../../../_models/group.model';
import { GroupService } from '../../../_services/_group.service';
import { GroupMemberService } from '../../../_services/_groupMember.service';
import { NewGroupComponent } from './newGroup/newGroup.component';
import { EditGroupComponent } from './editGroup/editGroup.component'
import { ConfirmDeleteComponent } from '../confirmdelete/confirmdelete.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { Observable ,  Subscriber ,  from } from 'rxjs';

@Component({
    selector: 'group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
    providers: [UserService] //removed Configuration, FilterPipe, NumFilterPipe
})

export class GroupComponent implements OnInit {
    @ViewChild('groupUsers')  groupSelectionList: any;
    @ViewChild('groupGroups') userSelectionList: any;

    public objCode = 3;
    public type = "Group"
    public bool = false;
    public bool2 = false;

    public group = new Group;
    public groups: Array<Group>;
    public users: Array<User>;
    public showUsers: Array<User>;

    public selectedUser: User;
    public selectedAvailableUser;
    public selectedMemberUser;
    public selectedGroup: Group;
    public selectedAvailableGroup;
    public selectedMemberGroup;
    public userGroupMembers;

    public availableGroups;
    public availableUsers;
    public memberGroups;
    public memberUsers;
    public showGroup: boolean;

    constructor(private userService: UserService, private groupService: GroupService,
        private groupMemberService: GroupMemberService, private dialog: MatDialog) {
    }

    ngOnInit() {
        this.getGroupItems();
        this.getUserItems();
    }

    private getGroupItems(): void {
        this.groupService
            .GetAll()
            .subscribe((data) => {
                this.groups = data;
            }, error => {
                console.error(error);
            });
    }

    private getUserItems(): void {
        this.userService
            .GetAll()
            .subscribe((data: User[]) => {
                this.users = data;
            }, error => {
                console.error(error);
            });
    }

    public addGroup(newGroup: string): void {
        this.group.name = newGroup;
        this.groupService
            // .Add(this.group, this.token)
            .Add(this.group)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    public updateGroup(group: Group): void {
        this.groupService
            .Update(group)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    public openConfDel(group: Group): void {
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

    public confDelGroup(group: Group) {
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

    public editDetails(group: Group) {
        const dialogRef = this.dialog.open(EditGroupComponent, { width: '325px' });
        dialogRef.componentInstance.group = group;
        dialogRef.afterClosed()
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    public deleteGroup(groupID): void {
        this.groupService
            .Delete(groupID)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    public openNewGroup() {
        const dialogRef = this.dialog.open(NewGroupComponent, { width: '325px' });
        dialogRef.afterClosed()
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }

    public remove(arr, el) {
        const index = arr.indexOf(el);
        arr.splice(index, 1);
    }

    public selectUser(user: User): void {
        //this.groupSelectionList.deselectAll();
        this.selectedUser = user;
        this.groupMemberService
            .GetByUser(user.ID)
            .subscribe((data) => {
                this.userGroupMembers = data;
                var tempA = new Array<Group>();
                var tempB = new Array<Group>();

                for (let group of data) {
                    tempA.push(group.group);
                }

                this.memberGroups = tempA;

                // loop to compare member groups to all groups and form an array for available groups to display
                for (let group of this.groups) {
                    var counter = 0;
                    for (var i = 0; i < tempA.length; i++) {
                        if (group.name != tempA[i].name) {
                            counter++;
                        }
                    }
                    if (counter == tempA.length) {
                        tempB.push(group);
                    }
                }
                if (this.groups.length == 0) {
                    this.availableGroups = this.groups;
                }
                else {
                    this.availableGroups = tempB;
                }
            })
    }

    public selectGroup(group: Group): void {
        //this.userSelectionList.deselectAll();
        this.selectedGroup = group;
        this.groupMemberService
            .GetByGroup(group.ID)
            .subscribe((data) => {
                this.userGroupMembers = data;
                var tempA = new Array<GroupMember>();
                var tempB = new Array<User>();
                var tempC = new Array<User>();

                for (let user of data) {
                    tempA.push(user);
                }

                for (let user of this.users) {
                    var counter = 0;
                    for (var i = 0; i < tempA.length; i++) {
                        if (user.ID != tempA[i].userID) {
                            counter++;
                        }
                    }

                    if (counter == tempA.length) {
                        tempB.push(user);
                    }
                }

                if (tempA.length == 0) {
                    this.availableUsers = this.users;
                }
                else {
                    this.availableUsers = tempB;
                }

                for (let user of data) {
                    this.userService
                        .GetSingle(user.userID)
                        .subscribe((user) => {
                            tempC.push(user)
                        })
                }

                this.memberUsers = tempC;
            })
    }

    public selectUserAdd(user: User) {
        this.selectedAvailableUser = user;
    }

    public selectUserRemove(user: User) {
        this.selectedMemberUser = user;
    }

    public selectGroupAdd(group: Group) {
        this.selectedAvailableGroup = group;
        //this.selectedMemberGroup = null;
    }

    public selectGroupRemove(group: Group) {
        this.selectedMemberGroup = group;
        //this.selectedAvailableGroup = null;
    }

    public removeMemberGroup(group: Group) {
        for (let assoc of this.userGroupMembers) {
            if (assoc.groupID == group.ID) {
                this.groupMemberService
                    .Delete(assoc.ID)
                    .subscribe(() => {
                        this.getGroupItems();
                        this.getUserItems();
                        this.selectUser(this.selectedUser);
                    });
            }
        }
    }

    public removeMemberUser(user: User) {
        for (let assoc of this.userGroupMembers) {
            if (assoc.userID == user.ID) {
                this.groupMemberService
                    .Delete(assoc.ID)
                    .subscribe(() => {
                        this.getGroupItems();
                        this.getUserItems();
                        this.selectGroup(this.selectedGroup);
                    });
            }
        }
    }

    public addAvailableGroup(group: Group) {
        var flag = false;
        for (let g of this.memberGroups) {
            if (group.ID === g.ID) {
                return;
            }
        }

        let groupMember = new GroupMember;
        groupMember.groupID = group.ID;
        groupMember.userID = this.selectedUser.ID;
        this.groupMemberService
            .Add(groupMember)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
                this.selectUser(this.selectedUser);
            });
    }

    public addAvailableUser(user: User) {
        var flag = false;
        for (let u of this.memberUsers) {
            if (user.ID === u.ID) {
                return;
            }
        }

        let groupMember = new GroupMember;
        groupMember.userID = user.ID;
        groupMember.groupID = this.selectedGroup.ID;
        this.groupMemberService
            .Add(groupMember)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
                this.selectGroup(this.selectedGroup);
            });
    }

    public showme(b) {
        if (b) {
            console.log("go to users");
            this.type = "Group";
        }
        else {
            console.log("go to groups");
            this.type = "User";
        }
    }
}
