import { Component, Output, OnDestroy, enableProdMode } from '@angular/core';
import { UserService } from '../../_services/_user.service';
import { User } from '../../_models/user.model';
import { SideNavService } from '../../_services/sidenav.service';
import { WMSService } from '../map/services/wms.service';
import { Subscription ,  Observable } from 'rxjs';
import { MyCubeField, MyCubeConfig, MyCubeComment } from '../../_models/layer.model'
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../../_services/authentication.service'

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
    public publicName: string;
    public loaded: boolean

    constructor(private dataService: UserService,
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService) {
    }

    ngOnInit() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userID = currentUser && currentUser.userID;
        this.message = null
        //this.socketService.initSocket() This may be used later.  This initializes a WebSocket
        this.publicName = this.route.snapshot.paramMap.get('publicName')
        if (this.publicName && !this.userID) {
            console.log('calling publicname auth service')
            this.authenticationService.publicLogin(this.publicName).then((x) => {
                console.log(localStorage.getItem('currentUser'))
                currentUser = JSON.parse(localStorage.getItem('currentUser'))
        this.userID = currentUser && currentUser.userID;

                 this.Initiate();
            })
        }
        else {this.Initiate()}



    }

    private Initiate() {
        console.log(this.userID)
        this.getAllItems(this.userID).then((x) => {
            if (this.publicName) {
                //needs to check that the userID matches the record with the publicName
                if (!this.userID) {
                    console.log('visiting a public page without authentication.  Authenticating.');
                    this.authenticationService.publicLogin(this.publicName)
                        .then(() => { this.loaded = true; });
                }
                else {
                    console.log("at least we have some authentication");
                    this.getAllItems(this.userID).then((x: boolean) => {
                        if (x == true) {
                            console.log("We've got the right authentitication");
                            this.loaded = true;
                        }
                        else {
                            console.log("Wrong authentication.  Reauthenitcating");
                            this.authenticationService.publicLogin(this.publicName)
                                .then(() => { this.loaded = true; });
                        }
                    });
                }
            }
            else {
                this.loaded = true;
            }
        });
    }

    private getAllItems(userID: number): Promise<any> {
        let promise = new Promise((resolve) => {
            this.dataService
            .GetSingle(userID)
            .subscribe((data: User) => {
                this.user = data;
                if (this.user.firstName == this.publicName) {
                    resolve(true)
                }
                else {
                    resolve(false)
                }
            });

        })
        return promise
    }

    ngOnDestroy() {
    }


}
