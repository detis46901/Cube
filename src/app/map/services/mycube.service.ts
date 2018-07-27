import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import { SQLService } from '../../../_services/sql.service'
import { MyCubeField, MyCubeConfig, MyCubeComment } from '../../../_models/layer.model'

//Must be declared here in order to mitigate a bug where toggling sidenav via view dropdown doesn't work unless clicked twice.
let isOpen: boolean = true;
let geoData: Array<string>;
let markerData: string;


@Injectable()

export class MyCubeService extends SQLService{
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
    }
    
    sendMyCubeData(table: number, featureid: string | number) {
        let id = featureid
        this.GetSchema(table)
            .subscribe((data: MyCubeField[]) => {
                this.cubeData = data
                this.cubeData[0].value = id
                this.cubeData[0].type = "id"
                this.cubeData[1].type = "geom"
                this.getsingle(table, id)

                //the value of the geometry field will be undefined because it isn't sent in the geoJSON.
                //  for(let i=0; i<this.cubeData.length; i++) {
                //      propList.push(properties[i].substring(1, properties[i].indexOf(":")-1));
                   
                //      this.cubeData[i+1].value = message[propList[i]]
                //      console.log(message[propList[i]])
                //  }
                // console.log(this.cubeData)                  
            })
        //this.subject.next({text:this.cubeData[0].field})    
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

            let z=0
            for (var key in sdata[0][0]) {
                if (sdata[0][0].hasOwnProperty(key)) {
                  //console.log(key + ": " + sdata[0][0][key]);
                  if (z!=0) {this.cubeData[z].value = sdata[0][0][key]}
                  //console.log(z, this.cubeData[z].value)
                  z++
                }
              }

            // for (let z = 2; z==sdata[0].length; z++) {
            //     console.log(sdata[0][z])
            //     this.cubeData[z].value = sdata[0][z]
            // }
        this.getComments(table, id)
            .subscribe((cdata: any) => {
                this.mycubesubject.next(this.cubeData);
                                this.mycubecomment.next(cdata[0])
            })
        })
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
        let mycubeconfig= new MyCubeConfig
        mycubeconfig.table = table
        mycubeconfig.edit = edit
        this.mycubeconfig.next(mycubeconfig)
    }
        

    public getMyCubeConfig(): Observable<MyCubeConfig> {
        return this.mycubeconfig.asObservable();
    }
}   