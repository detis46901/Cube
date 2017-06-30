import {Http, Headers, Response} from "@angular/http";
import {Location} from "../core/location.class";
import {Injectable} from "@angular/core";
import {Observable} from 'rxjs'
import {WFSMarker} from '../../../_models/wfs.model'

import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

@Injectable()

export class WFSService {
    http: Http;
    public headers: Headers;
    public styleHead: Headers;

    constructor(http: Http) {
        this.http = http;

        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');

        this.styleHead = new Headers();
        this.styleHead.append('Content-Type', 'application/vnd.ogc.sld+xml')
        this.styleHead.append('Accept', 'application/json');
    }

    /*loadWFS(path: string) {
       this.http.get(path, {headers: this.headers})
            .map((response: Response) => <any>response.json())
            .subscribe(data => {console.log(data); return (data)})
    }*/

    //modify to accept any GeoJSON resource from Geoserver using standards exemplified in other services
    loadWFS(path: string): Observable<any> {
      return this.http.get(path, {headers: this.headers})
            .map((response: Response) => <any>response.json())
    }

    getWFS(path: string) {
        // return an observable
        let markers: Array<WFSMarker>
        console.log("getWFS 1")
        return this.http.get(path, {headers: this.headers})
            .map( (responseData) => {
                console.log(responseData.json())
                //markers = responseData.json();
                return responseData.json();
        })
        .map((markers: Array<any>) => {
            let result:Array<WFSMarker> = []; 
            for (let i=0; i<markers["features"].length; i++) {
                let temp = new WFSMarker(markers["features"][i].geometry.coordinates[0], markers["features"][i].geometry.coordinates[1])
                //console.log(temp)
                result.push(temp);
            };
            console.log(result)
            return result;
        });
    }

    //Added 6/30/17, basically same method as getWFS above, but tweaked as necessary to accomplish task.
    getWFSLayers(path: string) {
        let markers: Array<WFSMarker> = []
        let features: Array<L.Layer> = []
        let featureGroup;

        return this.http.get(path, {headers: this.headers})
            .map( (responseData) => {
                return responseData.json();
        })
        .map((markers: Array<any>) => {
            console.log(markers)
            console.log(markers["features"][0])

            //6/3017 - In order to get the right features from the array, this is the correct syntax for referencing.
            for (let i=0; i<markers["features"].length; i++) {
                let tempLatLng = L.latLng(markers["features"][i].geometry.coordinates[0], markers["features"][i].geometry.coordinates[1])
                let tempMarker = L.marker(tempLatLng)
                features.push(tempMarker)
                console.log(tempMarker)
                //featureArray.push(markers["features"][i])
            };

            //6/30/17 - This is designed to compile all of the markers into a group that may be rendered just as before in map.component, but encapsulated here.
            featureGroup = L.featureGroup(features)
            console.log(featureGroup)
            return featureGroup;
            //return result;
        });
    }

    loadKML(path: string): Observable<any> {
        return this.http.get(path, {headers: this.headers})
            .map((response: Response) => <any>response.toString())
    }

    loadStyles(path: string) {

        this.http.get(path, {headers: this.styleHead})
            .map((response: Response) => <any>response.json())
            .subscribe(data => {console.log(data); return(data)})
    }

//        this.http.get("http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Kokomo:Bench_Marks&maxFeatures=50&outputFormat=application%2Fjson", {headers: this.headers})
 //           .map((response: Response) => <GeoJSON.GeoJsonObject>response.json())
  //          .subscribe((data: GeoJSON.GeoJsonObject) => this.geoTest = data) //Don't know if this is the right conversion, or if it's even doing anything.
            //Getting an error that says the headers are not correct as well. Not sure where that needs to be set (Server or API)    
}
