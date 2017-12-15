import { Component, OnInit, Input, Output, EventEmitter, Injectable } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, NgModel } from '@angular/forms';
import { User, UserPage } from '../../../../_models/user.model';
import { UserService } from '../../../../_services/_user.service';
//import { UserDataSource } from './userData';
import { UserValidatorService } from './userValidator.service';
import { TableDataSource, DefaultValidatorService, ValidatorService, TableElement } from 'angular4-material-table';
import { MatDialog, MatInputModule } from '@angular/material';
import { ConfirmDeleteComponent } from '../../confirmDelete/confirmDelete.component';

@Component({
    selector: 'userTable',
    templateUrl: './userTable.component.html',
    styleUrls: ['./userTable.component.scss'],
    providers: [
        {provide: ValidatorService, useClass: UserValidatorService},
        UserService
    ]
})

export class UserTableComponent implements OnInit {
    private objCode = 1
    private userList: User[];

    @Output() userListChange = new EventEmitter<User[]>();

    private userColumns = ['userID', 'firstName', 'lastName', 'role', 'email', 'active', 'administrator', 'actionsColumn']
    private dataSource: TableDataSource<User>;

    constructor(private userValidator: ValidatorService, private userService: UserService, private dialog: MatDialog) { }

    ngOnInit() {
        this.getUsers();
    }

    private getUsers() {
        this.userService.GetAll()
        .subscribe((users: User[]) => {
            this.userList = users
            console.log(users)
            this.dataSource = new TableDataSource<User>(users, User, this.userValidator);
            this.dataSource.datasourceSubject.subscribe(users => this.userListChange.emit(users));
            console.log(this.dataSource.getRow(0))
        }); 
    }

    private confirmDelete(user: User) {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = user.ID;
        dialogRef.componentInstance.objName = user.firstName + ' ' + user.lastName;

        dialogRef.afterClosed()
        .subscribe(result => {
            if (result == this.objCode) {
                this.deleteUser(user.ID);
            }
        });
    }

    private deleteUser(userID: number): void {
        this.userService
            .Delete(userID)
            .subscribe(() => {
                this.getUsers();
            });
    }
}
