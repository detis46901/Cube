import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';

var isOpen: boolean;

@Injectable()
export class SidenavService {
    //private isOpen: boolean;

    public setFalse() {
        //console.log(this.isOpen)
        isOpen = false;
    }
    
    public setTrue() {
        //console.log(this.isOpen)
        isOpen = true;
    }

    public getOpen() {
        //console.log(this.isOpen)
        return isOpen;
    }
}