import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { Configuration } from '../../../../_api/api.constants';
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ModuleInstance } from '../../../../_models/module.model';
import { layer, Object } from 'openlayers';
import { jsonpCallbackContext } from '@angular/common/http/src/module';

@Component({
    selector: 'module-style',
    templateUrl: './moduleSettings.component.html',
    styleUrls: ['./moduleSettings.component.scss'],
    providers: [UserService, GroupService, Configuration, ModuleInstanceService, LayerPermissionService]
})

export class ModuleSettingsComponent implements OnInit {
    @Input() instanceID: number;
    @Input() instanceName: string;
    private closeResult: string;
    private moduleInstance: ModuleInstance
    private settings: string;
    private settingsArray = new Array<JSON>();
    private permlessUsers = new Array<User>();
    private permlessGroups = new Array<Group>();
    private token: string;
    private userID: number;
    private permNames = new Array<string>();
    private layerOwner: number;
    private isGroup: boolean = false;

    private currDeletedPermObj: any; //Group or User Object
    private currDeletedPermIsUser: boolean; //True if it is a User object from the permission.

    constructor(private moduleInstanceService: ModuleInstanceService, private userService: UserService, private groupService: GroupService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        this.getInstanceSettings();
    }

    private getInstanceSettings(): void {
        this.moduleInstanceService
            .GetSingle(this.instanceID)
            .subscribe((data: ModuleInstance) => {
                this.moduleInstance = data;
                this.settings = JSON.stringify(this.moduleInstance.settings)
                for (let i of this.moduleInstance.settings['settings']) {
                    this.settingsArray.push(i['setting'])
                }
            });

    }

    //2/9/18 this is the last part that needs fixed to get the list to return correctly
    private getUserItems(calledByDelete: boolean): void {
        this.permlessUsers = [];

        if (this.currDeletedPermIsUser == true && calledByDelete) {
            //this.permlessUsers.push(this.currDeletedPermObj)
            this.currDeletedPermIsUser = null;
            this.currDeletedPermObj = null;
        }

        this.userService
            .GetAll()
            .subscribe((data: User[]) => {
                for (let u of data) {
                    //If no existing permission exists for the user
                    if (this.permNames.indexOf(u.firstName + " " + u.lastName) == -1) {
                        this.permlessUsers.push(u);
                    }
                }
            });
    }

    //2/9/18 this is the last part that needs fixed to get the list to return correctly
    private getGroupItems(calledByDelete: boolean): void {
        this.permlessGroups = [];

        if (this.currDeletedPermIsUser == false && calledByDelete) {
            //this.permlessGroups.push(this.currDeletedPermObj)
            this.currDeletedPermIsUser = null;
            this.currDeletedPermObj = null;
        }

        this.groupService
            .GetAll()
            .subscribe((data: Group[]) => {
                for (let g of data) {
                    //If no existing permission exists for the group
                    if (this.permNames.indexOf(g.name) == -1) {
                        this.permlessGroups.push(g);
                    }
                }
            });
    }


    private updateSettings(moduleInstance: ModuleInstance): void {
        let tempJSON:JSON = JSON.parse('{"settings":[{}]}')
        let i:number = 0

        this.settingsArray.forEach((each) => {
            let temp2JSON:JSON = JSON.parse('{"setting":"temp"}')
            temp2JSON["setting"] = each
            tempJSON["settings"][i] = temp2JSON
            i=i+1
        })
        console.log(JSON.stringify(tempJSON))
        let tempStart:JSON = JSON.parse(`{"settings":[{"setting":{"name":"myCube Layer Identity (integer)","type":"integer","value":0}}]}`)
        this.moduleInstance.settings = tempJSON
        this.moduleInstanceService
            .Update(this.moduleInstance)
            .subscribe((result) => {
                console.log("Settings Updated")
            });
    }
}