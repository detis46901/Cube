import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';

//Must be declared here in order to mitigate a bug where toggling sidenav via view dropdown doesn't work unless clicked twice.
let isOpen: boolean = true;
let geoData: Array<string>;
let markerData: string;


@Injectable()
export class SidenavService {
    private bottomText = new Subject<string>();
    public bottomText$ = this.bottomText.asObservable();

    public toggleHidden(): void {
        isOpen = !isOpen;
    }

    public setGeoData(data: Array<string>): void {
        geoData = data;
    }

    public setMarkerData(data: string): void {
        markerData = data;
    }

    public getHidden(): boolean {
        return isOpen;
    }

    public getGeoData(): Array<string> {
        return geoData;
    }

    public getMarkerData(): string {
        return markerData;
    }
}   