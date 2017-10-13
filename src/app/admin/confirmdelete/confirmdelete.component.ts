import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'confirm-delete',
    templateUrl: './confirmDelete.component.html',
    styleUrls: ['./confirmDelete.component.scss']
})

//Confirms delete selection, is called by any component that has a delete request from the user, and verifies choice.
export class ConfirmDeleteComponent implements OnInit {
	@Input() objCode: number;
	@Input() objID: number;
    @Input() objName: string;
    
	private objectType: string;
	private dependentWarning: boolean = false;
	private token: string;
	private userID: number;

	constructor() {
		let currentUser = JSON.parse(localStorage.getItem('currentUser'));
		this.token = currentUser && currentUser.token;
		this.userID = currentUser && currentUser.userid;
	}

	ngOnInit() {
		this.assignType();
    }
    
    private assignType(): void {
        switch(this.objCode) {
            case 1:
                this.objectType = "User";
                break;
            case 2:
                this.objectType = "Layer";
                break;
            case 3:
                this.objectType = "Department";
                this.dependentWarning = true;
                break;
            case 4:
                this.objectType = "Group";
                this.dependentWarning = true;
                break;
            case 5:
                this.objectType = "Role";
                break;
            case 6:
                this.objectType = "Server";
                break;
            case 7:
                this.objectType = "Page";
                break;
            default: 
                alert("Invalid Object Code: " + this.objCode);
                break;
        }
    }
}
