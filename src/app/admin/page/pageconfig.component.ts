
import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Api2Service } from '../../api2.service';
import { User } from '../../../_models/user-model'
import { Configuration } from '../../../_api/api.constants'
import { UserPageService } from '../../../_services/user-page.service'
import { LayerPermissionService } from '../../../_services/layerpermission.service'
import { UserPageLayerService } from '../../../_services/user-page-layer.service'
import { UserPage } from '../../../_models/user-model'
import { UserPageLayer } from '../../../_models/layer.model'
import { LayerPermission } from '../../../_models/layer.model'
import { FilterPipe } from '../../../_pipes/rowfilter.pipe'
import { NumFilterPipe } from '../../../_pipes/numfilter.pipe'
import {NgbModal, ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'page',
  templateUrl: './pageconfig.component.html',
  providers: [Api2Service, Configuration, FilterPipe, NumFilterPipe, UserPageLayerService]
  //styleUrls: ['./app.component.css', './styles/w3.css'],
})
export class PageConfigComponent implements OnInit{
@Input () pageID;
@Input () userID;

public user = new User;
public userpagelayer = new UserPageLayer;
public newuserpagelayer = new UserPageLayer;
public layerpermissions: any;
public userpagelayers: any;
public token: string;
public selecteduserpage: UserPage;
public newuserpage: string;
public layers: any;
public page: string;


    constructor(private userpagelayerService: UserPageLayerService, private layerpermissionService: LayerPermissionService, public activeModal: NgbActiveModal) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        //this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       this.getUserPageLayers();
       this.getLayers();
    // need to get all layers this user has access to

    }

    public getUserPageLayers(): void {
        console.log("pageID = " + this.pageID)
         this.userpagelayerService
            .GetPageLayers(this.pageID)
            .subscribe((data:UserPageLayer[]) => this.userpagelayers = data,
                error => console.log(error),
                () =>  console.log(this.userpagelayers)
                );
           
    }

    public getLayers() {
        this.layerpermissionService
            .GetUserLayer(this.userID)
            .subscribe((data:LayerPermission[]) => this.layerpermissions = data,
                error => console.log(error),
            () => console.log(this.layerpermissions[0].layer_admin['layerName']))
    }

   public addUserPageLayer(newuserpage) {
        this.newuserpagelayer.userPageID = this.pageID ;
        this.newuserpagelayer.userID = this.userID ;
        this.newuserpagelayer.layerON = true;
        console.log ("layerAdminID=" + newuserpage.layerAdminID)
        this.newuserpagelayer.layerAdminID = newuserpage.layerAdminID;
        this.userpagelayerService
            .Add(this.newuserpagelayer)
            .subscribe(result => {
                console.log(result);
                this.getUserPageLayers();
            })      
    }

    public updateUserPageLayer(userpage) {
        this.userpagelayerService
            .Update(userpage)
            .subscribe(result => {
                console.log(result);
                this.getUserPageLayers();
            })
    }

    public deleteUserPageLayer(userpageID) {
        this.userpagelayerService
            .Delete(userpageID)
            .subscribe(result => {
                console.log(result);
                this.getUserPageLayers();
            })
    }

}