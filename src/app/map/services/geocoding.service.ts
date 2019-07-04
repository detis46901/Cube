import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { MapConfig } from '../models/map.model'
import * as ol from 'openlayers';

import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

@Injectable()
export class GeocodingService {
    http: HttpClient;
    isTracking: boolean = true
    centerMapToggle: boolean = true
    mapConfig: MapConfig;
    position: any;
    sr = new ol.source.Vector
    ly = new ol.layer.Vector
    geolocation = new ol.Geolocation()
    accuracyFeature = new ol.Feature();
    positionFeature = new ol.Feature();

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
        //console.log("TrackMe")
        this.mapConfig = mapConfig
        //console.log(this.mapConfig.map.getView().getProjection())
        this.geolocation = new ol.Geolocation({
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
            this.accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
        });

        
        this.positionFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#3399CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            })
        }));
        this.geolocation.on('change:position', x => {
            //console.log("Position Change")
            var coordinates = this.geolocation.getPosition();
            this.positionFeature.setGeometry(coordinates ?
                new ol.geom.Point(coordinates) : null);
            if (this.centerMapToggle) {this.centerMap(coordinates)}
        });
        this.sr.addFeature(this.positionFeature)
        this.sr.addFeature(this.accuracyFeature)
        this.ly.setSource(this.sr)
        this.mapConfig.map.addLayer(this.ly)
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
            this.positionFeature.setGeometry([0,0] ?
            new ol.geom.Point([0,0]) : null);
            this.accuracyFeature.setGeometry([0,0] ?
                new ol.geom.Point([0,0]) : null);}
        else {
            this.centerMapToggle = true
        }
    }
}
