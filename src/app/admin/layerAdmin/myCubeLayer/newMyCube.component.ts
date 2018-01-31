import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { Configuration } from '../../../../_api/api.constants';
import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ServerService } from '../../../../_services/_server.service';
import { SQLService } from '../../../../_services/sql.service';
import { Layer, MyCubeField } from '../../../../_models/layer.model';
import { Server } from '../../../../_models/server.model';
import { LayerPermissionComponent } from '../layerPermission/layerPermission.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'layer-new',
    templateUrl: './newMyCube.component.html',
    styleUrls: ['./newMyCube.component.scss'],
    providers: [UserService, Configuration, LayerService, LayerPermissionService, ServerService],
})

export class newMyCubeComponent implements OnInit {
    @Input() layerServiceField: string;
    @Input() layerIdent: string;
    @Input() layerServer: Server;
    @Input() layerFormat: string;
    @Input() layerType: string;
    @Input() layerName: string;
    private token: string;
    private userID: number;

    //Set to true in ngOnInit() if inputs are read from the server screen, thus determines if the server screen is calling this dialog
    

    //if error in submission, set this to a new object (= new Layer)
    private newLayer = new Layer;
    private newLayerServer = new Server;
    private servers: Array<Server>;
    private layer = new Layer;
    public newLayerField1 = new MyCubeField
    public newLayerFields: Array<MyCubeField> = [];
    
    constructor(private layerservice: LayerService, private dialog: MatDialog, private serverService: ServerService, private sqlservice: SQLService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.layer.layerFormat = "None"
        this.layer.layerIdent = "None"
        this.layer.layerGeom = "None"
        this.layer.layerService = "None"
        this.layer.layerType = "MyCube"
        this.layer.serverID = 0
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

    private addLayer(newlayer: Layer): void {
        this.layer.layerName = newlayer.layerName
        this.layer.layerDescription = newlayer.layerDescription
        console.log("Creating MyCube")
        this.layerservice
            .Add(this.layer)
            .subscribe((result: Layer) => {
                console.log('result=' + JSON.stringify(result))
                this.createTable(result.ID);
            });
    }

    private createTable(id): void {
        console.log("Creating Table")
        this.sqlservice
            .Create(id)
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
            console.log("Creating Comment Table")
            this.sqlservice
            .CreateCommentTable(id)
            .subscribe(result => {
                console.log(result)
            })
            console.log("Comment Table Created")
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