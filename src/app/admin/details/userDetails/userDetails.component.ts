import { Component, OnInit, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { User, Notif } from '../../../../_models/user.model'; 

import { UserService } from '../../../../_services/_user.service';
import { GroupService } from '../../../../_services/_group.service';
import { GroupMemberService } from '../../../../_services/_groupMember.service';
import { NotifService } from '../../../../_services/notification.service';

@Component({
    selector: 'userDetails',
    templateUrl: './userDetails.component.html',
    providers: [UserService, UserService, GroupService, GroupMemberService, NotifService],
    styleUrls: ['./userDetails.component.scss']
})

export class UserDetailsComponent implements OnInit {
    @Input() ID;
    @Input() name;

    private user = new User;
    private style: string;
    private token;
    private userID;

    constructor(private dialog: MatDialog, private userService: UserService, private groupService: GroupService, private groupMemberService: GroupMemberService, private notificationService: NotifService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.token = currentUser && currentUser.token;
		this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getUser(this.ID)
    }

    private getUser(id) {
        this.userService
            .GetSingle(id)
            .subscribe((res: User) => {
                this.user = res
            })
    }

    private submit(user) {
        this.userService
            .Update(user)
            .subscribe(() => this.dialog.closeAll())
    }
}
