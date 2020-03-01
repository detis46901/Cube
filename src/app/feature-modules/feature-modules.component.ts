import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MapConfig } from '../map/models/map.model';

import { FeatureModulesService } from './feature-modules.service'

@Component({
  selector: 'app-feature-modules',
  templateUrl: './feature-modules.component.html',
  providers: [FeatureModulesService],
  styleUrls: ['./feature-modules.component.css']
})

export class FeatureModulesComponent implements OnInit {

  constructor(public featureModelService: FeatureModulesService) { 
  }

  @Input() mapConfig: MapConfig;
  ms: string

  ngOnInit() {
    //this.featureModelService.setCurrentLayer('something')
  }
}
