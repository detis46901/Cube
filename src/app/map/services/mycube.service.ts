import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import { SQLService } from '../../../_services/sql.service'
import { MyCubeField, MyCubeConfig, MyCubeComment } from '../../../_models/layer.model'
import { interaction } from "openlayers";


//need to get wmsSubject to wmsService, but for some reason, it doesn't work over there.

@Injectable()

export class MyCubeService extends SQLService {
    private WMSSubject = new Subject<any>();
    private mycubesubject = new Subject<MyCubeField[]>();
    private mycubeconfig = new Subject<MyCubeConfig>();
    private mycubecomment = new Subject<MyCubeComment[]>();
    private cubeData: MyCubeField[]
    private tempCubeData: MyCubeField[]


    sendWMS(message: string) {
        this.WMSSubject.next(message);
    }

    clearWMS() {
        this.WMSSubject.next();
    }

    getWMS(): Observable<any> {
        return this.WMSSubject.asObservable();
    }

    public parseAndSendWMS(WMS: string): void {
        WMS = WMS.split("<body>")[1];
        WMS = WMS.split("</body>")[0];
        if (WMS.length < 10) {
            this.clearWMS();
        }
        else {
            this.sendWMS(WMS); //This allows the service to render the actual HTML unsanitized
        }
    }

    //This needs a lot of work.  This should create an array of arrays for all of the features in the layer.
    prebuildMyCube(layer) {
        this.GetSchema(layer.layer.ID)
            .subscribe((data) => {
                this.cubeData = data
                this.cubeData[0].type = "id"
                this.cubeData[1].type = "geom"
            })
    }

    public getAndSendMyCubeData (table: number, feature: ol.Feature):Promise<any> {
        this.getMyCubeDataFromFeature(feature)
        let promise = new Promise(resolve => {
            let id = feature.getId()
        this.GetSchema(table)
            .subscribe((data: MyCubeField[]) => {
                this.cubeData = data
                this.cubeData[0].value = id
                this.cubeData[0].type = "id"
                this.cubeData[1].type = "geom"
                this.getsingle(table, id).then(() => {resolve(this.cubeData)})

            })
          });
          return promise
    }

    getsingle(table, id):Promise<any> {
        let promise = new Promise(resolve => {
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
                resolve()
            })
        })
        return promise
    }

    loadComments(table, id): any {
        console.log('loading comments')
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
        return mycubeconfig
    }

    public getMyCubeConfig(): Observable<MyCubeConfig> {
        return this.mycubeconfig.asObservable();
    }


}   