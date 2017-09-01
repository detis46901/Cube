import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
    selector: 'changepassword',
    templateUrl: './changepassword.component.html',
    styleUrls: ['./changepassword.component.scss']
})
export class ChangePasswordComponent implements OnInit {
    @Input() userID;

    constructor(private dialog: MdDialog) { }

    ngOnInit() {
    }

}
