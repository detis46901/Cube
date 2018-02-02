import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';
import { Group } from '../../../_models/group.model';
import { GroupMember } from '../../../_models/groupMember.model';
import { GroupService } from '../../../_services/_group.service';
import { GroupMemberService } from '../../../_services/_groupMember.service'
import { NewGroupComponent } from './newGroup/newGroup.component';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { MatDialog, MatDialogRef, MatSelectionList } from '@angular/material';

@Component({
    selector: 'group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
    providers: [UserService] //removed Configuration, FilterPipe, NumFilterPipe
})

export class GroupComponent implements OnInit {

    @ViewChild('groupUsers') groupSelectionList:any;

    private token: string;
    private userID: number;
    private objCode = 3;

    private group = new Group;
    private groups: Array<Group>;
    private users: Array<User>;

    private selectedUser: User;
    private selectedGroup: Group;

    private selectedUserGroups: GroupMember[];
    private showGroup: boolean;

    constructor(private userService: UserService, private groupService: GroupService, private groupMemberService: GroupMemberService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getGroupItems();
        this.getUserItems();
    }

    private getGroupItems(): void {
        this.groupService
            .GetAll()
            .subscribe((data:Group[]) => {
                this.groups = data;
            },
            error => {
                console.error(error);
            });
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

    private selectUser(user: User): void {
        console.log("selectUser called")
        this.groupSelectionList.deselectAll();
        this.selectedUser = user;

        this.groupMemberService
            .GetByUser(user.ID)
            .subscribe((data: GroupMember[]) => {
                this.selectedUserGroups = data;
            })
    }

    //this is running too much. *ngFor in matList is culprit
    private checkGroup(group: Group): boolean {
        let member = false;
        if(this.selectedUserGroups) {
            for(let assoc of this.selectedUserGroups) {
                if(assoc.groupID == group.ID) {
                    member = true;
                    break;
                }
            }
        }
        return member;
    }

    private removeUserGrp(group: Group) {
        if(this.selectedUserGroups) {
            for(let assoc of this.selectedUserGroups) {
                if(assoc.groupID == group.ID) {
                    this.groupMemberService
                        .Delete(assoc.ID)
                        .subscribe(() => {
                            this.getGroupItems();
                            this.getUserItems();
                        });
                }
            }
        }
    }

    private addUserGrp(group: Group) {
        let groupMember = new GroupMember;        
        groupMember.groupID = group.ID
        groupMember.userID = this.selectedUser.ID
        
        this.groupMemberService
            .Add(groupMember)
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
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
        const dialogRef = this.dialog.open(NewGroupComponent, {height:'500px',width:'500px'});
        dialogRef.afterClosed()
            .subscribe(() => {
                this.getGroupItems();
                this.getUserItems();
            });
    }
}