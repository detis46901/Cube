import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-feature-modules-admin',
  templateUrl: './feature-modules-admin.component.html',
  styleUrls: ['./feature-modules-admin.component.css']
})
export class FeatureModulesAdminComponent implements OnInit {

  @Input() instanceID
  @Input() instanceName

  constructor() { }

  ngOnInit(): void {
    console.log(this.instanceID)
  }

}
