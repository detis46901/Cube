import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';
import { ModuleInstanceService } from '../../../_services/_moduleInstance.service';
import { ModulePermissionService } from '../../../_services/_modulePermission.service';
import { UserPageInstanceService } from '../../../_services/_userPageInstance.service';
import { SQLService } from '../../../_services/sql.service';
import { Module, ModuleInstance, ModulePermission, UserPageInstance } from '../../../_models/module.model';
import { ModulePermissionComponent } from './modulePermission/modulePermission.component';
import { ModuleSettingsComponent } from './moduleSettings/moduleSettings.component';
import { InstanceNewComponent } from './instanceNew/instanceNew.component';
import { ConfirmDeleteComponent } from '../confirmdelete/confirmdelete.component';
import { ModuleService } from '../../../_services/_module.service';
import { Server } from '../../../_models/server.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { InstanceDetailsComponent } from '../details/instanceDetails/instanceDetails.component';
import { FeatureModulesAdminService } from '../../feature-modules/feature-modules-admin.service'
import { FeatureModulesAdminComponent } from '../../feature-modules/feature-modules-admin/feature-modules-admin.component'


@Component({
    selector: 'instance',
    templateUrl: './instance.component.html',
    providers: [UserService, ModuleInstanceService, ModulePermissionService, UserPageInstanceService, ModuleService, SQLService, FeatureModulesAdminService],
    styleUrls: ['./instance.component.scss']
})

export class InstanceComponent implements OnInit {
    //objCode refers to the  menu tab the user is on, so the openConfDel method knows what to interpolate based on what it's deleting
    public objCode: number = 2;
    public instances: ModuleInstance[];
    public modules: Module[];

    public instanceColumns = ['instanceID', 'name', /*'identity', 'service', 'server', 'description',*/ /*'format', */'description', /*'geometry', */'actionsColumn'];
    public dataSource: any;

    constructor(private moduleInstanceService: ModuleInstanceService, private dialog: MatDialog, private modulePermissionService: ModulePermissionService, private userPageInstanceService: UserPageInstanceService, private moduleService: ModuleService, private sqlservice: SQLService, private featureModuleAdminService: FeatureModulesAdminService) {}

    ngOnInit() {
        this.getInstanceItems();
        this.getModules();
    }

    private getInstanceItems(): void {
        this.moduleInstanceService
            .GetAll()
            .subscribe((instances: ModuleInstance[]) => {
                console.log(instances)
                this.instances = instances;
                this.dataSource = instances
                console.log(this.instances)
            });
    }

    public getModules(): void {
        this.moduleService
            .GetAll()
            .subscribe((data: Module[]) => {
                this.modules = data;
            });
    }

    // public createInstance(): void {
    //     const dialogRef = this.dialog.open(InstanceNewComponent, { height: '450px', width: '450px' });
    //     dialogRef.afterClosed().subscribe(() => {
    //         this.getInstanceItems();
    //     });
    // }

    public openPermission(instanceid: number, instancename: string): void {
        const dialogRef = this.dialog.open(ModulePermissionComponent);
        dialogRef.componentInstance.instanceID = instanceid;
        dialogRef.componentInstance.instanceName = instancename;
    }

    public openSettings(instanceid: number, instancename: string): void {
        const dialogRef = this.dialog.open(ModuleSettingsComponent, { height: '450px', width: '750px' });
        dialogRef.componentInstance.instanceID = instanceid;
        dialogRef.componentInstance.instanceName = instancename;
    }

    public createInstance(): void {
        const dialogRef = this.dialog.open(ModuleSettingsComponent, { height: '450px', width: '450px' });
        dialogRef.afterClosed().subscribe(() => {
            this.getInstanceItems();
        })
    }

    public openDetails(id: number, name: string): void {
        const dialogRef = this.dialog.open(InstanceDetailsComponent, { width: '450px' });
        dialogRef.componentInstance.ID = id;
        dialogRef.componentInstance.name = name;
        dialogRef.afterClosed().subscribe(() => {
            this.getInstanceItems();
        })
    }

    public confirmDelete(instance: ModuleInstance): void {
        console.log(instance)
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = instance.ID;
        dialogRef.componentInstance.objName = instance.name;
        dialogRef.afterClosed().subscribe(result => {
            if (result == this.objCode) {
                this.deleteInstance(instance.ID);
                this.userPageInstanceService.GetByInstance(instance.ID)
                    .subscribe((x: UserPageInstance[]) => {
                        console.log(x)
                        x.forEach((y) => {
                            this.userPageInstanceService.Delete(y.ID)
                                .subscribe()
                        })
                    })
                this.modulePermissionService.GetByInstance(instance.ID)
                .subscribe((x:ModulePermission[]) => {
                    x.forEach(x => {
                        this.modulePermissionService.Delete(x.ID)
                    })
                })
                this.featureModuleAdminService.deleteModuleInstance(instance)
            }
        });
    }

    public updateInstance(instance: ModuleInstance): void {
        this.moduleInstanceService
            .Update(instance)
            .subscribe(() => {
                this.getInstanceItems();
            });
    }

    public deletePermission(instanceID: number) {
        this.modulePermissionService
            .GetByInstance(instanceID)
            .subscribe(result => {
                for (let i of result) {
                    this.modulePermissionService
                        .Delete(i.ID)
                        .subscribe((res) => { });
                }
            });
    }

    public deleteUPI(instanceID: number): void {
        this.userPageInstanceService
            .GetByInstance(instanceID)
            .subscribe((res: UserPageInstance[]) => {
                for (let i of res) {
                    this.userPageInstanceService
                        .Delete(i.ID)
                        .subscribe((res) => { })
                }
            });

    }

    public deleteInstance(instanceID: number): void {
        this.moduleInstanceService
            .GetSingle(instanceID)
            .subscribe((result: ModuleInstance) => {
            });

        this.moduleInstanceService
            .Delete(instanceID)
            .subscribe(() => {
                this.getInstanceItems();
            });
    }

    // 2/2/18: Keep this here to remind you: DON'T do it this way, when you get to it, implement using the pagination/sorting features of mat-table
    public sortInstances(code: string): void {
        let indexList: Array<number> = [];
        let list = this.instances;
        let temp: Array<any> = [];

        switch (code) {
            case ('AZ'):
                this.orderAZ();
                break;
            case ('ZA'):
                break;
            case ('TYPE'):
                break;
            case ('OLD_NEW'):
                break;
            case ('NEW_OLD'):
                break;
            case ('GEOM'):
                break;
            case ('SERVER'):
                break;
            default:
                alert('"' + code + '" is not a valid code.');
                break;
        }
    }

    public orderAZ(): void {
        let indexList: Array<number> = [];
        let list, temp = this.instances;
        for (let i = 0; i < list.length; i++) {
            temp[i] = list[i].name;
        }
    }
}

