import { Component, OnInit } from '@angular/core';
import { Notif, User, UserPage } from '../../_models/user.model';
import { Group } from '../../_models/group.model';
import { GroupMember } from '../../_models/groupMember.model';
import { Layer, UserPageLayer } from '../../_models/layer.model';
import { NotifService } from '../../_services/notification.service';
import { UserService } from '../../_services/_user.service';
import { GroupService } from '../../_services/_group.service';
import { GroupMemberService } from '../../_services/_groupMember.service';
import { LayerService } from '../../_services/_layer.service';
import { UserPageLayerService } from '../../_services/_userPageLayer.service';
import { UserPageService } from '../../_services/_userPage.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
    providers: [NotifService, UserService, GroupService, GroupMemberService, LayerService, UserPageLayerService, UserPageService]
})

export class NotifComponent implements OnInit {
    public token: string;
    public userID: number;
    private notifications: Array<Notif>;
    private tempObj;
    
    //OR instead of below, have a map for each object type
    private sourceMap = new Map<string, any>();
    
    constructor(private notificationService: NotifService, private userService: UserService, private groupService: GroupService, private groupMemberService: GroupMemberService, private layerService: LayerService, private userPageLayerService: UserPageLayerService, private userPageService: UserPageService) { 
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser.token;
        this.userID = currentUser.userID;
    }

    ngOnInit() {
        this.getNotifications();
    }

    private getNotifications(): void {
        this.notificationService.GetByUser(this.userID)
            .subscribe((res: any) => {
                if(res.length > 0) {
                    this.notifications = res
                    this.getNotifObjects();
                }
            })
    }

    private getNotifObjects(): void {
        for(let notif of this.notifications) {
            if(notif.sourceID && notif.objectType) {
                var obj;
                this.getObject(notif.objectType, notif.sourceID, cb => {
                    
                })
                //this.sourceMap.set(notif.objectType+notif.sourceID, ) //i.e. (Layer4, User2, UserPage98)
            }
        }
    }

    private getObject(type: string, sourceID: number, cb): any {
        switch(type) {
            case 'User': {
                //cb(this.getUser(sourceID));
                break;
            }
            case 'Group': {
                this.getGroup(sourceID);
                break;
            }
            case 'Layer': {
                this.getLayer(sourceID)
                break;
            }
            case 'UserPageLayer': {
                this.getUserPageLayer(sourceID);
                break;
            }
            case 'UserPage': {
                this.getUserPage(sourceID);
                break;
            }
            default: {
                console.log("error with switch-case")
            }
        }
    }

    private getUser(id: number, cb): void {
        this.userService.GetSingle(id)
            .subscribe((user) => { (user)})
    }

    private getGroup(id: number): void {
        this.groupService.GetSingle(id)
            .subscribe((group) => {this.tempObj = group})
    }

    private getLayer(id: number): void {
        this.layerService.GetSingle(id)
            .subscribe((layer) => {console.log(layer)})
    }

    private getUserPageLayer(id: number): void {
        this.userPageLayerService.GetSingle(id)
            .subscribe((upl) => {this.tempObj = upl})
    }

    private getUserPage(id: number): void {
        this.userPageService.GetSingle(id)
            .subscribe((page) => {this.tempObj = page})
    }

    private deleteNotif(n: Notif): void {
        this.notificationService
            .Delete(n.ID)
            .subscribe(() => {this.getNotifications})
    }
}
