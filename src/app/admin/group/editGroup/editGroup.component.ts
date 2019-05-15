import { Component, OnInit, Input } from '@angular/core';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'editGroup',
    templateUrl: './editGroup.component.html',
    styleUrls: ['./editGroup.component.scss']
})

export class EditGroupComponent implements OnInit {
    @Input() group: Group;

    public token: string;
    public userID: number;

    constructor(private dialog: MatDialog, private groupService: GroupService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
    }

    public updateGroup(group): void {
        this.groupService
            .Add(group)
            .subscribe(() => this.dialog.closeAll())
    }
}
