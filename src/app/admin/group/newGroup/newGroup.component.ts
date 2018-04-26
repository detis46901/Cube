import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-newGroup',
    templateUrl: './newGroup.component.html',
    styleUrls: ['./newGroup.component.scss'],
    providers: [GroupService]
})

export class NewGroupComponent implements OnInit {
    private token: string;
    private userID: number;

    private groups: Group[];
    private newGroup = new Group;

    constructor(private dialog: MatDialog, private groupService: GroupService) { 
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.groupService
            .GetAll()
            .subscribe((res) => {
                this.groups = res;
            })
    }

    private addGroup(newGrp:Group): void {
        var flag = false;
        for(let grp of this.groups) {
            if(newGrp.name == grp.name) {
                flag = true;
            }
        }

        if(!flag) {
            this.groupService
                .Add(newGrp)
                .subscribe(()=>this.dialog.closeAll())
        } else {
            alert('There is already a group with that name.')
        }
    }

}
