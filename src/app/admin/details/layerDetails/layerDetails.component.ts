import { Component, OnInit, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { Layer } from '../../../../_models/layer.model';
import { User, Notification } from '../../../../_models/user.model'; 

import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { UserService } from '../../../../_services/_user.service'
import { GroupService } from '../../../../_services/_group.service';
import { GroupMemberService } from '../../../../_services/_groupMember.service';
import { NotificationService } from '../../../../_services/notification.service';

@Component({
    selector: 'layer-details',
    templateUrl: './layerDetails.component.html',
    providers: [LayerService, LayerPermissionService, UserService, GroupService, GroupMemberService, NotificationService],
    styleUrls: ['./layerDetails.component.scss']
})

export class LayerDetailsComponent implements OnInit {
    @Input() ID;
    @Input() name;

    private layer = new Layer;
    private style: string;
    private token;
    private userID;

    constructor(private dialog: MatDialog, private layerService: LayerService, private layerPermissionService: LayerPermissionService, private userService: UserService, private groupService: GroupService, private groupMemberService: GroupMemberService, private notificationService: NotificationService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.token = currentUser && currentUser.token;
		this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getLayer(this.ID)
    }

    private getLayer(id) {
        this.layerService
            .GetSingle(id)
            .subscribe((res: Layer) => {
                this.layer = res
                this.style = JSON.stringify(this.layer.defaultStyle)
            })
    }

    private submit(layer) {
        this.layerService
            .Update(layer)
            .subscribe(() => {
                var notif = this.createLayerNotification(layer)

                this.layerPermissionService.GetByLayer(layer.ID).subscribe((perms) => {
                    for(let perm of perms) {
                        notif.userID = perm.userID;
                        this.notificationService
                            .Add(notif)
                            .subscribe(() =>
                                this.dialog.closeAll()
                            )
                    }
                })
            })
    }

    /*export class Notification {
        objectType: string;
        sourceID: number;
    }*/

    private getUsersByLayer(L: Layer): User[] {
        var users: User[];
        var perms;//this will probably be empty by the time the return statement comes in
        this.layerPermissionService.GetByLayer(L.ID).subscribe((res) => perms = res);
        return users;
    }

    private createLayerNotification(L: Layer): any {
        var N = new Notification;
        N.name = L.layerName + " changed by [insert user that initiated dialog here]";
        N.description = "[insert description here]";
        N.priority = 3;
        N.read = false;
        N.objectType = "Layer";
        N.sourceID = L.ID;

        return N;
    }
}
