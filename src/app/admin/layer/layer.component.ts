import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';
import { Configuration } from '../../../_api/api.constants';
import { LayerService } from '../../../_services/_layer.service';
import { LayerPermissionService } from '../../../_services/_layerPermission.service';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { SQLService } from '../../../_services/sql.service';
import { Layer, LayerPermission, UserPageLayer } from '../../../_models/layer.model';
import { LayerPermissionComponent } from './layerPermission/layerPermission.component';
import { LayerStyleComponent } from './layerStyle/layerStyle.component';
import { LayerNewComponent } from './layerNew/layerNew.component';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { newMyCubeComponent } from './myCubeLayer/newMyCube.component';
import { ServerService } from '../../../_services/_server.service';
import { Server } from '../../../_models/server.model';
import { MatDialog, MatDialogConfig  } from '@angular/material';
import { TableDataSource, DefaultValidatorService, ValidatorService, TableElement } from 'angular4-material-table';
import { LayerValidatorService } from './layerValidator.service';
import { LayerDetailsComponent } from '../details/layerDetails/layerDetails.component';

@Component({
    selector: 'layer',
    templateUrl: './layer.component.html',
    providers: [UserService, Configuration, LayerService, LayerPermissionService, UserPageLayerService, ServerService, SQLService, {provide: ValidatorService, useClass: LayerValidatorService}],
    styleUrls: ['./layer.component.scss']
})

export class LayerComponent implements OnInit {
    //objCode refers to the  menu tab the user is on, so the openConfDel method knows what to interpolate based on what it's deleting
    private objCode: number = 2;
    private token: string;
    private userID: number;

    private layers: Layer[];
    private servers: Server[];

    private layerColumns = ['layerID', 'name', /*'identity', 'service', 'server', */'description', /*'format', */'type', /*'geometry', */'actionsColumn'];
    private dataSource: TableDataSource<Layer>;

    constructor(private layerValidator: ValidatorService, private layerService: LayerService, private dialog: MatDialog, private layerPermissionService: LayerPermissionService, private userPageLayerService: UserPageLayerService, private serverService: ServerService, private sqlservice: SQLService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser.token;
        this.userID = currentUser.userID;
    }

    ngOnInit() {
        this.getLayerItems();
        this.getServers();
    }

    private getLayerItems(): void {
        this.layerService
            .GetAll()
            .subscribe((layers: Layer[]) => {
                this.layers = layers;
                this.dataSource = new TableDataSource<Layer>(layers, Layer, this.layerValidator);
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
        const dialogRef = this.dialog.open(LayerNewComponent, {height:'700px', width:'700px'});
        dialogRef.afterClosed().subscribe(() => {
            this.getLayerItems();
        });
    }

    private createMyCube(): void {
        const dialogRef = this.dialog.open(newMyCubeComponent, {height:'350px', width:'500px'});
        dialogRef.afterClosed().subscribe(() => {
            this.getLayerItems();
        });
    }

    private openPermission(layerid: number, layername: string): void {
        const dialogRef = this.dialog.open(LayerPermissionComponent);
        dialogRef.componentInstance.layerID = layerid;
        dialogRef.componentInstance.layerName = layername;
    }

    private openStyle(layerid: number, layername: string): void {
        const dialogRef = this.dialog.open(LayerStyleComponent);
        dialogRef.componentInstance.layerID = layerid;
        dialogRef.componentInstance.layerName = layername;
    }

    private openDetails(id: number, name: string): void {
        const dialogRef = this.dialog.open(LayerDetailsComponent);
        dialogRef.componentInstance.ID = id;
        dialogRef.componentInstance.name = name;
        dialogRef.afterClosed().subscribe(() => {
            this.getLayerItems();
        })
    }

    private confirmDelete(layer: Layer): void {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = layer.ID;
        dialogRef.componentInstance.objName = layer.layerName;
        dialogRef.afterClosed().subscribe(result => {
            if (result == this.objCode) {
                //this.deletePermission(layer.ID);
                //this.deleteUPL(layer.ID);
                this.deleteLayer(layer.ID);
            }
        });
    }

    private updateLayer(layer: Layer): void {
        this.layerService
            .Update(layer)
            .subscribe(() => {
                this.getLayerItems();
            });
    }

    private deletePermission(layerID: number) {
        this.layerPermissionService
        .GetByLayer(layerID)
        .subscribe(result => {
            for (let i of result) {
                this.layerPermissionService
                    .Delete(i.ID)
                    .subscribe((res) => {});
            }
        });
    }

    private deleteUPL(layerID: number): void {
        this.userPageLayerService
        .GetByLayer(layerID)
        .subscribe((res: UserPageLayer[]) => {
            for(let i of res) {
                this.userPageLayerService
                    .Delete(i.ID)
                    .subscribe((res) => {})
            }
        });

    }

    private deleteLayer(layerID: number): void {
        this.layerService
            .GetSingle(layerID)
            .subscribe((result: Layer) => {
                if (result.layerType=='MyCube') {
                    this.sqlservice.deleteTable(result.ID)
                        .subscribe()
                    this.sqlservice.deleteCommentTable(result.ID)
                        .subscribe()
                }
            });

        this.layerService
            .Delete(layerID)
                .subscribe(() => {
                    this.getLayerItems();
                });
    }
     
    // 2/2/18: Keep this here to remind you: DON'T do it this way, when you get to it, implement using the pagination/sorting features of mat-table
    private sortLayers(code: string): void {
        let indexList: Array<number> = [];
        let list = this.layers;
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
        let list, temp = this.layers;
        for (let i=0; i<list.length; i++) {
            temp[i] = list[i].layerName;
        }
    }
}

