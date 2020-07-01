import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataFormConfig, LogField } from '../data-form.model'
import { SQLService } from "../../../../_services/sql.service"
import { DataField } from '_models/layer.model';
import { DataFormService } from '../data-form.service'
import Autolinker from 'autolinker';


@Component({
  selector: 'app-data-form-component',
  templateUrl: './data-form-component.component.html',
  styleUrls: ['./data-form-component.component.scss']
})
export class DataFormComponentComponent implements OnInit {

  @Input() dataFormConfig: DataFormConfig
  @Output() changedForm = new EventEmitter<DataFormConfig>()

  constructor(private sqlService: SQLService, private dataFormService: DataFormService) {
    this.dataFormConfig = new DataFormConfig
   }

  ngOnInit(): void {
  }

  public updateDataForm(dataField:DataField) {
    if (!this.dataFormConfig.rowID) return
    let FID: number = this.dataFormConfig.dataForm[0].value //required in the case the blur occurs when the object is unselected.
    if (dataField.changed) {
      dataField.links = Autolinker.parse(dataField.value, { urls: true, email: true })
      if (dataField.type == "date") {
        if (dataField.value) {
          dataField.value = dataField.value.toJSON()
        }
        else {
          dataField.value = null
        }
      }
      // if (dataField.type == "text") {
      //   let ntext: RegExp = /'/g
      //   dataField.value = dataField.value.replace(ntext, "'")
      // }
      this.sqlService
        .UpdateAnyRecord(this.dataFormConfig.schema, this.dataFormConfig.dataTable, this.dataFormConfig.dataForm[0].value, dataField)
        .subscribe((data) => {
          let logField = new LogField
          logField.schema = this.dataFormConfig.schema
          logField.logTable = this.dataFormConfig.logTable
          logField.auto = true
          logField.comment = dataField.field + " changed to " + dataField.value
          logField.featureid = FID
          logField.userid = this.dataFormConfig.userID
          this.sqlService.addAnyComment(logField)
            .subscribe((x)=> {
              this.dataFormService.setLogConfig(logField.userid, logField.schema, logField.logTable, logField.featureid).then(() => {
                this.changedForm.emit(this.dataFormConfig)
              })
            })

        })
      // if (dataField.type == "text") {
      //   let ntext: RegExp = /''/g
      //   dataField.value = dataField.value.replace(ntext, "'")
      // }
    }
    dataField.changed = false

  }

  public changeTextField(dataField:DataField) {
    dataField.changed = true
    dataField.links = Autolinker.parse(dataField.value, { urls: true, email: true })
  }
}
