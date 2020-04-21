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
      this.newLogForm.schema = this.logFormConfig.schema
      this.newLogForm.logTable = this.logFormConfig.logTable
      this.saveLog(this.newLogForm).then((x) => {
        
      })    
  }

  public saveLog(logForm: LogField): Promise<any> {
    let promise = new Promise((resolve) => {
      this.sqlService
      .addAnyComment(logForm)
      .subscribe((data) => {
        console.log(data)
        if (logForm.file) {
          console.log('file exists')
          console.log(data[0][0].id)
          this.uploadFile(logForm, data[0][0].id)
        }
        //this.myCubeComments.push(this.newComment)
        this.dataFormService.setLogConfig(this.logFormConfig.schema, this.logFormConfig.logTable, this.logFormConfig.dataFormID).then((x) => {
          this.logFormConfig = x
          this.savedLog.emit(this.logFormConfig)
          this.newLogForm = new LogField()
        this.newLogForm.comment = null
        this.newLogForm.file = null
        })
      })
    })
    return promise
  }

  public deleteLogForm(logForm: LogField) {
    console.log(logForm)
    this.sqlService.deleteAnyRecord(this.logFormConfig.schema, this.logFormConfig.logTable, logForm.id)
      .subscribe((x) => {
        console.log(x)
        this.dataFormService.setLogConfig(this.logFormConfig.schema, this.logFormConfig.logTable, this.logFormConfig.dataFormID).then((logFormConfig: LogFormConfig) => {
          this.logFormConfig = logFormConfig
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
    formdata.append('schema', logForm.schema)
    formdata.append('table', logForm.logTable.toString())
    formdata.append('id', id)
    this.sqlService
      .addImage(formdata)
      .subscribe((result) => {
        this.dataFormService.setLogConfig(this.logFormConfig.schema, this.logFormConfig.logTable, this.logFormConfig.dataFormID).then((logFormConfig: LogFormConfig) => {
          this.logFormConfig = logFormConfig
          this.savedLog.emit(logFormConfig)
        })
      })
  }
}
