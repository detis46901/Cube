import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';

var isOpen: boolean;
var geoData: Array<string>;
var markerData: string;

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

    public setMarkerData(data: string) {
        markerData = data;
        console.log(data)
    }

    public getOpen(): boolean {
        //console.log(this.isOpen)
        return isOpen;
    }

    public getGeoData(): Array<string> { //= (): Observable<>
        console.log(geoData)
        return geoData;
    }

    public getMarkerData(): string {
        return markerData;
    }
}   