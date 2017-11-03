import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';

//Must be declared here in order to mitigate a bug where toggling sidenav via view dropdown doesn't work unless clicked twice.
let isOpen: boolean = true;
let geoData: Array<string>;
let markerData: string;


@Injectable()
export class SideNavService {
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

    sendMessage(message: string) {
        console.log("Arrived at sendMessage")
        console.log(message)
        this.subject.next({text:message});
    }

    clearMessage() {
        this.subject.next();
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    sendMyCubeData(message: JSON) {
        //console.log("Arrived at sendMyCubeData")
        //console.log(JSON.stringify(message))

        let t = "<h4>Feature Data</h4>";
        let propList = new Array<string>()
        let properties = JSON.stringify(message).split(",");
        properties.shift();
        console.log(properties[0].substring(1, properties[0].indexOf(":")-1))

        for(let i=0; i<properties.length; i++) {
            propList.push(properties[i].substring(1, properties[i].indexOf(":")-1));
            t = t + propList[i] + ": " + message[propList[i]] + "<br>";
        }

        console.log(propList);
        console.log(properties);
        console.log(t);

        this.mycubesubject.next({text: t});
    }

    clearMyCubeData() {
        this.mycubesubject.next();
    }

    getMyCubeData(): Observable<any> {
        return this.mycubesubject.asObservable();
    }

}   