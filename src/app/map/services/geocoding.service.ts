import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { MapConfig } from '../models/map.model'
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from "ol/layer/Vector";
import VectorSource from 'ol/source/Vector';
import { addProjection, addCoordinateTransforms, transform } from 'ol/proj';
import Geolocation from 'ol/Geolocation';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import Point from 'ol/geom/Point';
import { map, filter, catchError, mergeMap } from 'rxjs/operators';
import { NominatimJS } from 'nominatim-search';
import { Observable, from } from 'rxjs';


@Injectable()
export class GeocodingService {
  http: HttpClient;
  isTracking: boolean = true
  centerMapToggle: boolean = false
  mapConfig: MapConfig;
  position: any;
  sr = new VectorSource
  ly = new VectorLayer
  geolocation = new Geolocation()
  accuracyFeature = new Feature();
  positionFeature = new Feature();

  constructor(http: HttpClient) {
    this.http = http;
  }

  geocode(address: string) {
    return this.http.get("http://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(address))
      .pipe(catchError(this.handleError))
  }

  getCurrentLocation() {
    return this.http.get("http://ipv4.myexternalip.com/json")
      .pipe(catchError(this.handleError))
  }

  getLatLng(address: string): JSON {
    NominatimJS.search({
      q: address
    }).then(results => {
      // do something with results
      console.log(results)
      return results
    }).catch(error => {
      // error ocurred
    });
    return
  }

  public search(search): Observable<any> {
     console.log(search)
     return from(NominatimJS.search({ q: search, viewbox: "-86.5,40.3,-86,40.6", bounded: 1}))
    //return this.http.get("https://nominatim.openstreetmap.org/search?street=" + search + "&city=Kokomo&state=IN")
  }

  protected handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an ErrorObservable with a user-facing error message
    return '';
  }

  trackMe(mapConfig: MapConfig) {
    //console.log("TrackMe")
    this.mapConfig = mapConfig
    //console.log(this.mapConfig.map.getView().getProjection())
    this.geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true
      },
      projection: this.mapConfig.map.getView().getProjection()
    });
    this.geolocation.setProjection(this.mapConfig.map.getView().getProjection())
    this.geolocation.setTracking(this.isTracking)
    this.geolocation.on("change", x => {
      //console.log(this.geolocation.getAccuracy())
    })

    this.geolocation.on('change:accuracyGeometry', x => {
      if (this.geolocation.getAccuracy() < 500) {
        //console.log("Should Show")
        this.accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
      }
    });

    this.positionFeature.setStyle(new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: '#3399CC'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    }));
    this.geolocation.on('change:position', x => {
      //console.log("Position Change")
      var coordinates = this.geolocation.getPosition();
      if (this.geolocation.getAccuracy() < 500) {
        this.positionFeature.setGeometry(coordinates ?
          new Point(coordinates) : null);
        if (this.centerMapToggle) { this.centerMap(coordinates) }
      }
    });

    {
      this.sr.addFeature(this.positionFeature)
      this.sr.addFeature(this.accuracyFeature)
      this.ly.setSource(this.sr)
      this.mapConfig.map.addLayer(this.ly)
    }
  }

  public centerMap(coordinates) {
    this.mapConfig.view.animate({
      center: coordinates,
    })
  }

  public setTracking(track: boolean) {
    this.geolocation.setTracking(track)
    this.isTracking = track
    if (!track) {
      this.positionFeature.setGeometry([0, 0] ?
        new Point([0, 0]) : null);
      this.accuracyFeature.setGeometry([0, 0] ?
        new Point([0, 0]) : null);
    }
    else {
      this.centerMapToggle = true
    }
  }
}
