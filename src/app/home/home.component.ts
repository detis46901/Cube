import { Component } from '@angular/core';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';
import { SidenavService} from '../../_services/sidenav.service';
import { WFSService } from '../map/services/wfs.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [SidenavService, WFSService]
})

export class HomeComponent {
    //This is the variable that tells the header's toggle menu button which screen the user is on
    private screen = 1;

    private user = new User;
    private token: string;
    private userID: number;
    private popupText: string;
    message: any;
    mycubedata: any;
    subscription: Subscription;
    mycubesubscription: Subscription;

    constructor(private dataService: UserService, private sidenavService: SidenavService, private WFSservice: WFSService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
        this.subscription = this.sidenavService.getMessage().subscribe(message => { this.message = message; });
        this.mycubesubscription = this.sidenavService.getMyCubeData().subscribe(mycubedata => { this.mycubedata = mycubedata; });
        
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