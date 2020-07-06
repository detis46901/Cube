import { Component, Input, OnInit, Inject } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { User } from '../../../../_models/user.model';
import { GroupService } from '../../../../_services/_group.service';
import { Group } from '../../../../_models/group.model';
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service';
import { ModuleService } from '../../../../_services/_module.service'
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { ModuleInstance, Module, UsersGroups, InstanceSettings, StringType, ArrayType, IntegerType, Properties, KeyValue } from '../../../../_models/module.model';
import { FeatureModulesAdminService } from '../../../feature-modules/feature-modules-admin.service'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import  cloneDeep  from 'lodash.clonedeep'

@Component({
    selector: 'module-style',
    templateUrl: './moduleSettings.component.html',
    styleUrls: ['./moduleSettings.component.scss'],
    providers: [UserService, GroupService, ModuleInstanceService, LayerPermissionService, FeatureModulesAdminService, ModuleInstanceService]
})

export class ModuleSettingsComponent implements OnInit {
    @Input() instanceID: number;
    @Input() instanceName: string;
    public newInstance: boolean = false
    public closeResult: string;
    public moduleInstance = new ModuleInstance
    public instanceSettings: InstanceSettings
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
    public usersGroups = new Array<KeyValue>()
    public isLoaded: boolean = false


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

    public getModules(): void {
        this.moduleService.GetAll()
            .subscribe((data: Module[]) => {
                console.log(data)
                this.modules = data
            })
    }

    public getModuleSettings(): void {  //run when a module is selected
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
                this.moduleInstance = data
                console.log(data)
                this.instanceSettings = this.moduleInstance.settings
                console.log(this.instanceSettings)
                this.addUserGroups(this.instanceSettings.properties)
                this.instanceSettings.properties.forEach((x) => {
                    if (x.arrayType) {
                        if (x.arrayType.items.length > 0) {
                            x.arrayType.items.forEach((y) => {
                                this.addUserGroups(y.properties)
                            })
                        }    
                    }
                })
                this.isLoaded = true
            });


        // this.instanceSettings = new InstanceSettings
        // this.instanceSettings.title = 'TestTitle'
        // let instProperty = new Properties
        // let arrayType = new ArrayType
        // let itemProperty = new Properties
        // let item = new InstanceSettings
        // let WOName = new StringType
        // WOName.name = "Work Order Name"
        // WOName.type = "string"
        // WOName.description = "It's a name for a work order"
        // itemProperty.stringType = WOName
        // item.properties.push(itemProperty)
        // itemProperty = new Properties
        // let defaultUser = new StringType
        // arrayType.name = 'Users and Groups'
        // defaultUser.name = 'Pick a User or Group'
        // defaultUser.value = 'U1'
        // defaultUser.format = 'UserGroup'
        // 
        // }
        // instProperty.arrayType = arrayType
        // this.instanceSettings.properties.push(instProperty)
        // itemProperty.stringType = defaultUser

        // arrayType.items.push(item)
        // item.properties.push(itemProperty)


        console.log(JSON.stringify(this.instanceSettings))
       // this.isLoaded = true

    }

    public addUserGroups(prop: Properties[]) {
        prop.forEach((p) => {
            if (p.stringType) {
                if (p.stringType.format == 'UserGroup') {
                    this.getUserItems().then((n) => {
                        p.stringType.enum = n
                    })
                        .then(() => {
                            this.getGroupItems().then((o) => {
                                p.stringType.enum = p.stringType.enum.concat(o)
                            })
                        })
                }   
        }
        })
    }
    //2/9/18 this is the last part that needs fixed to get the list to return correctly
    public getUserItems(): Promise<Array<KeyValue>> {
        let promise = new Promise<Array<KeyValue>>((resolve) => {
            let users = new Array<KeyValue>()
            this.userService
                .GetAll()
                .subscribe((data: User[]) => {
                    for (let u of data) {
                        let ug = new KeyValue
                        if (this.permNames.indexOf(u.firstName + " " + u.lastName) == -1) {
                            if (!u.public) {
                                ug.key = 'U' + u.ID
                                ug.value = u.firstName + " " + u.lastName
                                users.push(ug)    
                            }
                        }
                    }
                    resolve(users)
                });
        })
        return promise
    }

    //2/9/18 this is the last part that needs fixed to get the list to return correctly
    public getGroupItems(): Promise<Array<KeyValue>> {
        let promise = new Promise<Array<KeyValue>>((resolve) => {
            let groups = new Array<KeyValue>()
            this.groupService
                .GetAll()
                .subscribe((data: Group[]) => {
                    for (let g of data) {
                        let ug = new KeyValue
                        if (this.permNames.indexOf(g.name) == -1) {
                            this.permlessGroups.push(g);
                            ug.key = 'G' + g.ID
                            ug.value = g.name
                            groups.push(ug)
                        }
                    }
                    resolve(groups)
                });
        })
        return promise
    }

    public updateSettings(): void {
        //this is used to eliminated the enums that got added in by the usergroup
        this.instanceSettings.properties.forEach((x) => {
            if (x.stringType) {
                if (x.stringType.format == 'UserGroup') {
                    x.stringType.enum = []
                }
            }
            if (x.arrayType) {
                x.arrayType.items.forEach((y) => {
                    y.properties.forEach((z) => {
                        if (z.stringType) {
                            if (z.stringType.format == 'UserGroup') {
                                z.stringType.enum = []
                            }
                        }
                    })
                })
            }
        })
        console.log(JSON.stringify(this.instanceSettings))
        console.log(this.moduleInstance)
        this.moduleInstance.settings = JSON.parse(JSON.stringify(this.instanceSettings))
        // let tempJSON:JSON = JSON.parse('{"settings":[{}]}')
        // let i:number = 0

        // this.settingsArray.forEach((each) => {
        //     let temp2JSON:JSON = JSON.parse('{"setting":"temp"}')
        //     temp2JSON["setting"] = each
        //     tempJSON["settings"][i] = temp2JSON
        //     i=i+1
        // })
        // this.moduleInstance.settings = tempJSON
        // this.moduleInstanceService
        //     .Update(this.moduleInstance)
        //     .subscribe((result) => {
        //         console.log("Settings Updated")
        //     });

        console.log(this.moduleInstance)
        this.moduleInstanceService.Update(this.moduleInstance)
            .subscribe((result) => {
                console.log(result)
            })
    }

    public createInstance(): void {
        this.moduleInstance.moduleID = this.selectedModule.ID
        // this.moduleInstance.settings = this.selectedModule.defaultInstanceSettings
        this.moduleInstance.name = 'blank'
        this.moduleInstance.description = 'blank'
        // let tempJSON:JSON = JSON.parse('{"settings":[{}]}')
        // let i:number = 0

        // this.settingsArray.forEach((each) => {
        //     let temp2JSON:JSON = JSON.parse('{"setting":"temp"}')
        //     temp2JSON["setting"] = each
        //     tempJSON["settings"][i] = temp2JSON
        //     i=i+1
        // })
        // this.moduleInstance.settings = tempJSON
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
    public deleteItem(array: ArrayType, item: InstanceSettings) {
        console.log(array)
        console.log(item)
        const index: number = array.items.indexOf(item);
        console.log(index)
        if (index !== -1) {
            array.items.splice(index, 1);
        }
    }

    public addItem(array: ArrayType) {
        let is = new InstanceSettings
        is = {...array.defaultItem}
        // is = cloneDeep(array.defaultItem)
        this.addUserGroups(is.properties)
        
        array.items.forEach((x) => {
            console.log(x.id)
        })
        let max: number = Math.max.apply(Math, array.items.map(function(o) {return o.id}))
        if (!max) {max = 0}
        console.log(max)
array.items.push(is)
        is.id = max + 1
        // array.items.forEach((x) => {
        //     let max: number = Math.max.apply(Math, x.map(function(o) {return o.stringType.id}))
        //     console.log(max)
        // })
        //     //     if (x.stringType) {
        //         is.properties.push(cloneDeep(x))
        //     }
        // })
        // is.properties.forEach((x) => {
        //     if (x.integerType) { x.integerType.value = 0 }
        //     if (x.stringType) { x.stringType.value = '' }
        // })

        // console.log(array)
        // let prop1: Properties = prop[0]
        // if 
        // prop.concat(prop[0])
        // let newInstanceSetting = new InstanceSettings
        // let max: number = Math.max.apply(Math, setting.properties.map(function(o) { return o.id; }))
        // setting.properties.push(newInstanceSetting)
        // newInstanceSetting.id = max + 1
    }
}
