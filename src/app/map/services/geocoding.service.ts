import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import { Location } from "../core/location.class";
import { Injectable } from "@angular/core";
import { MapConfig } from '../models/map.model'
import * as ol from 'openlayers';

import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

@Injectable()
export class GeocodingService {
    http: HttpClient;
    isTracking: boolean = true
    mapConfig: MapConfig;
    position: any;

    constructor(http: HttpClient) {
        this.http = http;
    }

    geocode(address: string) {
        return this.http.get("http://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(address))
            .pipe(catchError(this.handleError))
        // .map(result => {
        //     if (result.status !== "OK") { throw new Error("unable to geocode address"); }

        //     let location = new Location();
        //     location.address = result.results[0].formatted_address;
        //     location.latitude = result.results[0].geometry.location.lat;
        //     location.longitude = result.results[0].geometry.location.lng;

        //     let viewPort = result.results[0].geometry.viewport;
        //     location.viewBounds = L.latLngBounds(
        //       {
        //         lat: viewPort.southwest.lat,
        //         lng: viewPort.southwest.lng},
        //       {
        //         lat: viewPort.northeast.lat,
        //         lng: viewPort.northeast.lng
        //       });

        //     return location;
        // }); 2/13/18 HAVE TO FIND A WAY TO MAP RESPONSE WITH ANGULAR 5
    }

    getCurrentLocation() {
        return this.http.get("http://ipv4.myexternalip.com/json")
            .pipe(catchError(this.handleError))
        // .map(res => res.json().ip)
        // .flatMap(ip => this.http.get("http://freegeoip.net/json/" + ip))
        // .map((res: Response) => res.json())
        // .map(result => {
        //     let location = new Location();

        //     location.address = result.city + ", " + result.region_code + " " + result.zip_code + ", " + result.country_code;
        //     location.latitude = result.latitude;
        //     location.longitude = result.longitude;

        //     return location;
        // }); 2/13/18 HAVE TO FIND A WAY TO MAP RESPONSE WITH ANGULAR 5
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
        return new ErrorObservable();
    }

    trackMe(mapConfig: MapConfig) {
        this.mapConfig = mapConfig
        if (navigator.geolocation) {
         
          navigator.geolocation.watchPosition((position) => {
            //this.showTrackingPosition(position);
            console.log(position)
            this.position = position
            if (this.isTracking == true && position.coords.accuracy < 100) {
            this.centerMap()
            }
          });
        } else {
          alert("Geolocation is not supported by this browser.");
        }
      }

    public centerMap() {
        this.mapConfig.view.animate({
            center: ol.proj.transform([this.position['coords']['longitude'], this.position['coords']['latitude']], 'EPSG:4326', 'EPSG:3857')   ,
            
        })
    }
}
