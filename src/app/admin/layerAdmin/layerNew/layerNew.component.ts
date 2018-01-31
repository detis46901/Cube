import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { Configuration } from '../../../../_api/api.constants';
import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ServerService } from '../../../../_services/_server.service';
import { Layer } from '../../../../_models/layer.model';
import { Server } from '../../../../_models/server.model';
import { LayerPermission } from '../../../../_models/layer.model';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'layer-new',
    templateUrl: './layerNew.component.html',
    styleUrls: ['./layerNew.component.scss'],
    providers: [UserService, Configuration, LayerService, LayerPermissionService, ServerService],
})

export class LayerNewComponent implements OnInit {
    @Input() layerServiceField: string;
    @Input() layerIdent: string;
    @Input() layerServer: Server;
    @Input() layerFormat: string;
    @Input() layerType: string;
    @Input() layerName: string;
    private token: string;
    private userID: number;

    //Set to true in ngOnInit() if inputs are read from the server screen, thus determines if the server screen is calling this dialog
    private serverCalled: boolean = false;

    //if error in submission, set this to a new object (= new Layer)
    private newLayer = new Layer;
    private newLayerServer = new Server;
    private servers: Array<Server>;
    private layer = new Layer;

    constructor(private layerservice: LayerService, private layerPermissionService: LayerPermissionService, private dialog: MatDialog, private serverService: ServerService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getServers();
        if (this.layerIdent!=null && this.layerType!=null && this.layerServer!=null) {
            this.serverCalled = true;
        }
        console.log (this.userID)
    }

    private getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((data) => {
                this.servers = data;
            });
    }

    private addLayer(newlayer: Layer): void {
        this.layer = newlayer;
        let layerPerm = new LayerPermission;
        layerPerm.userID = this.userID;
        layerPerm.layerID = newlayer.ID;
        layerPerm.groupID = null;
        layerPerm.edit = true;
        layerPerm.delete = true;
        layerPerm.owner = true;
        layerPerm.canGrant = true;
        layerPerm.grantedBy = null;
        layerPerm.comments = null;

        if (this.serverCalled) {
            this.layer.serverID = this.layerServer.ID;
            this.layer.layerService = this.layerServiceField;
            this.layer.layerIdent = this.layerIdent;
            this.layer.layerType = this.layerType;
            //this.layer.layerFormat = this.layerFormat;
        }
        //console.log(this.token)
        this.layerservice
            //.Add(this.layer, this.token)
            .Add(this.layer)
            .subscribe(result => {
                console.log('result=' + JSON.stringify(result))
            });
        
        this.layerPermissionService
            .Add(layerPerm)
            .subscribe(() => this.dialog.closeAll())
            
    }
}