import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { Configuration } from '../../../../_api/api.constants';
import { LayerAdminService } from '../../../../_services/_layerAdmin.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ServerService } from '../../../../_services/_server.service';
import { SQLService } from '../../../../_services/sql.service';
import { LayerAdmin, MyCubeField } from '../../../../_models/layer.model';
import { Server } from '../../../../_models/server.model';
import { LayerPermissionComponent } from '../layerPermission/layerPermission.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'layer-new',
    templateUrl: './newMyCube.component.html',
    styleUrls: ['./newMyCube.component.scss'],
    providers: [UserService, Configuration, LayerAdminService, LayerPermissionService, ServerService],
})

export class newMyCubeComponent implements OnInit {
    @Input() layerService: string;
    @Input() layerIdent: string;
    @Input() layerServer: Server;
    @Input() layerFormat: string;
    @Input() layerType: string;
    @Input() layerName: string;
    private token: string;
    private userID: number;

    //Set to true in ngOnInit() if inputs are read from the server screen, thus determines if the server screen is calling this dialog
    

    //if error in submission, set this to a new object (= new LayerAdmin)
    private newLayerAdmin = new LayerAdmin;
    private newLayerServer = new Server;
    private servers: Array<Server>;
    private layerAdmin = new LayerAdmin;
    public newLayerField1 = new MyCubeField
    public newLayerFields: Array<MyCubeField> = [];
    
    constructor(private layerAdminService: LayerAdminService, private dialog: MatDialog, private serverService: ServerService, private sqlservice: SQLService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.layerAdmin.layerFormat = "None"
        this.layerAdmin.layerIdent = "None"
        this.layerAdmin.layerGeom = "None"
        this.layerAdmin.layerService = "None"
        this.layerAdmin.layerType = "MyCube"
        this.layerAdmin.serverID = 0
        // this.newLayerField1.field = "Field 1"
        // this.newLayerField1.type = "type 1"
       
        // console.log(this.newLayerFields.push())
        // this.newLayerFields[0].field = "Field1"
        // this.newLayerFields[0].type = "type1"
    }

    private getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((data) => {
                this.servers = data;
            });
    }

    private addField() {
        console.log("Add Field")
        this.newLayerFields.push({field: this.newLayerField1.field, type: this.newLayerField1.type})
            console.log(this.newLayerFields)
    }

    private deleteField(index) {
        console.log("Deleting Field")
        this.newLayerFields.splice(index,1)
            console.log(this.newLayerFields)
    }

    private addLayer(newlayer: LayerAdmin): void {
        this.layerAdmin.layerName = newlayer.layerName
        this.layerAdmin.layerDescription = newlayer.layerDescription
        console.log("Creating MyCube")
        this.layerAdminService
            .Add(this.layerAdmin)
            .subscribe((result: LayerAdmin) => {
                console.log('result=' + JSON.stringify(result))
                this.createTable(result.ID);
            });
    }

    private createTable(id): void {
        console.log("Creating Table")
        this.sqlservice
            .Create(id, this.newLayerFields)
            .subscribe(result => {
                console.log('Number of Columns to Add:' + this.newLayerFields.length)
                this.newLayerFields.forEach(element => {
                    this.addColumn(id, element)
                });
                this.sqlservice
                    .setSRID(id)
                    .subscribe(result => {
                        console.log('SRID set')
                    })
                this.dialog.closeAll();
            })
    }

    private addColumn(id, element): void {
        console.log("Adding Columns")
        this.sqlservice
            .addColumn(id, element)
            .subscribe(result=> {
                console.log(result)
            })
    }
}