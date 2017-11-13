import { Component } from '@angular/core';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';
import { SideNavService} from '../../_services/sidenav.service';
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
    //This is the variable that tells the header's toggle menu button which screen the user is on
    private screen = 1;

    private user = new User;
    private token: string;
    private userID: number;
    private popupText: string;
    private message: string;
    private myCubeData: MyCubeField;
    private subscription: Subscription;
    private myCubeSubscription: Subscription;
    private editSubscription: Subscription;
    private myCubeConfig: MyCubeConfig;

    constructor(private dataService: UserService, private sideNavService: SideNavService, private WFSservice: WFSService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
        this.subscription = this.sideNavService.getMessage().subscribe(message => { this.message = message; });
        this.myCubeSubscription = this.sideNavService.getMyCubeData().subscribe(myCubeData => { this.myCubeData = myCubeData; });
        this.editSubscription = this.sideNavService.getMyCubeConfig().subscribe(data => {this.myCubeConfig = data});
        console.log("this.message = " + this.message)
    }

    ngOnInit() {
       this.getAllItems(this.userID);
       this.message = "Click a layer for details.";
    }

    private getAllItems(userID: number): void {
        this.dataService
            .GetSingle(userID)
            .subscribe((data: User) => {
                this.user = data;
            });
    }
}