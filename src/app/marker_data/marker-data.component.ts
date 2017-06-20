import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'marker-data',
  templateUrl: './marker-data.component.html',
  styleUrls: ['./marker-data.component.css']
})
export class MarkerDataComponent implements OnInit {

  private features: Array<any> =  ["feature 1","feature 2","feature 3","feature 4"]//probably will have to be an Observer

  constructor() {}

  ngOnInit() {
  }

  public getFeatures() {
    this.features = ["features 1","feature 2","feature 3","feature 4"]
  }

}
