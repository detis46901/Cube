
import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Api2Service } from '../../api2.service';
import { User } from '../../../_models/user-model'
import { Configuration } from '../../../_api/api.constants'
import { LayerAdminService } from '../../../_services/layeradmin.service';
import { LayerPermissionService } from '../../../_services/layerpermission.service';
import { LayerAdmin, LayerPermission } from '../../../_models/layer.model'
import {NgbModal, ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { LayerPermissionComponent } from './layerpermission.component'


@Component({
  selector: 'layernew',
  templateUrl: './layernew.component.html',
  styleUrls: ['./layernew.component.less'],
  providers: [Api2Service, Configuration, LayerAdminService, LayerPermissionService],
})
export class LayerNewComponent implements OnInit{

closeResult: string;
public newlayeradmin = new LayerAdmin;
public token: string;
public userID: number;
public userperm: string;
public layeradmin = new LayerAdmin;


    constructor(private modalService: NgbModal, private layerAdminService: LayerAdminService, public activeModal: NgbActiveModal) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       //console.log(this.layeradmins.layer)
       //this.getGroupItems();
       //this.getRoleItems();
        
    }

open(content) {
    console.log("layernew open(content)")
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

openpermission(layerid, layername) {
    const modalRef = this.modalService.open(LayerPermissionComponent)
       modalRef.componentInstance.layerID = layerid
       modalRef.componentInstance.layerName = layername
        modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    console.log("openpermission from layernew")
  }

  public addLayer(newlayer) {
        this.layeradmin = newlayer;
        this.layerAdminService
            .Add(this.layeradmin)
            .subscribe(result => {
                this.activeModal.close('Next click'); this.openpermission(result.ID, this.layeradmin.layerName)
            })      
    }
}