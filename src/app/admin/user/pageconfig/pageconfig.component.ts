import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { UserPageService } from '../../../../_services/_userPage.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { UserPageLayerService } from '../../../../_services/_userPageLayer.service';
import { UserPage } from '../../../../_models/user.model';
import { UserPageLayer } from '../../../../_models/layer.model';
import { LayerPermission } from '../../../../_models/layer.model';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {MdDialog, MdDialogRef} from '@angular/material';


@Component({
    selector: 'page-config',
    templateUrl: './pageConfig.component.html',
    providers: [UserService, UserPageLayerService, UserPageService],
    styleUrls: ['./pageConfig.component.scss'],
})

export class PageConfigComponent implements OnInit {
    @Input() pageID;
    @Input() userID;
    @Input() pageName;

    public user = new User;
    public userpagelayer = new UserPageLayer;
    public newuserpagelayer = new UserPageLayer;
    public layerpermissions: any;
    public userpagelayers: UserPageLayer[] = [];
    public token: string;
    public selecteduserpage: UserPage;
    public newuserpage: string;
    public layers: any;
    public page: string;


    constructor(private userpagelayerService: UserPageLayerService, private modalService: NgbModal, private userpageService: UserPageService, private layerpermissionService: LayerPermissionService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        //this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
        console.log(this.pageName);
        this.getUserPageLayers(); //Gets all the layers for this page
        this.getLayers(); //Gets all the permitted layers
        console.log(this.layerpermissions);
        console.log(this.userpagelayers);
        console.log(this.pageID.toString() + ' ' + this.userID.toString() + ' ' + this.pageName);
    }

    public getUserPageLayers(): void {
        console.log('pageID = ' + this.pageID);
        this.userpagelayerService
            .GetPageLayers(this.pageID)
            .subscribe((data:UserPageLayer[]) => {
                this.userpagelayers = data; console.log(this.userpagelayers);
            });
    }

    ////8/1/17 This is all messed up, the same modal object comes up for both users currently
    //public setUserPageLayers(UPL): void {
    //this.userpagelayers = [];
    //for (let layer of UPL) {
    //if (layer.userPageID == this.pageID) {
    //console.log("foo")
    //this.userpagelayers.push(layer)
    //}
    //}
    //}

    public getUserPage(pageID): void {
        this.userpageService
            .GetSingle(pageID)
            .subscribe((data) => {
                return this.selecteduserpage = data;
            },
            error => {
                return console.log(error);
            },
            () => {
                return console.log(this.selecteduserpage.page);
            }
            );
        //{{selecteduserpage.page}} in HTML
    }

    public getLayers() {
        this.layerpermissionService
            .GetUserLayer(this.userID)
            .subscribe((data:LayerPermission[]) => {
                this.layerpermissions = data; console.log(this.layerpermissions);
            });
    }

    public setLayerPerm(LP) {
        this.layerpermissions = LP;
        console.log(LP);
    }

    public addUserPageLayer(newuserpage) {
        this.newuserpagelayer.userPageID = this.pageID ;
        this.newuserpagelayer.userID = this.userID ;
        this.newuserpagelayer.layerON = true;
        console.log('layerAdminID=' + newuserpage.layerAdminID);
        this.newuserpagelayer.layerAdminID = newuserpage.layerAdminID;
        this.userpagelayerService
            .Add(this.newuserpagelayer)
            .subscribe(result => {
                console.log(result);
                this.getUserPageLayers();
            });
    }

    public updateUserPageLayer(userpage) {
        this.userpagelayerService
            .Update(userpage)
            .subscribe(result => {
                console.log(result);
                this.getUserPageLayers();
            });
    }

    public deleteUserPageLayer(userpageID) {
        
        this.userpagelayerService
            .Delete(userpageID)
            .subscribe(result => {
                this.getUserPageLayers();
            });
    }

    //confirmDelete for the layers within the page config modal?
    /*openConfDel(layer) {
        const modalRef = this.modalService.open(ConfirmDeleteComponent)
        modalRef.componentInstance.objCode = this.objCode
        modalRef.componentInstance.objID = layer.ID
        modalRef.componentInstance.objName = layer.layerName

        modalRef.result.then((result) => {
            this.deleteLayer(layer.ID)
            this.getLayerItems();
        }, (reason) => {
            this.getLayerItems();
        });
    }*/

}