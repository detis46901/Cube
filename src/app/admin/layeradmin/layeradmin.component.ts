
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
import { ConfirmdeleteComponent } from '../confirmdelete/confirmdelete.component'
import { NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { ConfirmdeleteService } from '../../../_services/confirmdelete.service';

@Component({
  selector: 'layeradmin',
  templateUrl: './layeradmin.component.html',
  providers: [Api2Service, Configuration, LayerAdminService, LayerPermissionService]
  //styleUrls: ['./app.component.css', './styles/w3.css'],
})

export class LayerAdminComponent implements OnInit{

    private objCode = 2

    closeResult: string;
    public user = new User;
    public currLayer = new LayerAdmin;
    public layeradmin = new LayerAdmin;
    public newlayeradmin = new LayerAdmin;
    public newlayerpermission = new LayerPermission;
    public layerpermission: any;
    public layeradmins: any;
    public token: string;
    public userID: number;
    public userperm: string;
    public confDel = false;

    constructor(private layerAdminService: LayerAdminService, private modalService: NgbModal, private layerPermissionService: LayerPermissionService, private confDelService: ConfirmdeleteService) {
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

    opendelete(layer_id) {
        this.confDelService.resetDelete()
        this.currLayer.ID = layer_id
        console.log(this.objCode, this.currLayer.ID)
        this.confDelService.setVars(this.objCode, this.currLayer.ID)
        console.log(this.confDelService.getVars())
        //console.log(this.objCode, this.currLayer.ID)
        this.modalService.open(ConfirmdeleteComponent).result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });

        console.log(this.confDelService.delete_obj)
        /*if(this.confDelService.delete()) {
            this.deleteLayer(layer_id)
            this.confDelService.resetDelete()
        }*/
    }

    /*opendelete(layer_id) {
        this.currLayer.ID = layer_id
        this.confDel = true
    }*/

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

     //The way this deletes permissions and layers when a layer is deleted should be implemented with any deletion that involves dependents
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

    public sortPages() {

    }
}

