
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Api2Service } from './api2.service';
import { User } from '../_models/user-model'
import { Configuration } from '../_api/api.constants'
import { SidenavService} from '../_services/sidenav.service'
import { WFSService } from './map/services/wfs.service'

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  //styleUrls: ['./app.component.css', './styles/w3.css'],
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
    public markerdata: string;
    public isOpen: boolean;
    public temp;
    public bottomtx= new String
    public popuptx: string

    constructor(private dataService: Api2Service, private sidenavService: SidenavService, private WFSservice: WFSService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
        //sidenavService.bottomText$.subscribe(result => this.bottomtx = result) //7/6/17 not necessary 
        WFSservice.popupText$.subscribe(result => this.popuptx = result)
        
    }

    ngOnInit() {
       this.getAllItems(this.userID);
       this.markerdata = "" //Get this from sideNav using a listener? perhaps observable or data binding
       this.bottomtx = "bottom from Service"
       this.popuptx = "popup from Service"
    }

    /*ngDoCheck() {
        if (this.markerdata != "" && this.markerdata != this.temp){
            this.temp = this.markerdata
            console.log(this.markerdata)
            this.sidenavService.setMarkerData(this.markerdata)
        }
    }*/

    getAllItems(userid): void {
         this.dataService
            .GetSingle(userid)
            .subscribe((data:User) => this.user = data,
                error => console.log(error),
                () => console.log(this.user.email));     
    }

    openListener(open: boolean) {
        this.isOpen = open;
    }

    foo() {
        console.log(this.markerdata)
    }
}