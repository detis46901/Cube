import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';
import { DepartmentService } from '../../../_services/_department.service';
import { GroupService } from '../../../_services/_group.service';
import { RoleService } from '../../../_services/_role.service';
import { Department, Group, Role } from '../../../_models/organization.model';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
    selector: 'organization',
    templateUrl: './organization.component.html',
    styleUrls: ['./organization.component.scss'],
    providers: [UserService] //removed Configuration, FilterPipe, NumFilterPipe
})

export class OrganizationComponent implements OnInit {
    private token: string;
    private userID: number;

    private department = new Department;
    private departments: any;
    private group = new Group;
    private groups: Array<any>;
    private role = new Role;
    private roles: any;

    private newRole = new Role;
    private selectedDepartment: Department;
    private selectedGroup: Group;
    private showGroup: boolean;
    private showRole: boolean;
    private newDepartment: string;

    constructor(private departmentService: DepartmentService, private groupService: GroupService, private roleService: RoleService, private dialog: MdDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
    }

    ngOnInit() {
        this.getDepartmentItems();
    }

    private getDepartmentItems(): void {
        this.departmentService
            .GetAll()
            .subscribe((data:Department[]) => {
                this.departments = data;
            },
            error => {
                console.error(error);
            });
    }

    private getGroupItems(): void {
        this.groupService
            .GetAll()
            .subscribe((data:Group[]) => {
                this.groups = data;
            },
            error => {
                console.error(error);
            });
    }
     
    private getRoleItems(): void {
        this.roleService
            .GetAll()
            .subscribe((data:Role[]) => {
                this.roles = data;
            },
            error => {
                console.error(error);
            });
    }

    private departmentClick(dept: Department): void {
        this.getGroupItems();
        this.showRole = false;
        this.showGroup = true;
        this.selectedDepartment = dept;
    }

    private groupClick(group: Group): void {
        this.getRoleItems();
        this.showRole = true;
        this.selectedGroup = group;
    }

    private addDepartment(newDepartment: string): void {
        this.department.department = newDepartment;
        this.department.active = true;
        this.departmentService
            .Add(this.department)
            .subscribe(() => {
                this.getDepartmentItems();
            });
    }

    private addGroup(newGroup: string): void {
        this.group.departmentID = this.selectedDepartment.ID;
        this.group.group = newGroup;
        this.group.active = true;
        this.groupService
            .Add(this.group)
            .subscribe(() => {
                this.getGroupItems();
            });
    }

    //10/6/17 Why does this need a passed object instead of string like ones above?
    private addRole(newRole: Role): void {
        this.role.groupID = this.selectedGroup.ID;
        this.role.role = newRole.role;
        this.role.active = true;
        this.roleService
            .Add(this.role)
            .subscribe(() => {
                this.getRoleItems();
            });
    }

    private updateDepartment(department: Department): void {
        this.departmentService
            .Update(department)
            .subscribe(() => {
                this.getDepartmentItems();
            });
    }

    private updateGroup(group: Group): void {
        this.groupService
            .Update(group)
            .subscribe(() => {
                this.getGroupItems();
            });
    }

    private updateRole(role: Role): void {
        this.roleService
            .Update(role)
            .subscribe(() => {
                this.getRoleItems();
            });
    }

    private openConfDel(org: any, type: number): void {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = type;
        dialogRef.componentInstance.objID = org.ID;
        
        switch (type) {
            
            //department
            case 3: {
                dialogRef.componentInstance.objName = org.department;
                console.log(org.department);
                break;
            }

            //group
            case 4: {
                dialogRef.componentInstance.objName = org.group;
                break;
            }

            //role
            case 5: {
                dialogRef.componentInstance.objName = org.role;
                break;
            }

            default: {
                alert('Object Type code invalid.');
                break;
            }
        }

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                //delete the correct items.
            }
            this.getDepartmentItems();
        });
    }

    /*This should also delete all rows for which: group(departmentID) == departmentID, but before deletion of those groups, 
    logging the IDs from those groups into an array and also deleting for which roles(groupID) == groupIDs to be deleted. 
    This must be done in a cascade fashion.*/
    private deleteDepartment(departmentID: number): void {
        this.groupService
            .GetSome(departmentID)
            .subscribe(result => {
                for (let i of result) {
                }
            });

        this.departmentService
            .Delete(departmentID)
            .subscribe(() => {
                this.getDepartmentItems();
            });
    }

    //As above, so below
    //Delete any row for which role(groupID) == groupID
    private deleteGroup(groupID: number): void {
        this.groupService
            .Delete(groupID)
            .subscribe(() => {
                this.getGroupItems();
            });
    }
    
    //Delete all rows where any is true: Role.GroupID == GroupID where Group.DeptID == DepartmentID to delete
    //Or where Role.GroupID == GroupID to delete
    private deleteRole(roleID: number): void {
        this.roleService
            .Delete(roleID)
            .subscribe(() => {
                this.getRoleItems();
            });
    }

    private filterGroup(departmentID: number): boolean {
        if (departmentID == this.selectedDepartment.ID) {
            return true;
        } else {
            return false;
        }
    }

    private filterRole(groupID: number): boolean {
        if (groupID == this.selectedGroup.ID) {
            return true;
        } else {
            return false;
        }
    }
}