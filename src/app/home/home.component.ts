import { Component, Output, OnDestroy } from '@angular/core';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';
import { SideNavService } from '../../_services/sidenav.service';
import { MessageService } from '../../_services/message.service'
import { MyCubeService } from '../map/services/mycube.service'
import { WMSService } from '../map/services/wms.service';
import { Subscription } from 'rxjs/Subscription';
import { MyCubeField, MyCubeConfig, MyCubeComment } from '../../_models/layer.model'
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [SideNavService, WMSService]
})

export class HomeComponent {
    //@Output() user;

    //This is the variable that tells the header's toggle menu button which screen the user is on
    public screen = 1;

    public user = new User;
    public token: string;
    public userID: number;
    public popupText: string;
    public message: any;
    public myCubeData: MyCubeField;
    public myCubeComments: MyCubeComment[]
    public subscription: Subscription;
    public myCubeSubscription: Subscription;
    public myCubeCommentSubscription: Subscription;
    public editSubscription: Subscription;
    public myCubeConfig: MyCubeConfig;
    public messageSubscription: Subscription;
    public hero$: Observable<any>;
    public hero:any;
    

    constructor(private dataService: UserService, 
        private sideNavService: SideNavService, 
        private myCubeService: MyCubeService, 
        private wmsService: WMSService, 
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router,) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getAllItems(this.userID);
        this.message = null
        //this.socketService.initSocket() This may be used later.  This initializes a WebSocket
        this.hero$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
              this.dataService.GetSingle((params.getAll('id'))))
          );
        this.hero$.subscribe((x) => console.log(x))
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