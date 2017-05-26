import { Component, OnInit, Input} from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Api2Service } from '../../api2.service';
import { User } from '../../../_models/user-model';
import { Configuration } from '../../../_api/api.constants';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmdeleteService } from '../../../_services/confirmdelete.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'confirmdelete',
  templateUrl: './confirmdelete.component.html',
  styleUrls: ['./confirmdelete.component.css'],
})
export class ConfirmdeleteComponent implements OnInit {

	//@Input() objectID = 0;

	closeResult: string;
	public token: string;
	public userID: number;
	objectCode: number;
	objectID: number;
	objType: string;
	source: Observable<boolean>

	constructor(private modalService: NgbModal, public activeModal: NgbActiveModal, private confDelService: ConfirmdeleteService) {
		this.objectCode = this.confDelService.getVars()[0]
		this.objectID = this.confDelService.getVars()[1]
		
		//currently the object codes will align as follows: Users-1, Layers-2, Organization-3
		switch(this.objectCode) {
			case 0:
				//throw error for no identified object
				break
			case 1:
				this.objType = "User"
				break
			case 2:
				this.objType = "Layer"
				break
			case 3:
				this.objType = "Organization"
				break
		}

		console.log("confirmDelete object code: " + this.objectCode)
		var currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.token = currentUser && currentUser.token;
		this.userID = currentUser && currentUser.userid;
	}

	ngOnInit() {
	}

	open(content) {
		console.log("confirmdelete open(content)")
    this.modalService.open(content, {size:'sm'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

	public deleteObject() {
		this.confDelService.delete()
		this.source = Observable.create(observer => {
        observer.next(this.confDelService.delete_obj)
        })
	}

	private confirmUser(obj_ID) {

	}

	private confirmLayer(obj_ID) {
		console.log("confirmLayer")
		console.log(this.objectCode)
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
