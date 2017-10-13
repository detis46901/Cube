import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';
import { Configuration } from '../../../_api/api.constants';
import { LayerAdminService } from '../../../_services/_layerAdmin.service';
import { LayerPermissionService } from '../../../_services/_layerPermission.service';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { LayerAdmin, LayerPermission } from '../../../_models/layer.model';
import { LayerPermissionComponent } from './layerPermission/layerPermission.component';
import { LayerNewComponent } from './layerNew/layerNew.component';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { ServerService } from '../../../_services/_server.service';
import { Server } from '../../../_models/server.model';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'layer-admin',
    templateUrl: './layerAdmin.component.html',
    providers: [UserService, Configuration, LayerAdminService, LayerPermissionService, UserPageLayerService, ServerService],
    styleUrls: ['./layerAdmin.component.scss']
})

export class LayerAdminComponent implements OnInit {

    //objCode refers to the admin menu tab the user is on, so the openConfDel method knows what to interpolate based on what it's deleting
    private objCode: number = 2;
    private token: string;
    private userID: number;

    private layerAdmins: LayerAdmin[];
    private servers: Array<Server>;

    constructor(private layerAdminService: LayerAdminService, private dialog: MatDialog, private layerPermissionService: LayerPermissionService, private userPageLayerService: UserPageLayerService, private serverService: ServerService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
    }

    ngOnInit() {
        this.getLayerItems();
        this.getServers();
    }

    private getLayerItems(): void {
        this.layerAdminService
            .GetAll()
            .subscribe((data: LayerAdmin[]) => {
                this.layerAdmins = data;
            });
    }

    private getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((data: Server[]) => {
                this.servers = data;
            });
    }

    private createLayer(): void {
        const dialogRef = this.dialog.open(LayerNewComponent, {height:'360px', width:'500px'});
        dialogRef.afterClosed().subscribe(() => {
            this.getLayerItems();
        });
    }

    private openPermission(layerid: number, layername: string): void {
        const dialogRef = this.dialog.open(LayerPermissionComponent, {height:'460px', width:'350px'});
        dialogRef.componentInstance.layerID = layerid;
        dialogRef.componentInstance.layerName = layername;
    }

    private openConfDel(layer: LayerAdmin): void {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = layer.ID;
        dialogRef.componentInstance.objName = layer.layerName;
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteLayer(layer.ID);
            }
        });
    }

    private updateLayer(layer: LayerAdmin): void {
        this.layerAdminService
            .Update(layer)
            .subscribe(() => {
                this.getLayerItems();
            });
    }

    //Should in theory delete layer including dependents: layer(layerid), layer_permissions(layerid), and user_page_layers(layerid)
    private deleteLayer(layerID: number): void {
        this.layerPermissionService
            .GetSome(layerID)
            .subscribe(result => {
                for (let i of result) {
                    //This does not currently delete layerPermission
                    this.layerPermissionService.Delete(i.ID);
                }
            });

        this.layerAdminService
            .Delete(layerID)
            .subscribe(() => {
                this.getLayerItems();
            });
    }

    //To be expanded to sort layers on display via html button press.
    private sortLayers(code: string): void {
        let indexList: Array<number> = [];
        let list = this.layerAdmins;
        let temp: Array<any> = [];

        switch (code) {
        case ('AZ'):
            this.orderAZ();
            break;
        case ('ZA'):
            break;
        case ('TYPE'):
            break;
        case ('OLD_NEW'):
            break;
        case ('NEW_OLD'):
            break;
        case ('GEOM'):
            break;
        case ('SERVER'):
            break;
        default:
            alert('"' + code + '" is not a valid code.');
            break;
        }
    }

    private orderAZ(): void {
        let indexList: Array<number> = [];
        let list, temp = this.layerAdmins;
        for (let i=0; i<list.length; i++) {
            temp[i] = list[i].layerName;
        }
    }
}

