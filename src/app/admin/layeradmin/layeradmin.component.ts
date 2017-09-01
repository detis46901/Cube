import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { UserService } from '../../../_services/user.service';
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
import { ServerService } from '../../../_services/server.service'
import { Server } from '../../../_models/server.model'
import { ConfirmdeleteService } from '../../../_services/confirmdelete.service';
import { Observable } from 'rxjs/Observable';
import { confirmDelete } from '../../../_models/confDel.model'
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
  selector: 'layeradmin',
  templateUrl: './layeradmin.component.html',
  providers: [UserService, Configuration, LayerAdminService, LayerPermissionService, UserPageLayerService, ServerService],
  styleUrls: ['./layeradmin.component.scss']
})

export class LayerAdminComponent implements OnInit {

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
    public server: Server;
    public servers: Array<Server>;

    sortedNameAsc: any;
    sortedNameDesc: any;
    sortedType: any;
    sortedOldToNew: any;
    sortedNewToOld: any;

    constructor(private layerAdminService: LayerAdminService, private dialog: MdDialog, private layerPermissionService: LayerPermissionService, private userPageLayerService: UserPageLayerService, private confDelService: ConfirmdeleteService, private serverService: ServerService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
    }

    ngOnInit() {
       this.getLayerItems();     
       this.getServers();
    }

    //Open permissions modal on request from "Layers"
    openpermission(layerid, layername) {
        // const modalRef = this.modalService.open(LayerPermissionComponent, {size:'sm'})
        // modalRef.componentInstance.layerID = layerid
        // modalRef.componentInstance.layerName = layername
        // modalRef.result.then((result) => {
        //     this.closeResult = `Closed with: ${result}`;
        // }, (reason) => {
        //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        // });
        // console.log("openpermission from layernew")

        const dialogRef = this.dialog.open(LayerPermissionComponent, {height:'46%', width:'22%'});
        dialogRef.componentInstance.layerID = layerid;
        dialogRef.componentInstance.layerName = layername;
        dialogRef.afterClosed().subscribe(result => {
            this.getDismissReason = result;
            console.log(this.getDismissReason)
        });
      }

    //Open create new layer modal on request from "Layers"
    opennew() {
        console.log ("opennew")
        this.userperm = "A user"
        const dialogRef = this.dialog.open(LayerNewComponent, {height:'40%', width:'25%'});
        dialogRef.afterClosed().subscribe(result => {
            this.getDismissReason = result;
            console.log(this.getDismissReason)
            this.getLayerItems();
        });
    }

    openConfDel(layer) {
        console.log(this.servers, this.layeradmins)
        const dialogRef = this.dialog.open(ConfirmdeleteComponent, {
            
        })
        dialogRef.componentInstance.objCode = this.objCode
        dialogRef.componentInstance.objID = layer.ID
        dialogRef.componentInstance.objName = layer.layerName

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                console.log(result)
                this.deleteLayer(layer.ID)
            }           
        });
    }

    getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } 
        else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } 
        else {
            return  `with: ${reason}`;
        }
    }

    initNewLayer(): void {
        this.newlayeradmin.layerName = "";
        this.newlayeradmin.layerDescription = "";
        this.newlayeradmin.serverID = null;
        this.newlayeradmin.layerType = "";
        this.newlayeradmin.layerIdent = "";
        this.newlayeradmin.layerFormat = "";
        this.newlayeradmin.layerGeom = "";
    }

    getLayerItems(): void {
        this.layerAdminService
            .GetAll()
            .subscribe((data:LayerAdmin[]) => {this.layeradmins = data,
                error => console.log(error)
            });
        this.sortedOldToNew = this.layeradmins
        console.log(this.layeradmins)
    }

    getServers() {
        this.serverService
            .GetAll()
            .subscribe((data:Server[]) => this.servers = data
            );
    }

    updateLayer(layer) {
        this.layerAdminService
            .Update(layer)
            .subscribe(result => {
                console.log(result); //this returns the correct result, a populated object
                this.getLayerItems();
            })
    }

    updateServer(server) {
        //this.serverService
    }

     //The way this deletes permissions and layers when a layer is deleted should be implemented with any deletion that involves dependents
     //Should in theory delete entire row: layer(layerid), layer_permissions(layerid), and user_page_layers(layerid)
     deleteLayer(layerID) {
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

    //6/28/17
    orderAZ() {
        let indexList: Array<number> = [];
        let list, temp = this.layeradmins
        for (let i=0; i<list.length; i++) {
            temp[i] = list[i].layerName    
        }
    }

    sortLayers(code: string) {
        let indexList: Array<number> = [];
        let list = this.layeradmins;
        let temp: Array<any> = [];

        switch(code) {
            case('AZ'):
                for (let i=0; i<list.length; i++) {
                    temp[i] = list[i].layerName
                }
                temp.sort()
                //7/19/17 for array, this.layeradmin[i] = list element where list[i].layername matches temp[i]
                console.log(temp)
                break;
            case('ZA'):
                break;
            case('TYPE'):
                break;
            case('OLD_NEW'):
                break;
            case('NEW_OLD'):
                break;
            case('GEOM'):
                break;
            case('SERVER'):
                break;
            default:
                alert('"' + code + '" is not a valid code.')
                break;                    
        }
    }
}

