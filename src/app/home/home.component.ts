<<<<<<< HEAD
import { Component, Output } from '@angular/core';
=======
import { Component, OnDestroy } from '@angular/core';
>>>>>>> c4be1e12c58e75cb2cd08fba48bb5ab7c04b3973
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';
import { SideNavService} from '../../_services/sidenav.service';
import { MessageService } from '../../_services/message.service'
import { MyCubeService } from '../map/services/mycube.service'
import { WFSService } from '../map/services/wfs.service';
import { Subscription } from 'rxjs/Subscription';
import { MyCubeField, MyCubeConfig } from '../../_models/layer.model'

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
    private subscription: Subscription;
    private myCubeSubscription: Subscription;
    private editSubscription: Subscription;
    private myCubeConfig: MyCubeConfig;

    constructor(private dataService: UserService, private sideNavService: SideNavService, private myCubeService: MyCubeService, private WFSservice: WFSService, private messageService: MessageService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log(localStorage.getItem('currentUser'))
        console.log(currentUser.userID)
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
        this.subscription = this.sideNavService.getMessage().subscribe(message => { this.message = message; });
        this.myCubeSubscription = this.myCubeService.getMyCubeData().subscribe(myCubeData => { this.myCubeData = myCubeData; });
        this.editSubscription = this.myCubeService.getMyCubeConfig().subscribe(data => {this.myCubeConfig = data});
        console.log("this.message = " + this.message)
    }

    ngOnInit() {
        console.log(this.userID)
        this.getAllItems(this.userID);
        //this.getAllItems(102); //toby mcguire
        this.message = "Click a layer for details.";
    }

    private getAllItems(userID: number): void {
        this.dataService
            .GetSingle(userID)
            .subscribe((data: User) => {
                console.log(data)
                this.user = data;
            });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe()
        this.myCubeSubscription.unsubscribe()
        this.editSubscription.unsubscribe()
    }
}