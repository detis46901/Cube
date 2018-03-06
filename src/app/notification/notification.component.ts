import { Component, OnInit } from '@angular/core';
import { Notification } from '../../_models/user.model';
import { NotificationService } from '../../_services/notification.service';

@Component({
    selector: 'notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
    providers: [NotificationService]
})

export class NotificationComponent implements OnInit {
    public token: string;
    public userID: number;
    private notifications;
    
    constructor(private notificationService: NotificationService) { 
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser.token;
        this.userID = currentUser.userID; 
    }

    ngOnInit() {
        this.getNotifications();
    }

    private getNotifications(): void {
        this.notificationService.GetByUser(this.userID)
            .subscribe((res) => {
                if(res.length > 0) {
                    this.notifications = res
                } else {
                    console.log("sonny");
                }
            })
    }

}
