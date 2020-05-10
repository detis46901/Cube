import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'confirm-delete',
    templateUrl: './confirmdelete.component.html',
    styleUrls: ['./confirmdelete.component.scss']
})

//Confirms delete selection, is called by any component that has a delete request from the user, and verifies choice.
export class ConfirmDeleteComponent implements OnInit {
    @Input() objCode: number;
    @Input() objID: number;
    @Input() objName: string;

    public objectType: string;
    public dependentWarning: boolean = false;

    constructor() {}

    ngOnInit() {
        this.assignType();
    }

    public assignType(): void {
        switch (this.objCode) {
            case 1:
                this.objectType = "User";
                break;
            case 2:
                this.objectType = "Layer";
                break;
            case 3:
                this.objectType = "Group";
                this.dependentWarning = true;
                break;
            case 6:
                this.objectType = "Server";
                this.dependentWarning = true;
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
