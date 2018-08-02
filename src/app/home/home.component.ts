import { Component, Output, OnDestroy } from '@angular/core';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';
import { SideNavService } from '../../_services/sidenav.service';
import { MessageService } from '../../_services/message.service'
import { MyCubeService } from '../map/services/mycube.service'
import { WFSService } from '../map/services/wfs.service';
import { Subscription } from 'rxjs/Subscription';
import { MyCubeField, MyCubeConfig, MyCubeComment } from '../../_models/layer.model'

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [SideNavService, WFSService]
})

export class HomeComponent {
    //@Output() user;

    //This is the variable that tells the header's toggle menu button which screen the user is on
    private screen = 1;

    private user = new User;
    private token: string;
    private userID: number;
    private popupText: string;
    private message: any;
    private myCubeData: MyCubeField;
    private myCubeComments: MyCubeComment[]
    private subscription: Subscription;
    private myCubeSubscription: Subscription;
    private myCubeCommentSubscription: Subscription;
    private editSubscription: Subscription;
    private myCubeConfig: MyCubeConfig;
    private messageSubscription: Subscription;

    constructor(private dataService: UserService, private sideNavService: SideNavService, private myCubeService: MyCubeService, private WFSservice: WFSService, private messageService: MessageService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
        this.subscription = this.messageService.getMessage().subscribe(message => { this.message = message; this.myCubeData = null });
        this.myCubeSubscription = this.myCubeService.getMyCubeData().subscribe(myCubeData => { this.myCubeData = myCubeData; this.message = null });
        this.myCubeCommentSubscription = this.myCubeService.getMyCubeComments().subscribe(myCubeComments => { this.myCubeComments = myCubeComments })
        this.editSubscription = this.myCubeService.getMyCubeConfig().subscribe(data => { this.myCubeConfig = data });
        this.messageSubscription = this.myCubeService.getMessage().subscribe(data => this.message = data)
    }

    ngOnInit() {
        this.getAllItems(this.userID);
        this.message = null
    }

    private getAllItems(userID: number): void {
        this.dataService
            .GetSingle(userID)
            .subscribe((data: User) => {
                this.user = data;
            });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe()
        this.myCubeSubscription.unsubscribe()
        this.editSubscription.unsubscribe()
    }
}