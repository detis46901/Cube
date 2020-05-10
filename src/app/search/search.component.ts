import { Component, OnInit, ViewChild, ElementRef, } from '@angular/core';
//import Nodinatim from 'nodinatim';
import { NominatimJS } from 'nominatim-search';
import { Observable as OB} from 'ol';
import {from, Observable } from 'rxjs'


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  @ViewChild("layers") layers: ElementRef;
  public results: JSON[]
  constructor(
    //public geocoder = new Nodinatim()
  ) { }

  ngOnInit(): void {
    NominatimJS.search({
      q: 'bakery in new york'
    }).then(results => {
      // do something with results
      console.log(results)
    }).catch(error => {
      // error ocurred
    });
    // this.geocoder
    // .geocode('2600 Clifton Ave, Cincinnati, Ohio 45220')
    // .then(function(results) {
    //   console.log(results.latitude);
    //   console.log(results.longitude);
    // })
    // .catch(function() {
    //   // TODO: Handle error
    // });


  }
  public displayFn(results?: JSON[]): string | undefined {
    return results ? results['table'] : undefined;
}

public search(search): Observable<any> {
  return from (NominatimJS.search({q: search}))
}

}
