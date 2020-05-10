import { Component, OnInit, Input, Inject } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { LayerService } from '../../../../_services/_layer.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ServerService } from '../../../../_services/_server.service';
import { Layer, WMSLayer } from '../../../../_models/layer.model';
import { Server } from '../../../../_models/server.model';
import { LayerPermission } from '../../../../_models/layer.model';
import { MatDialog } from '@angular/material/dialog';
import { ModulePermissionComponent } from '../modulePermission/modulePermission.component';
import { User } from '../../../../_models/user.model';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'instance-new',
    templateUrl: './instanceNew.component.html',
    styleUrls: ['./instanceNew.component.scss'],
    providers: [UserService, LayerService, LayerPermissionService, ServerService, ModulePermissionComponent],
})

export class InstanceNewComponent implements OnInit {
    @Input() layerServiceField: string;
    @Input() serverLayer: Layer;
    @Input() layerIdent: string;
    @Input() serverCalled: boolean = false;
    @Input() layerServer: Server;
    @Input() layerName: string;

    public permlessUsers = new Array<User>()
    public permlessGroups = new Array<Group>();
    public token: string;
    public userID: number;
    public step = 0;
    public isGroup: boolean = false;
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
    public newLayer = new Layer;
    public newLayerServer = new Server;
    public servers: Array<Server>;
    public layer = new Layer;
    public newLayerPermission = new LayerPermission;

    public currDeletedPermObj: any; //Group or User Object
    public currDeletedPermIsUser: boolean; //True if it is a User object from the permission.
    public permNames = new Array<string>();


    //steps that should occur in this component
    //identify the layer
    //provide permissions
    //place on userpages?

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private layerservice: LayerService, private layerPermissionService: LayerPermissionService, private dialog: MatDialog, private serverService: ServerService, private groupService: GroupService, private userService: UserService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {

        if (this.data) {
            console.log("Coming from server dialog")
            console.log(this.data['serverLayer'])
            this.newLayer = this.data['serverLayer']
        }
        this.getServers();
    }

    public getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((data) => {
                this.servers = data;
            });
    }

    public addLayer(newlayer: Layer): void {
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
            .subscribe((data) => {
            console.log(data)
            this.dialog.closeAll()});
    }

    public switchPermType() {
        this.isGroup = !this.isGroup;
    }

    public checkLength() {
        if (this.newLayer.layerName.length > 20) {
            console.log("this might be too long")
        }
    }
}