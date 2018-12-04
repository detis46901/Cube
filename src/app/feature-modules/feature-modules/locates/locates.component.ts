import { Component, OnInit, Input } from '@angular/core';
import { UserPageLayer } from '_models/layer.model';
import { MapConfig } from '../../../map/models/map.model';
import { geoJSONService } from './../../../map/services/geoJSON.service';


@Component({
  selector: 'app-locates',
  templateUrl: './locates.component.html',
  styleUrls: ['./locates.component.css']
})
export class LocatesComponent implements OnInit {
  
  
  constructor(
    private geojsonservice: geoJSONService,
  ) { }
  @Input() mapConfig: MapConfig;
  ngOnInit() {
    console.log('Initializing Locate component')
  }

}
