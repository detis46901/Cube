import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';

var isOpen: boolean;
var geoData: Array<string>;

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

    public setGeoData(data: Array<string>) {
        geoData = data;
        console.log(data)
    }

    public getOpen() {
        //console.log(this.isOpen)
        return isOpen;
    }

    public getGeoData() { //= (): Observable<>
        console.log(geoData)
        return geoData;
    }
}   