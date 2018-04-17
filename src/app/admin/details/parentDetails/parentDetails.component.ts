import { Component, OnInit, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { Notification } from '../../../../_models/user.model'; 

import { NotificationService } from '../../../../_services/notification.service';

@Component({
    selector: 'parentDetails',
    templateUrl: './parentDetails.component.html',
    styleUrls: ['./parentDetails.component.css']
})

export class ParentDetailsComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}
