import { Component, OnInit, Input} from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Api2Service } from '../../api2.service';
import { User } from '../../../_models/user-model';
import { Configuration } from '../../../_api/api.constants';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'confirmdelete',
  templateUrl: './confirmdelete.component.html',
  styleUrls: ['./confirmdelete.component.css']
})
export class ConfirmdeleteComponent implements OnInit {

	@Input() objectCode = 0;
	@Input() objectID = 0;

	public closeResult: any
	public token: string;
	public userID: number;
	public delete = false;

	constructor(private modalService: NgbModal, public activeModal: NgbActiveModal) { 
		var currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.token = currentUser && currentUser.token;
		this.userID = currentUser && currentUser.userid;
	}

	ngOnInit() {
	}

	open(content) {
    this.modalService.open(content, {size:'lg'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

	public deleteObject(objCode, objID) {
		var willDelete
	//currently the object codes will align as follows: Users-1, Layers-2, Organization-3
		switch(objCode) {
			case 0:
			//throw error for no identified object
				break
			case 1:
				willDelete = this.confirmUser(objID)
				break
			case 2:
				this.confirmLayer(objID) //passes true up the tree until it can be used to actually delete on the individual component's method
				break
			case 3:
				willDelete = this.confirmOrg(objID)
				break
		}
		this.delete = willDelete
	}

	private confirmUser(obj_ID) {

	}

	private confirmLayer(obj_ID) {
		console.log("confirmLayer")
	}

	private confirmOrg(obj_ID) {

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
}
