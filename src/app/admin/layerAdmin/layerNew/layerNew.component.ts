import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { Configuration } from '../../../../_api/api.constants';
import { LayerAdminService } from '../../../../_services/_layerAdmin.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ServerService } from '../../../../_services/_server.service';
import { LayerAdmin } from '../../../../_models/layer.model';
import { Server } from '../../../../_models/server.model';
import { LayerPermissionComponent } from '../layerPermission/layerPermission.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'layer-new',
    templateUrl: './layerNew.component.html',
    styleUrls: ['./layerNew.component.scss'],
    providers: [UserService, Configuration, LayerAdminService, LayerPermissionService, ServerService],
})

export class LayerNewComponent implements OnInit {
    @Input() layerService: string;
    @Input() layerIdent: string;
    @Input() layerServer: Server;
    @Input() layerFormat: string;
    @Input() layerType: string;
    @Input() layerName: string;
    private token: string;
    private userID: number;

    //Set to true in ngOnInit() if inputs are read from the server screen, thus determines if the server screen is calling this dialog
    private serverCalled: boolean = false;

    //if error in submission, set this to a new object (= new LayerAdmin)
    private newLayerAdmin = new LayerAdmin;
    private newLayerServer = new Server;
    private servers: Array<Server>;
    private layerAdmin = new LayerAdmin;

    constructor(private layerAdminService: LayerAdminService, private dialog: MatDialog, private serverService: ServerService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getServers();
        if (this.layerIdent!=null && this.layerType!=null && this.layerServer!=null) {
            this.serverCalled = true;
        }
    }

    private getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((data) => {
                this.servers = data;
            });
    }

    private addLayer(newlayer: LayerAdmin): void {
        this.layerAdmin = newlayer;

        if (this.serverCalled) {
            this.layerAdmin.serverID = this.layerServer.ID;
            this.layerAdmin.layerService = this.layerService;
            this.layerAdmin.layerIdent = this.layerIdent;
            this.layerAdmin.layerType = this.layerType;
            //this.layerAdmin.layerFormat = this.layerFormat;
        }
        //console.log(this.token)
        this.layerAdminService
            .Add(this.layerAdmin, this.token)
            .subscribe(result => {
                console.log('result=' + JSON.stringify(result))
                this.dialog.closeAll();
            });
    }
}