import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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

	@Input() objCode;
	@Input() objID;
	@Input() objName;
	objectType: string;

	closeResult: string;
	public token: string;
	public userID: number;

	constructor(private modalService: NgbModal, public activeModal: NgbActiveModal, private confDelService: ConfirmdeleteService) {
		var currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.token = currentUser && currentUser.token;
		this.userID = currentUser && currentUser.userid;
	}

	ngOnInit() {
		//currently the object codes will align as follows: Users-1, Layers-2, Organization-3
		switch(this.objCode) {
			case 0:
				//throw error for no identified object
				break
			case 1:
				this.objectType = "User"
				break
			case 2:
				this.objectType = "Layer"
				break
			case 3:
				this.objectType = "Department"
				break
			case 4:
				this.objectType = "Group"
				break
			case 5:
				this.objectType = "Role"
				break
		}
	}

	onClick() {
		this.activeModal.close()
	}

	onClose() {
		this.activeModal.dismiss()
	}

	open(content) {
    this.modalService.open(content, {size:'sm'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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
