import { Component, OnInit, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { Layer } from '../../../../_models/layer.model';
import { User, Notif } from '../../../../_models/user.model'; 

import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { UserService } from '../../../../_services/_user.service'
import { GroupService } from '../../../../_services/_group.service';
import { GroupMemberService } from '../../../../_services/_groupMember.service';
import { NotifService } from '../../../../_services/notification.service';

@Component({
    selector: 'layer-details',
    templateUrl: './layerDetails.component.html',
    providers: [LayerService, LayerPermissionService, UserService, GroupService, GroupMemberService, NotifService],
    styleUrls: ['./layerDetails.component.scss']
})

export class LayerDetailsComponent implements OnInit {
    @Input() ID;
    @Input() name;

    private layer = new Layer;
    private layerProps = new Array<any>();
    private changedLayerProps = new Array<any>();
    private originalLayerProps = new Array<any>();
    private style: string;
    private token;
    private userID;
    private user: User;

    constructor(private dialog: MatDialog, private layerService: LayerService, private layerPermissionService: LayerPermissionService, private userService: UserService, private groupService: GroupService, private groupMemberService: GroupMemberService, private notificationService: NotifService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.token = currentUser && currentUser.token;
		this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getLayer(this.ID)
        this.getUser(this.userID)      
    }

    private getLayer(id) {
        this.layerService
            .GetSingle(id)
            .subscribe((res: Layer) => {
                this.layer = res
                this.style = JSON.stringify(this.layer.defaultStyle)
                console.log(res.defaultStyle["load"])

                for(let prop in res) {
                    if(res.hasOwnProperty(prop)) {
                        this.layerProps.push(res[prop])
                    }
                }
            })
    }

    private getUser(id) {
        this.userService
            .GetSingle(id)
            .subscribe((res) => {
                this.user = res
            })
    }

    private submit(layer) {
        this.whichFieldsChanged(layer)
        var notif: Notif = this.createLayerNotif(layer)
        this.layerService
            .Update(layer)
            .subscribe(() => {
                this.layerPermissionService.GetByLayer(layer.ID).subscribe((perms) => {
                    for(let perm of perms) {
                        if(perm.userID != this.userID) {
                            notif.userID = perm.userID;

                            this.notificationService
                                .Add(notif)
                                .subscribe((res) => {
                                    console.log(res)
                                    this.dialog.closeAll()
                                })
                        }
                    }
                })
            })
    }

    private whichFieldsChanged(changed: Layer) {
        let ix = 0;

        for(let property in changed) {
            if(changed.hasOwnProperty(property)) {
                if(changed[property] != this.layerProps[ix]) {
                    this.originalLayerProps.push(this.layerProps[ix])
                    this.changedLayerProps.push(changed[property])
                }
            }
            ix += 1;
        }
    }

    private createLayerNotif(L: Layer): any {
        var N = new Notif;
        N.name = L.layerName + ' changed by ' + this.user.firstName + " " + this.user.lastName;
        N.description = this.parseDescription(this.originalLayerProps, this.changedLayerProps);
        N.priority = 3;
        N.read = false;
        N.objectType = "Layer";
        N.sourceID = L.ID;

        return N;
    }

    private parseDescription(oArr, cArr): string {
        var description = "";
        let flag = false;
        let ix = 0;
        for(let prop of oArr) {
            description += "\"" + prop + "\" was changed to \"" + cArr[ix] + "\"\n"
        }
        return description;
    }
}
