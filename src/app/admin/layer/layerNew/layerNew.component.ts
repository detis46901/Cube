import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { Configuration } from '../../../../_api/api.constants';
import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ServerService } from '../../../../_services/_server.service';
import { Layer, WMSLayer } from '../../../../_models/layer.model';
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
    @Input() serverLayer: Layer;
    @Input() layerIdent: string;
    @Input() serverCalled: boolean = false;
    //@Input() layerServer: Server;
    @Input() layerName: string;
    private token: string;
    private userID: number;
    private step = 0;
    setStep(index: number) {
        this.step = index;
    }

    nextStep() {
        this.step++;
    }

    prevStep() {
        this.step--;
    }

    //Set to true in ngOnInit() if inputs are read from the server screen, thus determines if the server screen is calling this dialog

    //if error in submission, set this to a new object (= new Layer)
    private newLayer = new Layer;
    private newLayerServer = new Server;
    private servers: Array<Server>;
    private layer = new Layer;


    //steps that should occur in this component
    //identify the layer
    //provide permissions
    //place on userpages?

    constructor(private layerservice: LayerService, private layerPermissionService: LayerPermissionService, private dialog: MatDialog, private serverService: ServerService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        if (this.serverLayer) { this.newLayer = this.serverLayer }
        console.log(this.newLayer)
        this.getServers();
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

        this.layerservice
            .Add(this.layer)
            .subscribe(() => this.dialog.closeAll());
    }
}