import { Component, OnInit, Input, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as rx from 'rxjs'
import { SidenavService } from '../../_services/sidenav.service'

@Component({
  selector: 'marker-data',
  templateUrl: './marker-data.component.html',
  styleUrls: ['./marker-data.component.css'],
  providers: [SidenavService]
})
export class MarkerDataComponent implements OnInit {

  private features = this.sidenavService.getGeoData();
  private subject = new rx.Subject();

  constructor(private sidenavService: SidenavService) {}

  ngOnInit() {
  }

  public getFeatures(feats: Array<string>) {
    this.features = this.sidenavService.getGeoData();
  }

}
