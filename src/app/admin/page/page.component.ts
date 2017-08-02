
import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { UserService } from '../../../_services/user.service';
import { User } from '../../../_models/user-model'
import { Configuration } from '../../../_api/api.constants'
import { UserPageService } from '../../../_services/user-page.service'
import { UserPage } from '../../../_models/user-model'
import { FilterPipe } from '../../../_pipes/rowfilter.pipe'
import { NumFilterPipe } from '../../../_pipes/numfilter.pipe'
import {NgbModal, ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'page',
  templateUrl: './page.component.html',
  providers: [UserService, Configuration, FilterPipe, NumFilterPipe],
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit{
@Input () userID;
@Input () firstName;
@Input () lastName;

public user = new User;
public userpage = new UserPage;
public userpages: any;
public token: string;
public selecteduserpage: UserPage;
public newuserpage: string;


    constructor(private userpageService: UserPageService, public activeModal: NgbActiveModal) {
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        //this.userID = currentUser && currentUser.userid; 
    }

    ngOnInit() {
       this.getUserPageItems();
       //this.getGroupItems();
       //this.getRoleItems();
        
    }

    public getUserPageItems(): void {
        this.userpageService
        .GetSome(this.userID)
        .subscribe((data:UserPage[]) => this.userpages = data,
            error => console.log(error)
            );
        console.log(this.userpages)
    }

   public addUserPage(newuserpage) {
        this.userpage.page = newuserpage;
        this.userpage.userID = this.userID
        this.userpage.active = true;
        console.log(this.userpage.page, this.userpage.active);
        this.userpageService
            .Add(this.userpage)
            .subscribe(result => {
                console.log(result);
                this.getUserPageItems();
            })      
    }

    public updateUserPage(userpage) {
        console.log(userpage)
        this.userpageService
            .Update(userpage)
            .subscribe(result => {
                console.log(result);
                this.getUserPageItems();
            })
    }

    public deleteUserPage(userpageID) {
        this.userpageService
            .Delete(userpageID)
            .subscribe(result => {
                console.log(result);
                this.getUserPageItems();
            })
    }

}