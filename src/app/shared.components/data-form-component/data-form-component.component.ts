import { Component, OnInit, Input } from '@angular/core';
import { DataFormConfig } from './data-form.model'
import { SQLService } from "../../../_services/sql.service"
import { DataField } from '_models/layer.model';


@Component({
  selector: 'app-data-form-component',
  templateUrl: './data-form-component.component.html',
  styleUrls: ['./data-form-component.component.scss']
})
export class DataFormComponentComponent implements OnInit {

  @Input() dataFormConfig: DataFormConfig

  constructor(private sqlService: SQLService) {
    this.dataFormConfig = new DataFormConfig
   }

  ngOnInit(): void {
  }

  public updateDataForm(dataField:DataField) {


  }

  public changeTextField(dataField:DataField) {

  }
}
