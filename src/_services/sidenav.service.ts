import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import { SQLService } from './sql.service'
import { MyCubeField, MyCubeConfig } from '../_models/layer.model'

//Must be declared here in order to mitigate a bug where toggling sidenav via view dropdown doesn't work unless clicked twice.
let isOpen: boolean = true;
let geoData: Array<string>;
let markerData: string;


@Injectable()

export class SideNavService extends SQLService {
    private subject = new Subject<any>();
    private mycubesubject = new Subject<MyCubeField[]>();
    private mycubeconfig = new Subject<MyCubeConfig>();
    private cubeData: MyCubeField[]


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
        this.subject.next({ text: message });
    }

    clearMessage() {
        this.subject.next();
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    sendMyCubeData(table: number, id: string, message: JSON) {
        let propList = new Array<string>()
        let properties = JSON.stringify(message).split(",");
        //properties.shift();
        this.GetSchema(table)
            .subscribe((data: MyCubeField[]) => {
                this.cubeData = data
                this.cubeData[0].value = message["id"]
                this.cubeData[0].type = "id"
                this.cubeData[1].type = "geom"
                this.getsingle(table, message["id"])
                //the value of the geometry field will be undefined because it isn't sent in the geoJSON.
                for (let i = 0; i < properties.length; i++) {
                    propList.push(properties[i].substring(1, properties[i].indexOf(":") - 1));
                    this.cubeData[i + 1].value = message[propList[i]]
                }
            })
    }

    getsingle(table, id) {
        this.GetSingle(table, id)
            .subscribe((sdata: JSON) => {
                // for(let i=0; i<properties.length; i++) {
                //     console.log(JSON.stringify(sdata))
                //     propList.push(properties[i].substring(1, properties[i].indexOf(":")-1));

                //     this.cubeData[i+1].value = data[0][0][propList[i]]
                //     console.log(data[propList[i]])
                //}
                // for (let z = 2; z==sdata[0][0].length; z++) {

                // }
                this.mycubesubject.next(this.cubeData);
            })

    }

    clearMyCubeData() {
        this.mycubesubject.next();
    }

    getMyCubeData(): Observable<any> {
        return this.mycubesubject.asObservable();
    }

    public setMyCubeConfig(table: number, edit: boolean) {
        let mycubeconfig = new MyCubeConfig
        mycubeconfig.table = table
        mycubeconfig.edit = edit
        this.mycubeconfig.next(mycubeconfig)
    }

    public getMyCubeConfig(): Observable<MyCubeConfig> {
        return this.mycubeconfig.asObservable();
    }
}   