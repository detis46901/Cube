import { Component, OnInit, Input } from '@angular/core';
import { MapConfig } from '../map/models/map.model';
import { map } from 'rxjs/operator/map';

@Component({
  selector: 'app-feature-modules',
  templateUrl: './feature-modules.component.html',
  styleUrls: ['./feature-modules.component.css']
})
export class FeatureModulesComponent implements OnInit {

  constructor() { }
  @Input() mapConfig: MapConfig;
  ngOnInit() {
    console.log(this.mapConfig)
  }

}
