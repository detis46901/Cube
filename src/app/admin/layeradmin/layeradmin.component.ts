
import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Api2Service } from '../../api2.service';
import { User } from '../../../_models/user-model'
import { Configuration } from '../../../_api/api.constants'
import { LayerAdminService } from '../../../_services/layeradmin.service';
import { LayerPermissionService } from '../../../_services/layerpermission.service';
import { LayerAdmin, LayerPermission } from '../../../_models/layer.model';
import { LayerPermissionComponent } from './layerpermission.component';
import { LayerNewComponent } from './layernew.component'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'layeradmin',
  templateUrl: './layeradmin.component.html',
  providers: [Api2Service, Configuration, LayerAdminService, LayerPermissionService]
  //styleUrls: ['./app.component.css', './styles/w3.css'],
})

export class LayerAdminComponent implements OnInit{

    closeResult: string;
    public user = new User;
    public layeradmin = new LayerAdmin;
    public newlayeradmin = new LayerAdmin;
    public newlayerpermission = new LayerPermission;
    public layerpermission: any;
    public layeradmins: any;
    public token: string;
    public userID: number;
    public userperm: string;

    constructor(private layerAdminService: LayerAdminService, private modalService: NgbModal, private layerPermissionService: LayerPermissionService) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       this.getLayerItems();
       //console.log(this.layeradmins.layer)
       //this.getGroupItems();
       //this.getRoleItems();
        
    }

    //Open permissions modal on request from "Layers"
    openpermission(layerid, layername) {
        const modalRef = this.modalService.open(LayerPermissionComponent)
          modalRef.componentInstance.layerID = layerid
          modalRef.componentInstance.layerName = layername
            modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });;
        console.log("openpermission from layernew")
      }

    //Open create new layer modal on request from "Layers"
    opennew() {
        console.log ("opennew")
        this.userperm = "A user"
        this.modalService.open(LayerNewComponent).result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          this.getLayerItems();
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

    initNewLayer(): void {
        this.newlayeradmin.layerName = "";
        this.newlayeradmin.layerDescription = "";
        this.newlayeradmin.layerURL = "";
        this.newlayeradmin.layerType = "";
        this.newlayeradmin.layerIdent = "";
        this.newlayeradmin.layerFormat = "";
    }

    public getLayerItems(): void {
        this.layerAdminService
            .GetAll()
            .subscribe((data:LayerAdmin[]) => this.layeradmins = data,
                error => console.log(error),
                () => console.log()
                );
    }

    public updateLayer(layer) {
        this.layerAdminService
            .Update(layer)
            .subscribe(result => {
                console.log(result);
                this.getLayerItems();
            })
    }

     public deleteLayer(layerID) {
        console.log(layerID)
        this.layerPermissionService
            .GetSome(layerID)
            .subscribe(result => {
                for (let i of result) {
                    this.layerPermissionService
                    .Delete(i.ID)
                    .subscribe(result => {
                        console.log(result)
                    })
                }
            })
        this.layerAdminService
            .Delete(layerID)
            .subscribe(result => {
                console.log(result);
                this.getLayerItems();
            })
    }

    public orderPages() {

    }
}

