import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { LogFormConfig, LogField } from '../data-form.model'
import { SQLService} from '../../../../_services/sql.service'
import { DataFormService } from '../data-form.service'
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-log-form-component',
  templateUrl: './log-form-component.component.html',
  styleUrls: ['./log-form-component.component.scss']
})
export class LogFormComponentComponent implements OnInit {

  @Input() logFormConfig: LogFormConfig
  @Output() savedLog = new EventEmitter<LogFormConfig>()

  constructor(private sqlService: SQLService, private dataFormService: DataFormService) { }

  public newLogForm = new LogField()
  public URL: string
  ngOnInit(): void {
    this.URL = environment.apiUrl + '/api/sql/getanyimage'

  }

  public addLogForm() {
      if (this.newLogForm.file) {
        if (!this.newLogForm.comment) {
          this.newLogForm.comment = 'Attachment'
        }
      }
      let ntext: RegExp = /'/g
      this.newLogForm.comment = this.newLogForm.comment.replace(ntext, "''")
      this.newLogForm.featureid = this.logFormConfig.dataFormID
      this.newLogForm.userid = this.logFormConfig.userID
      this.newLogForm.auto = false
      //Need to add the time in here so it looks right when it is added immediately
      this.logFormConfig.logForm.push(this.newLogForm)
      this.saveLog(this.newLogForm).then((x) => {
        
      })    
  }

  public saveLog(logForm: LogField): Promise<any> {
    logForm.schema = this.logFormConfig.schema
    logForm.logTable = this.logFormConfig.logTable
    let promise = new Promise<void>((resolve) => {
      this.sqlService
      .addAnyComment(logForm)
      .subscribe((data) => {
        console.log(data)
        if (logForm.file) {
          console.log('file exists')
          console.log(data[0][0].id)
          this.uploadFile(logForm, data[0][0].id)
        }
        this.dataFormService.setLogConfig(this.logFormConfig.userID, this.logFormConfig.schema, this.logFormConfig.logTable, this.logFormConfig.dataFormID).then((x) => {
          let tempShowAuto: boolean = this.logFormConfig.showAuto
          this.logFormConfig = x
          this.logFormConfig.showAuto = tempShowAuto
          this.savedLog.emit(this.logFormConfig)
          this.newLogForm = new LogField()
        this.newLogForm.comment = null
        this.newLogForm.file = null
        resolve()
        })
      })
    })
    return promise
  }

  public deleteLogForm(id: number) {
    this.sqlService.deleteAnyRecord(this.logFormConfig.schema, this.logFormConfig.logTable, id)
      .subscribe((x) => {
        console.log(x)
        //can probably just remove the record from the dataset...
        this.dataFormService.setLogConfig(this.logFormConfig.userID, this.logFormConfig.schema, this.logFormConfig.logTable, this.logFormConfig.dataFormID).then((logFormConfig: LogFormConfig) => {
          let tempShowAuto: boolean = this.logFormConfig.showAuto
          this.logFormConfig = logFormConfig
          this.logFormConfig.showAuto = tempShowAuto
          this.savedLog.emit(logFormConfig)
        })
      })
  }

  public onFileSelected(event) {
    console.log(event) //This will be used for adding an image to a comment for myCube.
    this.newLogForm.file = <File>event.target.files[0] //Send to the bytea data type field in comment table.
  }

  public uploadFile(logForm: LogField, id: string) {
    let formdata: FormData = new FormData()
    formdata.append('photo', logForm.file)
    formdata.append('schema', this.logFormConfig.schema)
    formdata.append('table', this.logFormConfig.logTable.toString())
    formdata.append('id', id)
    this.sqlService
      .addImage(formdata)
      .subscribe((result) => {
        this.dataFormService.setLogConfig(logForm.userid, this.logFormConfig.schema, this.logFormConfig.logTable, this.logFormConfig.dataFormID).then((logFormConfig: LogFormConfig) => {
          this.logFormConfig = logFormConfig
          this.savedLog.emit(logFormConfig)
        })
      })
  }
}
