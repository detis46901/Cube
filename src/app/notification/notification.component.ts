import { Component, OnInit } from '@angular/core';
import { Notification } from '../../_models/user.model';
import { NotificationService } from '../../_services/notification.service';

@Component({
    selector: 'notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
    public token: string;
    public userID: number;
    public userpages: any;
    private notifications: any;
    
    constructor(private notificationService: NotificationService) { 
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID; 
    }

    ngOnInit() {
        this.notificationService.GetByUser(this.userID)
            .subscribe((res) => {
                this.notifications = res
            })
    }

}
