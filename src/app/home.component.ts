
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { UserService } from '../_services/user.service';
import { User } from '../_models/user-model'
import { Configuration } from '../_api/api.constants'
import { SidenavService} from '../_services/sidenav.service'
import { WFSService } from './map/services/wfs.service'

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
  providers: [SidenavService, WFSService]
})
export class HomeComponent {

    //This is the "constant" (though not declared as such) that tells the header's toggle menu button which screen the user is on
    private screen = 1;

    public user = new User;
    public isHome = true;
    public myItems: any;
    public token: string;
    public userID: number;
    public isOpen: boolean;
    public popuptx: string

    constructor(private dataService: UserService, private sidenavService: SidenavService, private WFSservice: WFSService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
        WFSservice.popupText$.subscribe(result => this.popuptx = result)
        
    }

    ngOnInit() {
       this.getAllItems(this.userID);
       this.popuptx = "Click a layer for details."
    }

    getAllItems(userid): void {
        this.dataService
            .GetSingle(userid)
            .subscribe((data:User) => this.user = data,
                error => console.log(error));//,
                //() => console.log(this.user.email));     
    }

    openListener(open: boolean) {
        this.isOpen = open;
    }

}