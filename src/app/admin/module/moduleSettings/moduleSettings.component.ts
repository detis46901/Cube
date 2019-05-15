import { Component, Input, OnInit, Inject } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { Configuration } from '../../../../_api/api.constants';
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service';
import { ModuleService } from '../../../../_services/_module.service'
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ModuleInstance, Module } from '../../../../_models/module.model';
import { layer, Object } from 'openlayers';
import { jsonpCallbackContext } from '@angular/common/http/src/module';
import { FeatureModulesAdminService } from '../../../feature-modules/feature-modules-admin.service'
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'module-style',
    templateUrl: './moduleSettings.component.html',
    styleUrls: ['./moduleSettings.component.scss'],
    providers: [UserService, GroupService, Configuration, ModuleInstanceService, LayerPermissionService, FeatureModulesAdminService, ModuleInstanceService]
})

export class ModuleSettingsComponent implements OnInit {
    @Input() instanceID: number;
    @Input() instanceName: string;
    public newInstance: boolean = false
    public closeResult: string;
    public moduleInstance = new ModuleInstance
    public settings: string;
    public settingsArray = new Array<JSON>();
    public permlessUsers = new Array<User>();
    public permlessGroups = new Array<Group>();
    public modules = new Array<Module>()
    public selectedModule = new Module
    public token: string;
    public userID: number;
    public permNames = new Array<string>();
    public layerOwner: number;
    public isGroup: boolean = false;
    public moduleSelected: boolean = false

    public currDeletedPermObj: any; //Group or User Object
    public currDeletedPermIsUser: boolean; //True if it is a User object from the permission.

    constructor(private moduleInstanceService: ModuleInstanceService,
        private moduleService: ModuleService,
        private userService: UserService,
        private groupService: GroupService,
        private featureModuleAdminService: FeatureModulesAdminService,
        public dialogRef: MatDialogRef<ModuleSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    ngOnInit() {
        if (this.instanceID == null) {
            this.newInstance = true
            this.getModules()
        }
        else {
            this.getInstanceSettings();
        }
    }

    public getModules():void {
        this.moduleService.GetAll()
        .subscribe((data:Module[]) => {
            console.log(data)
            this.modules = data
        })
    }

    public getModuleSettings():void {  //run when a module is selected
        console.log("getModuleSettings")
        this.settingsArray = []
        this.settings = JSON.stringify(this.selectedModule.defaultInstanceSettings)
        for (let i of this.selectedModule.defaultInstanceSettings['settings']) {
            this.settingsArray.push(i['setting'])
        }
        this.moduleSelected = true
    }

    public getInstanceSettings(): void {
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
    public getUserItems(calledByDelete: boolean): void {
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
    public getGroupItems(calledByDelete: boolean): void {
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

    public updateSettings(): void {
        let tempJSON:JSON = JSON.parse('{"settings":[{}]}')
        let i:number = 0

        this.settingsArray.forEach((each) => {
            let temp2JSON:JSON = JSON.parse('{"setting":"temp"}')
            temp2JSON["setting"] = each
            tempJSON["settings"][i] = temp2JSON
            i=i+1
        })
        this.moduleInstance.settings = tempJSON
        this.moduleInstanceService
            .Update(this.moduleInstance)
            .subscribe((result) => {
                console.log("Settings Updated")
            });
    }

    public createInstance(): void {
        this.moduleInstance.moduleID = this.selectedModule.ID
        let tempJSON:JSON = JSON.parse('{"settings":[{}]}')
        let i:number = 0

        this.settingsArray.forEach((each) => {
            let temp2JSON:JSON = JSON.parse('{"setting":"temp"}')
            temp2JSON["setting"] = each
            tempJSON["settings"][i] = temp2JSON
            i=i+1
        })
        this.moduleInstance.settings = tempJSON
        this.moduleInstanceService
            .Add(this.moduleInstance)
            .subscribe((result: ModuleInstance) => {
                console.log(result)
                this.moduleInstanceService.GetSingle(result.ID)
                .subscribe(x => {
                    console.log(x)
                    this.featureModuleAdminService.createModuleInstance(x)
                })
                console.log("Instance Added")
                //this.featureModuleAdminService.createModuleInstance(result)
                this.dialogRef.close();
            });
        
    }
}