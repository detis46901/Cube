import { Component, Output, OnDestroy } from '@angular/core';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';
import { SideNavService } from '../../_services/sidenav.service';
import { MessageService } from '../../_services/message.service'
import { MyCubeService } from '../map/services/mycube.service'
import { WMSService } from '../map/services/wms.service';
import { Subscription } from 'rxjs/Subscription';
import { MyCubeField, MyCubeConfig, MyCubeComment } from '../../_models/layer.model'
import { SocketService} from '../../_services/socket.service'

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [SideNavService, WMSService]
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

    constructor(private socketService: SocketService, private dataService: UserService, private sideNavService: SideNavService, private myCubeService: MyCubeService, private wmsService: WMSService, private messageService: MessageService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getAllItems(this.userID);
        this.message = null
        //this.socketService.initSocket() This may be used later.  This initializes a WebSocket
    }

    private getAllItems(userID: number): void {
        this.dataService
            .GetSingle(userID)
            .subscribe((data: User) => {
                this.user = data;
            });
    }

    ngOnDestroy() {
    }
}