import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { SQLService } from '../../../_services/sql.service'
import { MyCubeField, MyCubeConfig, MyCubeComment, MyCubeConstraint } from '../../../_models/layer.model'
import { environment } from 'environments/environment'
import Feature from 'ol/Feature';
import { MapConfig } from '../models/map.model';
import Autolinker from 'autolinker';


//need to get wmsSubject to wmsService, but for some reason, it doesn't work over there.

@Injectable()

export class MyCubeService extends SQLService {
  private WMSSubject = new Subject<any>();
  private mycubesubject = new Subject<MyCubeField[]>();
  private mycubeconfig = new Subject<MyCubeConfig>();
  private mycubecomment = new Subject<MyCubeComment[]>();
  private cubeData: MyCubeField[]
  private mapConfig: MapConfig

  //needs to move to wmsService but for some reason it doesn't work there.
  sendWMS(message: string) {
    this.WMSSubject.next(message);
  }

  clearWMS() {
    this.WMSSubject.next();
  }

  getWMS(): Observable<any> {
    return this.WMSSubject.asObservable();
  }

  public parseAndSendWMS(WMS: string): void { //this really need to be in the WMS service, but I think there's a
    WMS = WMS.split("<body>")[1];
    WMS = WMS.split("</body>")[0];
    if (WMS.length < 10) {
      this.clearWMS();
    }
    else {
      this.sendWMS(WMS); //This allows the service to render the actual HTML unsanitized
    }
  }

  prebuildMyCube(layer) {
    this.GetSchema('mycube', 't' + layer.layer.ID)
      .subscribe((data) => {
        this.cubeData = data[0]
        this.cubeData[0].type = "id"
        this.cubeData[1].type = "geom"
      })
  }

  public getAndSendMyCubeData(table: number, feature: Feature, mapConfig: MapConfig): Promise<any> {
    this.mapConfig = mapConfig
    let promise = new Promise(resolve => {
      let id: number | string
      if (feature.getId() != undefined) {
        id = feature.getId()
      }
      else {
        id = feature.getProperties()['features'][0]['c']
      }
      this.GetSchema('mycube', 't' + table)
        .subscribe((data) => {
          this.cubeData = data[0]
          this.cubeData[0].value = id
          this.cubeData[0].type = "id"
          this.cubeData[1].type = "geom"
          this.getConstraints('mycube', 't' + table)
            .subscribe((constraints) => {
              this.cubeData = this.setConstraints(this.cubeData, constraints)
            })
          this.getsingles(table, id).then(() => {resolve(this.cubeData) })
        })
    });
    return promise
  }

  public setConstraints(items: MyCubeField[], constraints): MyCubeField[] {
    items.forEach((item) => {
      constraints[0].forEach(element => {
        if (item.field + '_types' == element['conname']) {
          item.constraints = new Array<MyCubeConstraint>()
          let constraints: string = element['consrc']
          let arrayConstraints: Array<string> = constraints.split(' OR ')
          if (item.type == 'text' || item.type == 'character varying') {
            arrayConstraints.forEach((x) => {
              let ar1 = x.split("'")[1]
              let ar2 = ar1.split("'")[0]
              let constr = new MyCubeConstraint()
              constr.name = ar2
              constr.option = "option"
              item.constraints.push(constr)
            })
          }
          if (item.type == 'integer' || item.type == 'smallint' || item.type == 'bigint') {
            arrayConstraints.forEach((x) => {
              let ar1 = x.split("= ")[1]
              let ar2 = ar1.split(")")[0]
              let constr = new MyCubeConstraint()
              constr.name = +ar2
              constr.option = "option"
              item.constraints.push(constr)
            })
          }
        }
      })
    })
    return items
  }

  getsingles(table, id): Promise<any> {
    let promise = new Promise(resolve => {
      this.GetSingle('mycube.t' + table, id)
        .subscribe((sdata: JSON) => {
          let z = 0
          for (let key in sdata[0][0]) {
            if (sdata[0][0].hasOwnProperty(key)) {
              if (z != 0) { this.cubeData[z].value = sdata[0][0][key] }
              if (this.cubeData[z].type == 'date') {
                this.cubeData[z].value += environment.localez
              } //this is required because the datepicker converts a date (with no locale) to local and it will lose a day with this.
              if (this.cubeData[z].value && (this.cubeData[z].type == 'text' || this.cubeData[z].type == 'character varying')) {
                this.cubeData[z].links = Autolinker.parse(this.cubeData[z].value, { urls: true, email: true })
              }
              z++
            }
          }
          resolve()
        })
    })
    this.loadComments(table, id)
    return promise
  }

  loadComments(table, id): any {
    this.getComments(table, id)
      .subscribe((cdata: any) => {
        if (this.mapConfig.selectedFeature) { //This is a necessary check to make sure the feature is still selected before it's shown.
          this.mycubesubject.next(this.cubeData);
          this.mycubecomment.next(cdata[0])
        }
      })
  }

  getMyCubeDataFromFeature(feature: ol.Feature) {
    this.cubeData.forEach((item) => {
      item.value = feature.get(item.field)
    })
    this.mycubesubject.next(this.cubeData)
  }

  // clearMyCubeData() {
  //   this.mycubesubject.next();
  // }

  // getMyCubeData(): Observable<any> {
  //   return this.mycubesubject.asObservable();
  // }

  // clearMyCubeComments() {
  //   this.mycubecomment.next();
  // }

  // getMyCubeComments() {
  //   return this.mycubecomment.asObservable();
  // }

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

  public createAutoMyCubeComment(auto: boolean, commentText: string, featureID: string | number, layerID: number, userID: number, geom?: any): Promise<any> {
    console.log('Creating Auto Comment')
    let comment = new MyCubeComment()
    let promise = new Promise((resolve) => {
      comment.auto = auto
      comment.comment = commentText
      comment.featureid = featureID
      comment.table = layerID
      comment.userid = userID
      comment.geom = geom
      // if (geom != undefined) {
      //   this.addCommentWithGeom(comment)
      //     .subscribe((data) => {
      //       console.log(data)
      //       resolve()
      //     })
      // }
      // else {
      //   this.addCommentWithoutGeom(comment)
      //     .subscribe((data) => {
      //       resolve()
      //     })
      // }
    })
    return promise
  }
}
