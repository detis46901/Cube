import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'geoserver',
  templateUrl: './geoserver.component.html',
  styleUrls: ['./geoserver.component.css']
})
export class GeoserverComponent implements OnInit {

  public geos: any;

  public geoName: string = 'placeholder';
  public geoURL: string = 'placeholder';
  public geoEtc: string = 'placeholder';

  constructor() { }

  ngOnInit() {
  }

}
