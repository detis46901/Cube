import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { Configuration } from '../../../../_api/api.constants';
import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ServerService } from '../../../../_services/_server.service';
import { SQLService } from '../../../../_services/sql.service';
import { Layer, MyCubeField, MyCubeConstraint } from '../../../../_models/layer.model';
import { Server } from '../../../../_models/server.model';
import { LayerPermissionComponent } from '../layerPermission/layerPermission.component';
import { MatDialog } from '@angular/material/dialog';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

export class MyCubeFieldConfig extends MyCubeField {
    newOrder?:number;
    oldOrder?:number
    }

@Component({
    selector: 'layer-new',
    templateUrl: './newMyCube.component.html',
    styleUrls: ['./newMyCube.component.scss'],
    providers: [UserService, Configuration, LayerService, LayerPermissionService, ServerService],
})

export class newMyCubeComponent implements OnInit {
    // @Input() layerServiceField: string;
    // @Input() layerIdent: string;
    // @Input() layerServer: Server;
    // @Input() layerFormat: string;
    // @Input() layerType: string;
    @Input() layerName: string;
    @Input() inputLayer: Layer
    //Set to true in ngOnInit() if inputs are read from the server screen, thus determines if the server screen is calling this dialog


    //if error in submission, set this to a new object (= new Layer)
    // public newLayer = new Layer;
    public newLayerServer = new Server;
    public servers: Array<Server>;
    public layer = new Layer;
    public newLayerField1 = new MyCubeFieldConfig
    public newLayerFields: Array<MyCubeFieldConfig> = [];
    public editLayerField: MyCubeFieldConfig
    public newConstraint = new MyCubeConstraint
    public edit: boolean = false
    public fieldError: string
    public label:string

    constructor(private layerservice: LayerService, private dialog: MatDialog, private serverService: ServerService, private sqlservice: SQLService) {}

    ngOnInit() {
        if (!this.inputLayer) {
            this.layer.layerFormat = "None"
            this.layer.layerIdent = "None"
            this.layer.layerGeom = "None"
            this.layer.layerService = "None"
            this.layer.layerType = "MyCube"
            this.layer.serverID = 0
            this.layer.defaultStyle = JSON.parse('{"load":{"color":"#000000","width":2},"current":{"color":"#000000","width":4},"listLabel": "Name","filter": {}, "opacity": "100"}')
        }
        else {
            console.log(this.inputLayer)
            this.edit = true
            let i: number = 0
            this.layer = this.inputLayer
            this.sqlservice.GetSchema("mycube", 't' + this.layer.ID.toString())
            .subscribe((x) => {
                this.newLayerFields = x[0].splice(2,x[0].length-2)
                this.newLayerFields.forEach((y) => {
                    if (y.field == this.inputLayer.defaultStyle['listLabel']) {this.label = y.field}
                    y.oldOrder = i
                    i = i+1
                })
                console.log(this.newLayerFields)
            })
        }
    }

    public getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((data) => {
                this.servers = data;
            });
    }

    public addField():void {
        console.log(this.newLayerField1.field)
        if (this.newLayerFields.findIndex((x) => x.field == this.newLayerField1.field) >= 0) {
            this.fieldError = "Duplicate Field Name"
        }
        else {
            this.newLayerFields.push({ field: this.newLayerField1.field, type: this.newLayerField1.type, label: this.newLayerField1.label })
            this.fieldError = null
            if (this.newLayerFields.length == 1) {this.newLayerFields[0].label = true}    
        }
    }

    public deleteField(index) {
        this.newLayerFields.splice(index, 1)
    }

    public addLayer(newlayer: Layer): void {
        this.layer.layerName = newlayer.layerName
        this.layer.layerDescription = newlayer.layerDescription
        this.layerservice
            .Add(this.layer)
            .subscribe((result: Layer) => {
                this.createTable(result.ID);
            });
    }

    public editLayer(editLayer: Layer): void {
        this.sqlservice.GetSchema('mycube', 't'+editLayer.ID)
            .subscribe((x) => {
                let oldLayerFields: Array<MyCubeFieldConfig>
                oldLayerFields = x[0].splice(2,x[0].length-2)
                let i: number = 0
                oldLayerFields.forEach((x) => {
                    if (!this.newLayerFields.find((y) => y.field == x.field)) {
                        this.sqlservice.deleteColumn(editLayer.ID, x)
                        .subscribe((x) => {
                        })
                    }
                })
                this.mc1(editLayer.ID, 0)
            })
        //sets the listlabel
        editLayer.defaultStyle['listLabel'] = this.label
        this.layerservice.Update(editLayer)
            .subscribe((x) => {
                console.log(x)
            })
    }

    //the next two procedures re-order the fields no matter what.  Probably need to figure how to reduce this to only when it's needed.
    public mc1(ID: number, i:number):string {
        if (i == this.newLayerFields.length) {return "done"}
        if (this.newLayerFields[i].oldOrder == null) {
            this.addColumn(ID, this.newLayerFields[i]).then(() => {
                i = i+1
                this.mc1(ID, i)
            }
            )
        }
        else {
            this.moveColumn(this.newLayerFields[i], ID).then(() => {
                i = i+1
                this.mc1(ID, i)
            })
        }
    }

    public moveColumn(mcf: MyCubeFieldConfig, ID): Promise<any> {
        console.log(mcf)
        let promise = new Promise((resolve, reject) => {
                            this.sqlservice.moveColumn(ID, mcf)
                            .subscribe((x) => {
                                this.updateConstraint(mcf, ID)
                                resolve()
                            })
        })
        return promise
    }

    public updateConstraint(mcf: MyCubeFieldConfig, ID): Promise<any> {
        console.log(mcf)
        let promise = new Promise((resolve, reject) => {
            this.sqlservice.updateConstraint('mycube', ID, mcf)
                .subscribe((x) => {
                    console.log(x)
                })
        })
        return promise
    }

    public updateLabelField(labelField: MyCubeField): void {
        for (let tempage of this.newLayerFields) {
            if (tempage.label == true) {
                tempage.label = false;;
            }
        }
        for (let tempage of this.newLayerFields) {
            if (tempage.field == labelField.field) {
                tempage.label = true;
            }
        }
    }

    public viewDetails(index:number): void {
        console.log("viewing details")
        this.editLayerField = this.newLayerFields[index]
    }

    public createTable(id): void {
        this.sqlservice
            .Create(id)
            .subscribe((result: JSON) => {
                console.log('Number of Columns to Add:' + this.newLayerFields.length)
                this.newLayerFields.forEach(element => {
                    this.addColumn(id, element)
                });
                this.sqlservice
                    .setSRID(id)
                    .subscribe(() => this.dialog.closeAll());
            })
        this.sqlservice
            .CreateCommentTable(id)
            .subscribe();
        console.log("Comment Table Created")
    }

    public addColumn(id, element): Promise<any> {
        let promise = new Promise<any>((resolve, reject) => {
            console.log(element)
            this.sqlservice
                .addColumn(id, element)
                .subscribe((result: string) => {
                    console.log(result)
                    resolve()
                });
        })
        return promise
    }

    public addConstraint():void {
        console.log(this.editLayerField)
        if (!this.editLayerField.constraints) {this.editLayerField.constraints = new Array<MyCubeConstraint>()}
        this.editLayerField.constraints.push(this.newConstraint)
        this.newConstraint = new MyCubeConstraint
        console.log(this.newLayerFields)
    }

    public deleteConstraint(index):void {
        this.editLayerField.constraints.splice(index, 1)
    }

    dropLayerFields(event: CdkDragDrop<string[]>) {
        console.log(event)
        moveItemInArray(this.newLayerFields, event.previousIndex, event.currentIndex);
      }
      dropConstraints(event: CdkDragDrop<string[]>) {
        console.log(event)
        moveItemInArray(this.editLayerField.constraints, event.previousIndex, event.currentIndex);
      }
}