
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
import { UserPage } from '../../../_models/user-model';
import { Department, Group, Role } from '../../../_models/organization.model'
import { PagePipe } from '../../../_pipes/rowfilter2.pipe'
import { NumFilterPipe } from '../../../_pipes/numfilter.pipe'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PageComponent } from '../page/page.component'
import { PageConfigComponent } from '../page/pageconfig.component'

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  providers: [Api2Service, RoleService, UserPageService, Configuration, PagePipe, NumFilterPipe]
  //styleUrls: ['./app.component.css', './styles/w3.css'],
})
export class UserComponent implements OnInit{

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


    constructor(private api2service: Api2Service, private roleservice: RoleService, private modalService: NgbModal, private userpageService: UserPageService) {
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
    }

    public getUserItems(): void {
         this.api2service
            .GetAll()
            .subscribe((data:User[]) => this.users = data,
                error => console.log(error),
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
        this.newuser.password = "Monday01"
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

    public resetPassword(userID) {
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