import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/_user.service';
import { User } from '../../../_models/user.model';
import { DepartmentService } from '../../../_services/_department.service';
import { GroupService } from '../../../_services/_group.service';
import { RoleService } from '../../../_services/_role.service';
import { Department, Group, Role } from '../../../_models/organization.model';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { MatDialog, MatDialogRef } from '@angular/material';

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

    constructor(private departmentService: DepartmentService, private userService: UserService, private groupService: GroupService, private roleService: RoleService, private dialog: MatDialog) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
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
                console.log(org.group)
                break;
            }

            //role
            case 5: {
                dialogRef.componentInstance.objName = org.role;
                console.log(org.role)
                break;
            }

            default: {
                alert('Object Type code invalid.');
                break;
            }
        }

        dialogRef.afterClosed().subscribe(result => {
            if (result == type) {
                switch (result) {
                    case 3: {
                        this.deleteDepartment(org.ID);
                        break;
                    }
                    case 4: {
                        this.deleteGroup(org.ID);
                        break;
                    }
                    case 5: {
                        this.deleteRole(org.ID);
                        break;
                    }
                    default: {
                        alert("Incorrect code.");
                    }
                }
            }
            this.getDepartmentItems();
        });
    }

    //See "private deleteGroup(groupID: number): void" comments for more information on what is happening here. They use the same logic.
    //deleteDepartment() simply goes one step further than deleteGroup().
    //
    //Operations occur in this order (see "remove____();"): [Nullify user.roleIDs => delete roles => delete groups => delete department]
    //Considerations: millisecond value in setInterval may cause performance issues at a certain point, will have to see.
    private deleteDepartment(departmentID: number): void {
        let count=0;

        var that = this;
        let _userService = that.userService;
        let _roleService = that.roleService;
        let _groupService = that.groupService;
        let _departmentService = that.departmentService;

        let roleList = Array<Role>();
        let userList = Array<User>();
        let groupList = Array<Group>();
        let roleListLength;
        let userListLength;
        let groupListLength;

        function removeUserRoles() {
            for (let user of userList) {
                user.roleID = null;
                _userService
                .Update(user)
                .subscribe((result) => {
                    console.log(result)
                })
            }
        }
        function removeGroupRoles() {
            for (let role of roleList) {
                _roleService
                .Delete(role.ID)
                .subscribe(() => {
                    if(roleList.indexOf(role) == roleList.length-1) {
                        _roleService
                        .GetAll()
                        .subscribe((data:Role[]) => {
                            that.roles = data;
                        })
                    }
                })
            }
        }
        function removeGroups() {
            for (let group of groupList) {
                _groupService
                .Delete(group.ID)
                .subscribe(() => {
                    if(groupList.indexOf(group) == groupList.length-1)
                        _groupService
                        .GetAll()
                        .subscribe((data:Group[]) => {
                            that.groups = data;
                        })
                });
            }
        }
        function removeDepartment() {
            _departmentService
            .Delete(departmentID)
            .subscribe(() => {
                _departmentService
                .GetAll()
                .subscribe((data:Department[]) => {
                    that.departments = data;
                })
            });
        }

        _groupService
        .GetByDept(departmentID)
        .subscribe(result => {
            console.log(result)
            groupListLength = result.length;
            for (let group of result) {
                groupList.push(group);
                _roleService
                .GetByGroup(group.ID)
                .subscribe(result => {
                    roleListLength = result.length;
                    for (let role of result) {
                        roleList.push(role);
                        _userService
                        .GetByRole(role.ID)
                        .subscribe((result) => {
                            userListLength = result.length;
                            for(let user of result) {
                                userList.push(user);
                            }
                        })
                    }
                });
            }
        });
            

        var interval = setInterval(function() {
            //*Debugging tool*
            /*console.log("second " + count + ":\r\nRole_actual-" + roleList.length + " | Role_wanted-" + roleListLength +
            "\r\nUser_actual-" + userList.length + " | User_wanted-" + userListLength +
            "\r\nGroup_actual-" + groupList.length + " | Group_wanted-" + groupListLength + "\n")*/
            if(roleList.length == roleListLength && userList.length == userListLength && groupList.length == groupListLength) {
                removeUserRoles();
                removeGroupRoles();
                removeGroups();
                removeDepartment();

                clearInterval(interval);
            }
        }, 1)
    }

    //This method seems like it exhibits low cohesion, but due to the setInterval workaround being in place, it is hard to make it more concise.
    //Can this logic actually be defined somewhere else, or is the scope issue preventing that? (find: "//Too good to be true")
    //
    //Operations occur in this order: [Nullify user.roleIDs => delete roles => delete group]
    private deleteGroup(groupID: number): void {
        //Scaling scope to allow function execution within setInterval()
        var that = this;
        let _userService = that.userService;
        let _roleService = that.roleService;
        let _groupService = that.groupService;

        //roleList stores roles having a groupID that matches this function's groupID argument. roleListLength is defined at run-time below.
        //Likewise, userList stores users having a roleID that matches any of the "to-be-deleted" roles.
        let roleList = Array<Role>();
        let userList = Array<User>();
        let roleListLength;
        let userListLength;
    
        //Nullify "roleID" column for each row in "users" table that contains a roleID that is to be deleted.
        function removeUserRoles() {
            for (let user of userList) {
                user.roleID = null;
                _userService
                .Update(user)
                .subscribe((result) => {
                    console.log(result)
                })
            }
        }
        //Delete all rows in "roles" table that have a matching groupID of the group being deleted.
        function removeGroupRoles() {
            for (let role of roleList) {
                _roleService
                .Delete(role.ID)
                .subscribe(() => {
                    if(roleList.indexOf(role) == roleList.length-1) {
                        _roleService
                        .GetAll()
                        .subscribe((data:Role[]) => {
                            that.roles = data;
                        })
                    }
                })
            }
        }
        //After dependent objects are removed accordingly, finally delete row in "groups" table where groupID == groupID.
        function removeGroup() {
            _groupService
            .Delete(groupID)
            .subscribe(() => {
                _groupService
                .GetAll()
                .subscribe((data:Group[]) => {
                    that.groups = data;
                })
            });
        }

        //BEGIN FUNCTION PROCESSING
        _roleService
        .GetByGroup(groupID)
        .subscribe(result => {
            roleListLength = result.length;

            //Push each role from returned list into locally scoped "roleList", and check which users have that role to push them into "userList"
            for (let role of result) {
                roleList.push(role);
                _userService
                .GetByRole(role.ID)
                .subscribe((result) => {
                    userListLength = result.length;
                    for(let user of result) {
                        userList.push(user);
                    }
                })
            }
        });

        var interval = setInterval(function() {
            //This executes the if block once the locally scoped "roleList" and "userList" are filled correctly.
            if(roleList.length == roleListLength && userList.length == userListLength) {
                //These functions MUST be defined within deleteGroup(), or else "this" gets lost.
                removeUserRoles();
                removeGroupRoles();
                removeGroup();

                clearInterval(interval);
            }
        }, 1) //Interval is 1 millisecond. Therefore, conditional above is tested once per millisecond.
    }
    
    private deleteRole(roleID: number): void {
        this.userService
        .GetByRole(roleID)
        .subscribe((result) => {
            for(let user of result) {
                user.roleID = null;

                this.userService
                .Update(user)
                .subscribe();
            }
        })

        this.roleService
        .Delete(roleID)
        .subscribe((res) => {
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

    //Too good to be true
    //
    // private removeGroupRoles(scope: any, roleList: Role[]) {
    //     for (let i=0; i<roleList.length; i++) {
    //         scope._roleService
    //         .Delete(roleList[i].ID)
    //         .subscribe(() => {
    //             if(i == roleList.length-1) {
    //                 scope._roleService
    //                 .GetAll()
    //                 .subscribe((data:Role[]) => {
    //                     scope.roles = data;
    //                 })
    //             }
    //         })
    //     }
    // }
}