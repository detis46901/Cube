import { Injectable } from '@angular/core';
import { DataFormConfig, DataField, DataFieldConstraint, LogFormConfig, LogField } from './data-form.model'
import { SQLService } from '../../../_services/sql.service'
import { environment } from '../../../environments/environment'
import { MatSnackBar } from '@angular/material/snack-bar';

import Autolinker from 'autolinker';


@Injectable({
  providedIn: 'root'
})
export class DataFormService {


  constructor(private sqlService: SQLService, public snackBar: MatSnackBar,
    ) { }

  public setDataFormConfig(schema: string, table: string, record?: string | number): Promise<DataFormConfig> {
    let promise = new Promise<DataFormConfig>((resolve) => {
      let dataFormConfig = new DataFormConfig
      dataFormConfig.schema = schema
      dataFormConfig.dataTable = table
      if (record) { dataFormConfig.rowID = record.toString() }
      this.sqlService.GetSchema(schema, table)
        .subscribe((data) => {
          console.log(data)
          dataFormConfig.dataForm = data[0]
          this.sqlService.getConstraints(schema, table)
            .subscribe((constraints) => {
              dataFormConfig.dataForm = this.setConstraints(dataFormConfig.dataForm, constraints)
              if (record) {
                this.getsingles(dataFormConfig).then(dataFormConfigWithSingle => {
                  dataFormConfig = dataFormConfigWithSingle
                  resolve(dataFormConfig)
                }
                )
              }
              else {
                resolve(dataFormConfig)
              }
            })

        })
    })
    return promise
  }

  public setConstraints(items: DataField[], constraints): DataField[] {
    items.forEach((item) => {
      constraints[0].forEach(element => {
        if (item.field + '_types' == element['conname']) {
          item.constraints = new Array<DataFieldConstraint>()
          let constraints: string = element['consrc']
          let arrayConstraints: Array<string> = constraints.split(' OR ')
          if (item.type == 'text' || item.type == 'character varying') {
            arrayConstraints.forEach((x) => {
              let ar1 = x.split("'")[1]
              let ar2 = ar1.split("'")[0]
              let constr = new DataFieldConstraint()
              constr.name = ar2
              constr.option = "option"
              item.constraints.push(constr)
            })
          }
          if (item.type == 'integer' || item.type == 'smallint' || item.type == 'bigint') {
            arrayConstraints.forEach((x) => {
              let ar1 = x.split("= ")[1]
              let ar2 = ar1.split(")")[0]
              let constr = new DataFieldConstraint()
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

  getsingles(dataFormConfig: DataFormConfig): Promise<any> {
    let promise = new Promise(resolve => {
      this.sqlService.GetAnySingle(dataFormConfig.schema, dataFormConfig.dataTable, 'id', dataFormConfig.rowID)
        .subscribe((sdata: JSON) => {
          let z = 0
          for (let key in sdata[0][0]) {
            if (sdata[0][0].hasOwnProperty(key)) {
              dataFormConfig.dataForm[z].visible = true
              dataFormConfig.dataForm[z].value = sdata[0][0][key]
              if (dataFormConfig.dataForm[z].type == 'date') {
                dataFormConfig.dataForm[z].value += environment.localez
              } //this is required because the datepicker converts a date (with no locale) to local and it will lose a day with this.
              if (dataFormConfig.dataForm[z].value && (dataFormConfig.dataForm[z].type == 'text' || dataFormConfig.dataForm[z].type == 'character varying')) {
                dataFormConfig.dataForm[z].links = Autolinker.parse(dataFormConfig.dataForm[z].value, { urls: true, email: true })
              }
              z++
            }
          }
          resolve(dataFormConfig)
        })
    })
    return promise
  }

  ///Log Procedures
  public setLogConfig(userID, schema, table, id): Promise<any> {
    let promise = new Promise((resolve) => {
      this.sqlService.getSingleLog(schema, table, id)
        .subscribe((cdata: any) => {
          let logFormConfig = new LogFormConfig
          logFormConfig.schema = schema
          logFormConfig.logTable = table
          logFormConfig.dataFormID = id
          logFormConfig.userID = userID
          if (cdata[0]) {logFormConfig.logForm = cdata[0]}  //not sure this is necessary
          resolve(logFormConfig)
        })
    })
    return promise
  }

  public updateLogConfig(logFormConfig:LogFormConfig): Promise<LogFormConfig> {
    let promise = new Promise<LogFormConfig>((resolve) => {
      this.sqlService.getSingleLog(logFormConfig.schema, logFormConfig.logTable, logFormConfig.dataFormID)
        .subscribe((cdata: any) => {
          if (cdata[0]) {logFormConfig.logForm = cdata[0]}  //not sure this is necessary
          resolve(logFormConfig)
        })
    })
    return promise
  }

  public addDataForm(dataFormConfig: DataFormConfig, field: string, value: string): Promise<any> {
    let snackBarRef = this.snackBar.open('Record added', '', {
      duration: 4000
    });
    let promise = new Promise<any>((resolve) => {
      this.sqlService.addAnyRecord(dataFormConfig.schema, dataFormConfig.dataTable, field, value)
        .subscribe((x) => {
          console.log(x)
          let id = x[0][0]['id']
          dataFormConfig.dataForm.forEach((x) => {
            if (x.type != 'id' && x.value != null) {
              this.sqlService.UpdateAnyRecord(dataFormConfig.schema, dataFormConfig.dataTable, id, x)
                .subscribe((z) => {
                  console.log(z)
                  resolve(id)
                })
            }
          })
        })
    })
    return promise
  }

  
  public addLogForm(logField: LogField): Promise<any> {
    let promise = new Promise<any>((resolve) => {
      this.sqlService.addAnyComment(logField)
        .subscribe((x) => {
          console.log(x)
          resolve(x)
        })
    })
    return promise
  }

  public deleteDataFormConfig(dataFormConfig: DataFormConfig, field: string): Promise<any> {
    //need to embellish the snackbar to provide for an undo.
    let snackBarRef = this.snackBar.open('Record deleted', '', {
      duration: 4000
    });
    let promise = new Promise<any>((resolve) => {
      this.sqlService.deleteAnyRecord(dataFormConfig.schema, dataFormConfig.dataTable, field)
        .subscribe((x) => {
          resolve()
        })
    })
    return promise
  }
}
