/// <reference path="../../../../node_modules/@types/node/index.d.ts" />
/// <reference types="node" />
/// <reference types="jsonwebtoken" />
/// <reference types="password-hash-and-salt" />

import { Component, Input, OnInit } from '@angular/core';
//import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Http, Headers, Response } from '@angular/http';
import { UserService } from '../../../_services/user.service';
import { User } from '../../../_models/user-model'
import { Configuration } from '../../../_api/api.constants'
import { DepartmentService } from '../../../_services/department.service'
import { GroupService } from '../../../_services/group.service'
import { RoleService } from '../../../_services/role.service'
import { UserPageService } from '../../../_services/user-page.service'
import { LayerPermissionService } from '../../../_services/layerpermission.service';
import { UserPageLayerService } from '../../../_services/user-page-layer.service';
import { UserPage } from '../../../_models/user-model';
import { Department, Group, Role } from '../../../_models/organization.model'
import { PagePipe } from '../../../_pipes/rowfilter2.pipe'
import { NumFilterPipe } from '../../../_pipes/numfilter.pipe'
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmdeleteComponent } from '../confirmdelete/confirmdelete.component'
import { PageComponent } from './page/page.component'
import { PageConfigComponent } from './pageconfig/pageconfig.component'
import { ChangePasswordComponent } from './changepassword/changepassword.component'
import { Md5 } from 'ts-md5/dist/md5'
import pHash = require('password-hash-and-salt')
import * as jwt from 'jsonwebtoken'
import {MdDialog, MdDialogRef} from '@angular/material';

/*import { hash } from 'bcrypt'
import {hash, genSalt} from "bcrypt/bcrypt.js"*/

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  providers: [UserService, RoleService, UserPageService, LayerPermissionService, UserPageLayerService, Configuration, PagePipe, NumFilterPipe, NgbModal],
  styleUrls: ['./user.component.scss'],
})

export class UserComponent implements OnInit{

    //Confirm Delete Modal
    private objCode = 1

    closeResult: string;
    public user = new User;
    public newuser = new User;
    public userpage: any;
    public userpages: any;
    public department = new Department;
    public users: any;
    public group = new Group;
    public groups: Array<any>;
    public role = new Role;
    public newrole = new Role;
    public roles: any;
    public token: string;
    public userID: number;
    public selecteddepartment: Department;
    public selectedgroup: Group;
    public showgroup: boolean;
    public showrole: boolean;
    public newdepartment: string;
    public uList = [];


    constructor(private userService: UserService, private roleservice: RoleService, private modalService: NgbModal, private userpageService: UserPageService, private layerPermissionService: LayerPermissionService, private userPageLayerService: UserPageLayerService, public dialog: MdDialog) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      console.log(currentUser)
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       this.getUserItems();
       this.getRoleItems();
       this.initNewUser();
       this.getUserPageItems();
    }

    initNewUser(): void {
        this.newuser.firstName = "";
        this.newuser.lastName = "";
        this.newuser.roleID = null;
        this.newuser.active = true;
        this.newuser.email = ' ';
        this.newuser.administrator = false;
        this.newuser.password = "";
    }

    clearInputs(): void {
        this.newuser.email = ""
        this.newuser.password = ""
    }

    getUserItems(): void {
         this.userService
            .GetAll()
            .subscribe((data:User[]) => this.users = data,
                error => console.log(error),
                () => console.log()
                //() => console.log(this.departments[0].department)
                );
        console.log(this.users) //this returns nothing
    }

    getRoleItems(): void {
         this.roleservice
            .GetAll()
            .subscribe((data:Role[]) => this.roles = data,
                error => console.log(error),
                //() => console.log(this.roles[0].role)
                );
    }   


    addUser(newuser) {
        this.newuser = newuser
        let errorFlag = false;

        for(let x of this.users) {
            if (this.newuser.email === x.email) {
                errorFlag = true;
                this.clearInputs();
                alert(x.email + " is already taken.")
            }
        }

        if (errorFlag == false) {
            if (this.newuser.password == "") {
                this.newuser.password = Md5.hashStr('Monday01').toString()
            }

            else {
                this.newuser.password = Md5.hashStr(this.newuser.password).toString()
            }

            this.userService
                .Add(this.newuser)
                .subscribe(result => {
                    console.log(result);
                    this.getUserItems();
                    this.initNewUser();
                })
        }
    }

    updateUser(user) {
        let errorFlag = false;
        console.log (this.users)
        for(let x of this.users) {
            if (user.email === x.email) {
                console.log("user.email = " + user.email)
                console.log("x.email = " + x.email)
                //This needs to be fixed so you can't create multiple users with the same email address.
                //errorFlag = true;
                //this.clearInputs();
                //alert(x.email + " is already taken.")
            }
        }

        if (errorFlag == false) {
            this.userService
                .Update(user)
                .subscribe(result => { //result is empty, layeradmins isn't
                    console.log(result); //This gets an empty object
                    this.getUserItems();
                })
        }
    }

    //rename to change password, add a modal that will ask what new password should be
    resetPassword(userID, password) {
        this.userService
            .GetSingle(userID)
            .subscribe(result => {
                console.log(result);
                this.user = result;
                this.user.password = "Monday01"
                this.userService
                    .Update(this.user)
                    .subscribe(result => {
                        this.getUserItems();
                    })

            })
    }

    changePassword() {
        // const modalRef = this.modalService.open(ChangePasswordComponent)
        // modalRef.componentInstance.userID = this.userID;
        // modalRef.result.then((result) => {
        //     this.closeResult = `Closed with: ${result}`;
        //     this.getUserPageItems();
        // }, (reason) => {
        //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        //     this.getUserPageItems();
        // });
        let dialogRef = this.dialog.open(ChangePasswordComponent);
        dialogRef.afterClosed().subscribe(result => {
        this.getDismissReason = result;
        });
    }

    //Also delete all user_pages(userID) == userID, user_page_layers(userID), layer_permissions(userID)
    deleteUser(userID) {
        console.log(userID)
        this.userService
            .Delete(userID)
            .subscribe(result => {
                console.log(result);
                this.getUserItems();
            })
    }

    openPages(userID, firstName, lastName) {
        // const modalRef = this.modalService.open(PageComponent)
        // modalRef.componentInstance.userID = userID;
        // modalRef.componentInstance.firstName = firstName;
        // modalRef.componentInstance.lastName = lastName;
        // modalRef.result.then((result) => {
        //     this.closeResult = `Closed with: ${result}`;
        //     this.getUserPageItems();
        // }, (reason) => {
        //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        //     this.getUserPageItems();
        // });
        // console.log("openpermission from layernew")

        let dialogRef = this.dialog.open(PageComponent);
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.firstName = firstName;
        dialogRef.componentInstance.lastName = lastName;
        dialogRef.afterClosed().subscribe(result => {
        this.getDismissReason = result;
        console.log(this.getDismissReason)
        this.getUserPageItems();
        });
    }

    openConfDel(user) {
        const modalRef = this.modalService.open(ConfirmdeleteComponent)
        modalRef.componentInstance.objCode = this.objCode
        modalRef.componentInstance.objID = user.ID
        modalRef.componentInstance.objName = user.firstName + " " + user.lastName

        modalRef.result.then((result) => {
            this.deleteUser(user.ID)
            this.getUserPageItems();
        }, (reason) => {
            this.getUserPageItems();
        });
    }

    getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
        } else {
        return  `with: ${reason}`;
        }
    }

    getUserPageItems(): void {
         this.userpageService
            .GetAll()
            .subscribe((data:UserPage[]) => this.userpages = data,
                error => console.log(error),
                () => console.log('User Page Items Loaded')
            );
        console.log(this.userpages)
    }

    getUserPageItem(pageID, userID) {
        let pName;
        this.userpageService
            .GetSingle(pageID)
            .subscribe((data:UserPage) => pName = data.page,
                error => console.log(error),
                () =>  this.openPageConfig(pageID, userID, pName)
            );
        console.log(this.userpage)
    }

    openPageConfig(pageID, userID, name) {
        // console.log("userID = " + userID)
        // console.log("pageID = " + pageID)

        // const modalRef = this.modalService.open(PageConfigComponent)
        // modalRef.componentInstance.pageID = pageID;
        // modalRef.componentInstance.userID = userID;
        // modalRef.componentInstance.pageName = name;
        // modalRef.result.then((result) => {
        //     this.closeResult = `Closed with: ${result}`;
        //     this.getUserPageItems();
        // }, (reason) => {
        //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        //     this.getUserPageItems();
        // });;
        // console.log("openpermission from layernew")
        let dialogRef = this.dialog.open(PageConfigComponent);
        dialogRef.componentInstance.pageID = pageID;
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.pageName = name;
        dialogRef.afterClosed().subscribe(result => {
        this.getDismissReason = result;
        console.log(this.getDismissReason)
        this.getUserPageItems(); });
    }
}