import { Component, OnInit, Input, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as rx from 'rxjs'
import { SideNavService } from '../../_services/sidenav.service'

@Component({
  selector: 'marker-data',
  templateUrl: './marker-data.component.html',
  styleUrls: ['./marker-data.component.css'],
  providers: [SideNavService]
})
export class MarkerDataComponent implements OnInit {

  private features //= this.sideNavService.getGeoData();
  private subject = new rx.Subject();

  constructor(private sideNavService: SideNavService) {}

  ngOnInit() {
      this.getFeatures()
  }

  public getFeatures() {
    //this.features = this.sideNavService.getGeoData();
    this.features = "Hello"
  }

}
