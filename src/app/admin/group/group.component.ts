import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';
import { GroupService } from '../../../_services/_group.service';
import { Group} from '../../../_models/group.model';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
    providers: [UserService] //removed Configuration, FilterPipe, NumFilterPipe
})

export class GroupComponent implements OnInit {
    private token: string;
    private userID: number;
    private objCode = 3;

    private group = new Group;
    private groups: Array<any>;

    private selectedGroup: Group;
    private showGroup: boolean;

    constructor(private userService: UserService, private groupService: GroupService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getGroupItems();
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

    private addGroup(newGroup: string): void {
        this.group.name = newGroup;
        this.groupService
            // .Add(this.group, this.token)
            .Add(this.group)            
            .subscribe(() => {
                this.getGroupItems();
            });
    }

    private updateGroup(group: Group): void {
        this.groupService
            .Update(group)
            .subscribe(() => {
                this.getGroupItems();
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


    private deleteGroup(groupID: number): void {
        this.groupService
            .Delete(groupID)
            .subscribe((data:Group[]) => {
                this.getGroupItems()
            })
    }
}