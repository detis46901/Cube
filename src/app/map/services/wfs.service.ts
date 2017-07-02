import {Http, Headers, Response} from "@angular/http";
import {Location} from "../core/location.class";
import {Injectable} from "@angular/core";
import {Observable} from 'rxjs'
import { Subject } from 'rxjs/Subject';
import {WFSMarker} from '../../../_models/wfs.model'
import {Map, MouseEvent, Marker} from "leaflet";

import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

@Injectable()

export class WFSService {
    http: Http;
    public headers: Headers;
    public styleHead: Headers;
    private popupText = new Subject<string>();
    popupText$ = this.popupText.asObservable();

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
    fillbottom(bottom: string) {
        this.popupText.next(bottom);
    }
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
        let prop: string;
        let props: Array<any> = [];
        let exec: any;
        //let data = '<p>';
        let featureGroup;
        let len: number = 1;
        let data: Array<any> = []

        this.popupText.next("popup from wfs")
        return this.http.get(path, {headers: this.headers})
            .map( (responseData) => {
                return responseData.json();
        })
        .map((markers: Array<any>) => {
            
            //6/3017 - In order to get the right features from the array, this is the correct syntax for referencing.
            for (let i=0; i<markers["features"].length; i++) {
                
                props = JSON.stringify(markers["features"][0]["properties"]).split(',')
                len = props.length
                props[0] = props[0].substr(1)
                props[len-1] = props[len-1].substring(0,props[len-1].indexOf('}'))
                 for(var j=0; j<len; j++) {
                    props[j]=props[j].substring(1,props[j].indexOf('"', 1))
                 }
                 data.push ('<p>')
                for(var j=0; j<len; j++) {
                    exec = eval("markers.features[" + i + "].properties." + props[j])
                    data[i] = data[i] + '<b>' + props[j] + ": </b>" + exec + "<br>"
                 }
                 data[i] = data[i] + "</p>"
                let tempLatLng = L.latLng(markers["features"][i].geometry.coordinates[1], markers["features"][i].geometry.coordinates[0])
                let tempMarker = L.marker(tempLatLng)
                tempMarker.bindPopup(JSON.stringify(markers["features"][i]["properties"]))
                tempMarker.on('click', (event: MouseEvent) => {
                    this.popupText.next(data[i]);
                    tempMarker.closePopup()
                    })
                features.push(tempMarker)
            };

            //Compiles all of the markers into a group that may be rendered just as before in map.component, but encapsulated here.
            featureGroup = L.featureGroup(features)
            console.log(featureGroup)
            return featureGroup;
        });
    }

    // loadKML(path: string): Observable<any> {
    //     return this.http.get(path, {headers: this.headers})
    //         .map((response: Response) => <any>response.toString())
    // }

    // loadStyles(path: string) {

    //     this.http.get(path, {headers: this.styleHead})
    //         .map((response: Response) => <any>response.json())
    //         .subscribe(data => {console.log(data); return(data)})
    // }
}
 //     //Binds popup information to each marker
    //     function onEach (feature, layer) {
    //         let exec: any;
    //         let data = '<p>';

    //         //First iteration exclusive, cleanup property names array values (Column names, if you will) to simple plain-text string values
    //         if(props[0] == null) {
    //             props = JSON.stringify(feature.properties).split(',')
    //             len = props.length
    //             props[0] = props[0].substr(1)
    //             props[len-1] = props[len-1].substring(0,props[len-1].indexOf('}'))
    //             for(var i=0; i<len; i++) {
    //                 props[i]=props[i].substring(1,props[i].indexOf('"', 1))
    //             }
    //         }
    //         for(var i=0; i<len; i++) {
    //             exec = eval("feature.properties." + props[i])
    //             data = data + props[i] + ": " + exec + "<br>"
    //         }
    //         data = data + "</p>"
    //         layer.bindPopup(data)
    //     }