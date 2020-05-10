import { Component, OnInit, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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

    public user = new User;
    public style: string;
    public userID;

    constructor(private dialog: MatDialog, private userService: UserService, private groupService: GroupService, private groupMemberService: GroupMemberService, private notificationService: NotifService) {}

    ngOnInit() {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
        this.getUser(this.ID)
    }

    public getUser(id) {
        this.userService
            .GetSingle(id)
            .subscribe((res: User) => {
                this.user = res
            })
    }

    public submit(user) {
        this.userService
            .Update(user)
            .subscribe(() => this.dialog.closeAll())
    }
}
