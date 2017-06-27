import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Api2Service } from '../../api2.service';
import { User } from '../../../_models/user-model'
import { Configuration } from '../../../_api/api.constants'
import { LayerAdminService } from '../../../_services/layeradmin.service';
import { LayerPermissionService } from '../../../_services/layerpermission.service';
import { UserPageLayerService } from '../../../_services/user-page-layer.service';
import { LayerAdmin, LayerPermission } from '../../../_models/layer.model';
import { LayerPermissionComponent } from './layerpermission.component';
import { LayerNewComponent } from './layernew.component'
import { ConfirmdeleteComponent } from '../confirmdelete/confirmdelete.component'
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmdeleteService } from '../../../_services/confirmdelete.service';
import { Observable } from 'rxjs/Observable';
import { confirmDelete } from '../../../_models/confDel.model'

@Component({
  selector: 'layeradmin',
  templateUrl: './layeradmin.component.html',
  providers: [Api2Service, Configuration, LayerAdminService, LayerPermissionService, UserPageLayerService, NgbActiveModal]
  //styleUrls: ['./app.component.css', './styles/w3.css'],
})

export class LayerAdminComponent implements OnInit{

    public deleteThis = false;
    public flag = false;

    //objCode values refer to the admin menu tab the user is on, so the openConfDel procedure knows what to interpolate based on what it's deleting
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

    sortedNameAsc: any;
    sortedNameDesc: any;
    sortedType: any;
    sortedOldToNew: any;
    sortedNewToOld: any;

    constructor(private layerAdminService: LayerAdminService, private modalService: NgbModal, private layerPermissionService: LayerPermissionService, private userPageLayerService: UserPageLayerService, private confDelService: ConfirmdeleteService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       this.getLayerItems();
       console.log(this.flag)
       //console.log(this.layeradmins.layer)
       //this.getGroupItems();
       //this.getRoleItems();
        
    }

    onClicked(deleteFlag) {
        this.deleteThis = deleteFlag
        console.log(this.deleteThis)
        console.log(this.confDelService.getVars())
        console.log(this.currLayer.ID)
        this.deleteLayer(this.currLayer.ID)
    }

    setFlag(layer_id) {
        this.confDelService.resetDelete()
        this.currLayer.ID = layer_id
        console.log(this.objCode, this.currLayer.ID)

        this.confDelService.setVars(this.objCode, this.currLayer.ID)
        console.log(this.confDelService.getVars())
        this.flag = true
        console.log(this.flag)
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

    //openConfDel(objectCode, objectID, objectName) {
    openConfDel(layer) {
        this.confDelService.resetDelete()
        console.log(this.confDelService.delete_obj)
        console.log(this.objCode)
        console.log(layer)
        console.log(layer.ID)
        console.log(layer.layerName)

        let callback;

        const modalRef = this.modalService.open(ConfirmdeleteComponent)

        modalRef.componentInstance.objCode = this.objCode
        modalRef.componentInstance.objID = layer.ID
        modalRef.componentInstance.objName = layer.layerName

        modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            console.log(this.confDelService.delete_obj)
            this.getLayerItems();
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            console.log(this.confDelService.delete_obj)
            this.getLayerItems();
        });

        function confirmDelete (callback) {
            console.log()
        }

        /*6/27/17 let foo = document.getElementById("confDelClick")

        console.log(foo)

        //6/27/17 Either this or the observable way is probably best. consider reactiveX subject as well. this is also key for marker stuff 
        foo.addEventListener("click", function(){console.log("button click on nconfDel modal fire event listened to by layeradmin")})

        var observer = {
            next: //this.deleteLayer(objectID) //Cannot be accessed from within "function(value)" parameter for "next:"
            function(value) {
                this.
                console.log(value)
            }
        }

        Observable.fromEvent(foo, 'click')
            .subscribe(observer)*/

        //this.modalService.open(ConfirmdeleteComponent);
        //console.log(this.confDelService.delete_obj) Commented out as of 6/26/17*/

        //Something here with $event probably

        /*var deleteObserver = {
            next: function(flag) {
                console.log(flag);
            }
        }

        Observable.fromEvent(this.btnId, 'click')
            .subscribe(deleteObserver);
        
        if(this.confDelService.delete_obj) {
            console.log("true delete")
            //this.deleteLayer(layer_id)
            //this.confDelService.resetDelete()
        }

        var subscription = this.confDelService.source.subscribe(
            x => console.log('next: ', x)
        );*/
        
        //subscription.dispose();
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
        this.sortedOldToNew = this.layeradmins
        console.log(this.layeradmins)
    }

    public updateLayer(layer) {
        this.layerAdminService
            .Update(layer)
            .subscribe(result => {
                console.log(result); //this returns the correct result, a populated object
                this.getLayerItems();
            })
    }

     //The way this deletes permissions and layers when a layer is deleted should be implemented with any deletion that involves dependents
     //Should in theory delete entire row: layer(layerid), layer_permissions(layerid), and user_page_layers(layerid)
     public deleteLayer(layerID) {
        console.log(layerID)

        //non-functional
        /*this.userPageLayerService
            .GetSome(layerID) //this .getsome has to operate with a pageID not a layerID
            .subscribe(result => {
                for (let i of result) {
                    this.userPageLayerService
                    .Delete(i.ID)
                    .subscribe(result => {
                        console.log(result)
                    })
                }
            })*/

        this.layerPermissionService
            .GetSome(layerID)
            .subscribe(result => {
                console.log(result)
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

    //step 2 6/27/17
    public sortNameAsc() {
        
    }

    public sortNameDesc() {
        
    }

    public sortType() {
        
    }

    public sortOldToNew() {
        
    }

    public sortNewToOld() {
        
    }
}

