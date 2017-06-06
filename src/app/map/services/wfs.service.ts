import {Http, Headers, Response} from "@angular/http";
import {Location} from "../core/location.class";
import {Injectable} from "@angular/core";
import {Observable} from 'rxjs'

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

    loadKML(path: string): Observable<any> {
        return this.http.get(path, {headers: this.headers})
            .map((response: Response) => <any>response.json())
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
