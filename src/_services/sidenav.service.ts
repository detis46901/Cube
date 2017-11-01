import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';

//Must be declared here in order to mitigate a bug where toggling sidenav via view dropdown doesn't work unless clicked twice.
let isOpen: boolean = true;
let geoData: Array<string>;
let markerData: string;


@Injectable()
export class SidenavService {
   private subject = new Subject<any>();
   private mycubesubject = new Subject<any>();

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

    sendMessage(message: string){
        console.log("Arrived at sendMessage")
        console.log(message)
        this.subject.next({ text: message});
    }

    clearMessage() {
        this.subject.next();
    }

    getMessage(): Observable<any>{
        return this.subject.asObservable();
    }

    sendMyCubeData(message: JSON){
        console.log("Arrived at sendMyCubeData")
        console.log(message)
        this.mycubesubject.next({ text: message});
    }

    clearMyCubeData() {
        this.mycubesubject.next();
    }

    getMyCubeData(): Observable<any>{
        return this.mycubesubject.asObservable();
    }

}   