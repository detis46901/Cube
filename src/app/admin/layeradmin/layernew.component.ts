
import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { UserService } from '../../../_services/user.service';
import { User } from '../../../_models/user.model'
import { Configuration } from '../../../_api/api.constants'
import { LayerAdminService } from '../../../_services/layeradmin.service';
import { LayerPermissionService } from '../../../_services/layerpermission.service';
import { ServerService } from '../../../_services/server.service';
import { LayerAdmin, LayerPermission } from '../../../_models/layer.model'
import { Server } from '../../../_models/server.model'
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LayerPermissionComponent } from './layerpermission.component'
import { MdDialog, MdDialogRef } from '@angular/material';


@Component({
  selector: 'layernew',
  templateUrl: './layernew.component.html',
  styleUrls: ['./layernew.component.scss'],
  providers: [UserService, Configuration, LayerAdminService, LayerPermissionService, ServerService],
})
export class LayerNewComponent implements OnInit{
    @Input() layerService
    @Input() layerIdent;
    @Input() layerServer;
    @Input() layerFormat;
    @Input() layerType;
    @Input() layerName;

    //Set to true in ngOnInit() if inputs are read from the server screen, thus the server screen is calling this modal
    public serverCalled: boolean = false;


    public closeResult: string;
    public newlayeradmin = new LayerAdmin;
    public newlayerserver = new Server;
    public servers: Array<Server>;
    public token: string;
    public userID: number;
    public userperm: string;
    public layeradmin = new LayerAdmin;

    constructor(private layerAdminService: LayerAdminService, private dialog: MdDialog, private serverService: ServerService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
            this.token = currentUser && currentUser.token;
            this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       this.getServers()
       console.log (this.layerIdent)
       if(this.layerIdent!=null && this.layerType!=null && this.layerServer!=null) {
            this.serverCalled = true;
            this.newlayeradmin.layerName = this.layerName;
            console.log("ServerCalled")
       }
       //console.log(this.layerName + this.layerIdent + this.layerFormat + this.layerServer)
    }

    getServers() {
        console.log("get servers")
        this.serverService
            .GetAll()
            .subscribe((data) => this.servers = data,
                error => console.log(error),
                () => console.log(this.servers)
            );
    }

    // open(content) {
    //     console.log("layernew open(content)")
    //     this.userperm = "A user"
    //     this.modalService.open(content, {size:'lg'}).result.then((result) => {
    //         this.closeResult = `Closed with: ${result}`;
    //     }, (reason) => {
    //         this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //     });
    // }

    getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
    }

    openpermission(layerid, layername) {
        const dialogRef = this.dialog.open(LayerPermissionComponent)
        dialogRef.componentInstance.layerID = layerid
        dialogRef.componentInstance.layerName = layername
        dialogRef.afterClosed().subscribe(result => {
            this.getDismissReason = result;
        });
    }

    addLayer(newlayer) {
        console.log(newlayer)
        this.layeradmin = newlayer;
        if(this.serverCalled) {
            console.log("serverCalled")
            this.layeradmin.serverID = this.layerServer.ID;
            this.layeradmin.layerService = this.layerService
            this.layeradmin.layerIdent = this.layerIdent;
            this.layeradmin.layerType = this.layerType;
            console.log(this.layeradmin)
        }

        console.log(this.layeradmin)
        this.layerAdminService
            .Add(this.layeradmin)
            .subscribe(result => {
                console.log(result)
                this.dialog.closeAll()
            })      
    }
}