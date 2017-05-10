
import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Api2Service } from '../../api2.service';
import { User } from '../../../_models/user-model'
import { Configuration } from '../../../_api/api.constants'
import { LayerAdminService } from '../../../_services/layeradmin.service';
import { LayerPermissionService } from '../../../_services/layerpermission.service';
import { LayerAdmin, LayerPermission } from '../../../_models/layer.model'
import {NgbModal, ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'layerpermission',
  templateUrl: './layerpermission.component.html',
  providers: [Api2Service, Configuration, LayerAdminService, LayerPermissionService]
})
export class LayerPermissionComponent implements OnInit{
@Input () layerID;
@Input () layerName;
closeResult: string;
public users: any;
public newlayerpermission = new LayerPermission;
public layerpermissions: any;
public token: string;
public userID: number;
public userperm: string;

    constructor(private modalService: NgbModal, private layerPermissionService: LayerPermissionService, public activeModal: NgbActiveModal, private api2service: Api2Service) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       //console.log(this.layeradmins.layer)
       //this.getGroupItems();
       //this.getRoleItems();
       this.getPermissionItems();
       this.getUserItems();
    }

initNewPermission(): void {
        console.log("initNewPermission");
        this.newlayerpermission.edit = null;
        this.newlayerpermission.userID = 0;
        console.log(this.newlayerpermission.userID)
    }

open(content) {
    this.userperm = "A user"
    this.modalService.open(content, {size:'lg'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

     public getPermissionItems(): void {
         console.log("Getting Permissions")
         this.layerPermissionService
            .GetSome(this.layerID)
            .subscribe((data:LayerPermission[]) => this.layerpermissions = data,
                error => console.log(error),
                () => console.log()
                );
    }

    public getUserItems(): void {
         this.api2service
            .GetAll()
            .subscribe((data:User[]) => this.users = data,
                error => console.log(error),
                //() => console.log(this.departments[0].department)
                );
    }
 
public addLayerPermission(newlayerpermission) {
        this.newlayerpermission = newlayerpermission;
        this.newlayerpermission.layerAdminID = this.layerID
        console.log(this.newlayerpermission.userID);
        this.layerPermissionService
            .Add(this.newlayerpermission)
            .subscribe(result => {
               console.log(result);
              this.initNewPermission();
               this.getPermissionItems();
            })      
    }

    public updateLayerPermission(permission) {
        this.layerPermissionService
            .Update(permission)
            .subscribe(result => {
                console.log(result);
            })
    }

     public deleteLayerPermission(permissionID) {
        this.layerPermissionService
            .Delete(permissionID)
            .subscribe(result => {
                console.log(result);
                this.getPermissionItems();
            })
    }
}