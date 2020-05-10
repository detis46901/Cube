import { Component, OnInit, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Layer } from '../../../../_models/layer.model';
import { User, Notif } from '../../../../_models/user.model';
import { ServerService } from '../../../../_services/_server.service';
import { Server } from '../../../../_models/server.model';
import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { UserService } from '../../../../_services/_user.service'
import { GroupService } from '../../../../_services/_group.service';
import { GroupMemberService } from '../../../../_services/_groupMember.service';
import { NotifService } from '../../../../_services/notification.service';
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'
import { ModuleInstance } from '../../../../_models/module.model'

@Component({
    selector: 'instance-details',
    templateUrl: './instanceDetails.component.html',
    providers: [LayerService, LayerPermissionService, ServerService, UserService, GroupService, GroupMemberService, NotifService],
    styleUrls: ['./instanceDetails.component.scss']
})

export class InstanceDetailsComponent implements OnInit {
    @Input() ID;
    @Input() name;

    public layer = new Layer;
    public layerProps = new Array<any>();
    public changedLayerProps = new Array<any>();
    public originalLayerProps = new Array<any>();
    public style: string;
    public userID;
    public user: User;
    public servers: Array<Server>;
    public instanceDetails: ModuleInstance

    constructor(private dialog: MatDialog, private layerService: LayerService, private layerPermissionService: LayerPermissionService,
        private serverService: ServerService, private userService: UserService, private groupService: GroupService,
        private groupMemberService: GroupMemberService, private notificationService: NotifService, private moduleInstanceService: ModuleInstanceService) {
        
    }

    ngOnInit() {
        console.log(this.ID)
        console.log(this.name)
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
        this.getInstanceDetails()
    }

    public getInstanceDetails() {
        this.moduleInstanceService.GetSingle(this.ID)
        .subscribe((x) => {
            this.instanceDetails = x
            console.log(this.instanceDetails)
        })
    }
 
    public updateInstanceDetails() {
        this.moduleInstanceService.Update(this.instanceDetails)
        .subscribe((x) => {
            console.log(x)
        })
    }
}
