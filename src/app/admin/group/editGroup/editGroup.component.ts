import { Component, OnInit, Input } from '@angular/core';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'editGroup',
    templateUrl: './editGroup.component.html',
    styleUrls: ['./editGroup.component.scss']
})

export class EditGroupComponent implements OnInit {
    @Input() group: Group;

    constructor(private dialog: MatDialog, private groupService: GroupService) {}

    ngOnInit() { }

    public updateGroup(group): void {
        this.groupService
            .Add(group)
            .subscribe(() => this.dialog.closeAll())
    }
}
