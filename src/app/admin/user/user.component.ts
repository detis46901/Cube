
import { Component, Input, OnInit } from '@angular/core';
//import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Http, Headers, Response } from '@angular/http';
import { Api2Service } from '../../api2.service';
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
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PageComponent } from '../page/page.component'
import { PageConfigComponent } from '../page/pageconfig.component'
import { Md5 } from 'ts-md5/dist/md5'
//import { hash } from 'bcrypt'
//import {hash, genSalt} from "bcrypt/bcrypt.js"

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  providers: [Api2Service, RoleService, UserPageService, LayerPermissionService, UserPageLayerService, Configuration, PagePipe, NumFilterPipe]
  //styleUrls: ['./app.component.css', './styles/w3.css'],
})

export class UserComponent implements OnInit{

    private objCode = 1

    closeResult: string;
    public user = new User;
    public newuser = new User;
    public userpage = new UserPage;
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


    constructor(private api2service: Api2Service, private roleservice: RoleService, private modalService: NgbModal, private userpageService: UserPageService, private layerPermissionService: LayerPermissionService, private userPageLayerService: UserPageLayerService) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       this.getUserItems();
       this.getRoleItems();
       this.initNewUser();
       this.getUserPageItems()
       //this.getGroupItems();
       //this.getRoleItems();

       
        
    }

    initNewUser(): void {
        this.newuser.firstName = "";
        this.newuser.lastName = "";
        this.newuser.roleID = null;
        this.newuser.active = true;
        this.newuser.email = "";
        this.newuser.administrator = false;
        this.newuser.password = "";
    }

    public getUserItems(): void {
         this.api2service
            .GetAll()
            .subscribe((data:User[]) => this.users = data,
                error => console.log(error)
                //() => console.log(this.departments[0].department)
                );
    }

    public getRoleItems(): void {
         this.roleservice
            .GetAll()
            .subscribe((data:Role[]) => this.roles = data,
                error => console.log(error),
                //() => console.log(this.roles[0].role)
                );
    }   


    public addUser(newuser) {
        this.newuser = newuser
        

        //var crypt = require('bcrypt');

        //node_modules/hash-and-salt method I think it doesn't work because its taking from NodeJS javascript into typescript
        /*var password = require('password-hash-and-salt')
        console.log(password)
        var salt = 'secret'
        var hashedpw = ""

        //password('Monday01').hash(salt, hash)

        //password('Monday01').hash(function(salt, hash) {
        password('Monday01').hash(salt, function(salt, hash) {
            console.log(hash)
            //if(error)
                //throw new Error('Hash error')
            hashedpw = hash

            password('hack').verifyAgainst(hashedpw, function(error, verified) {
                if(error)
                    throw new Error('Hack error')
                if(!verified) {
                    console.log('hack attempt')
                } else {
                    console.log('The secret is')
                }       
            })
        })
        console.log(hashedpw)

        crypt.genSalt(10, function(err, salt) {
            crypt.hash("hello", salt, function(err, hash) {
                console.log(hash)
            })
        })*/


        console.log(this.newuser.password)
        if (this.newuser.password == "") {
            this.newuser.password = Md5.hashStr('Monday01').toString()
        }

        else {
            this.newuser.password = Md5.hashStr(this.newuser.password).toString()
        }

        console.log(Md5.hashStr(newuser.password)) //works
        
        //this.newuser.password = (Md5.hashStr("Monday01")).toString() //works
        console.log(newuser.password)

        console.log(newuser)

        this.api2service
            .Add(this.newuser)
            .subscribe(result => {
                console.log(result);
                this.getUserItems();
                this.initNewUser();
            })
    }

    public updateUser(user) {
        this.api2service
            .Update(user)
            .subscribe(result => {
                console.log(result);
                this.getUserItems();
            })
    }

    //rename to change password, add a modal that will ask what new password should be
    public resetPassword(userID, password) {
        this.api2service
            .GetSingle(userID)
            .subscribe(result => {
                console.log(result);
                this.user = result;
                this.user.password = "Monday01"
                this.api2service
                    .Update(this.user)
                    .subscribe(result => {
                        this.getUserItems();
                    })

            })
    }

    //Also delete all user_pages(userID) == userID, user_page_layers(userID), layer_permissions(userID)
    public deleteUser(userID) {
        console.log(userID)
        this.api2service
            .Delete(userID)
            .subscribe(result => {
                console.log(result);
                this.getUserItems();
            })
    }

 private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

    public openPages(userID, firstName, lastName) {
    const modalRef = this.modalService.open(PageComponent)
       modalRef.componentInstance.userID = userID;
       modalRef.componentInstance.firstName = firstName;
       modalRef.componentInstance.lastName = lastName;
       modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.getUserPageItems();
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.getUserPageItems();
    });;
    console.log("openpermission from layernew")
    }

    public getUserPageItems(): void {
         this.userpageService
            .GetAll()
            .subscribe((data:UserPage[]) => this.userpages = data,
                error => console.log(error),
                () => console.log('User Page Items Loaded')
                );
    }

    public openPageConfig(pageID, userID) {
        console.log("userID = " + userID)
    const modalRef = this.modalService.open(PageConfigComponent)
       modalRef.componentInstance.pageID = pageID;
       modalRef.componentInstance.userID = userID,
       modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      this.getUserPageItems();
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.getUserPageItems();
    });;
    console.log("openpermission from layernew")
    }
}