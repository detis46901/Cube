import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import { SQLService } from '../../../_services/sql.service'
import { MyCubeField, MyCubeConfig, MyCubeComment } from '../../../_models/layer.model'
import { interaction } from "openlayers";


//Must be declared here in order to mitigate a bug where toggling sidenav via view dropdown doesn't work unless clicked twice.
let isOpen: boolean = true;
let geoData: Array<string>;
let markerData: string;


@Injectable()

export class MyCubeService extends SQLService {
    private messageSubject = new Subject<any>();
    private mycubesubject = new Subject<MyCubeField[]>();
    private mycubeconfig = new Subject<MyCubeConfig>();
    private mycubecomment = new Subject<MyCubeComment[]>();
    private cubeData: MyCubeField[]
    private tempCubeData: MyCubeField[]


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
        this.messageSubject.next(message);
    }

    clearMessage() {
        this.messageSubject.next();
    }

    getMessage(): Observable<any> {
        return this.messageSubject.asObservable();
    }

    //This needs a lot of work.  This should create an array of arrays for all of the features in the layer.
    prebuildMyCube(layer) {
        this.GetSchema(layer.layer.ID)
            .subscribe((data) => {
                this.cubeData = data
                this.cubeData[0].type = "id"
                this.cubeData[1].type = "geom"
            })
        console.log('Schema Prebuilt')
    }

    sendMyCubeData(table: number, feature: ol.Feature) {
        this.getMyCubeDataFromFeature(feature)
        let id = feature.getId()
        this.GetSchema(table)
            .subscribe((data: MyCubeField[]) => {
                this.cubeData = data
                this.cubeData[0].value = id
                this.cubeData[0].type = "id"
                this.cubeData[1].type = "geom"
                this.getsingle(table, id)
            })
    }

    getsingle(table, id) {
        this.GetSingle(table, id)
            .subscribe((sdata: JSON) => {
                let z = 0
                for (var key in sdata[0][0]) {
                    if (sdata[0][0].hasOwnProperty(key)) {
                        if (z != 0) { this.cubeData[z].value = sdata[0][0][key] }
                        z++
                    }
                }
                this.loadComments(table, id)
            })
    }

    loadComments(table, id) {
        this.getComments(table, id)
                    .subscribe((cdata: any) => {
                        this.mycubesubject.next(this.cubeData);
                        this.mycubecomment.next(cdata[0])
                    })
    }

    getMyCubeDataFromFeature(feature: ol.Feature) {
        this.cubeData.forEach((item) => {
            item.value = feature.get(item.field)
        })
        this.mycubesubject.next(this.cubeData)
    }

    clearMyCubeData() {
        this.mycubesubject.next();
    }

    getMyCubeData(): Observable<any> {
        return this.mycubesubject.asObservable();
    }

    clearMyCubeComments() {
        this.mycubecomment.next();
    }

    getMyCubeComments() {
        return this.mycubecomment.asObservable();
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