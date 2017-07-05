import {Http, Headers, Response} from "@angular/http";
import {Location} from "../core/location.class";
import {Injectable} from "@angular/core";
import {Observable} from 'rxjs'
import { Subject } from 'rxjs/Subject';
import {WFSMarker } from '../../../_models/wfs.model'
import {Map, MouseEvent, Marker} from "leaflet";

import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

@Injectable()


export class WFSService {
    http: Http;
    public headers: Headers;
    public styleHead: Headers;
    public popupText = new Subject<string>();
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

    
     //Updated 7/02/17: Loads and renders a WFS layer
    getWFSLayers(path: string) {
        let features: Array<L.Layer> = []
        let props: Array<any> = [];
        let exec: any = '';
        let featureGroup: L.FeatureGroup
        let len: number = 1;
        let data: Array<any> = []

        return this.http.get(path, {headers: this.headers})
            .map( (responseData) => {
                return responseData.json();
        })
        .map((markers: Array<JSON>) => {
            props = JSON.stringify(markers["features"][0]["properties"]).split(',')
            len = props.length
            console.log (markers)
            //console.log("Number of feature=" + markers["features"].length)
            //console.log("Number of Properties=" + len)
            props[0] = props[0].substr(1)
            props[len-1] = props[len-1].substring(0,props[len-1].indexOf('}'))
            for(let i=0; i<len; i++) {
                props[i]=props[i].substring(1,props[i].indexOf('"', 1))
            }
            //nowconsole.log(props)  
            
            for (let i=0; i<markers["features"].length; i++) {
                data.push ('<p>')
                props = JSON.stringify(markers["features"][i]["properties"]).split(',')
                //console.log(props) //props is the popup info for each marker
                props[0] = props[0].substr(1)
                //console.log(props[0])
                props[len-1] = props[len-1].substring(0,props[len-1].indexOf('}'))

               // console.log(markers["features"][i].properties["ELEVATION"]) //LEFT//OFF//12:00pm//7/5/17

                for(let j=0; j<len; j++) {
                    props[j]=props[j].substring(1,props[j].indexOf('"', 1))
                    //console.log(props[j])
                }

                for(let j=0; j<len; j++) {
                    //console.log(("markers.features[" + i + '].properties[' + [j] + ']'))
                    /*try {
                        exec = eval("markers.features[" + i + '].properties[' + [j] + ']')
                    } 
                    catch (e) {
                        console.log(e instanceof EvalError); // true
                        console.log(e.message);              // some Message
                        //console.log(e.name);                 // "EvalError" 
                    }*/
                    
                    //exec = eval()
                    let temp: string = props[j]
                    exec = markers["features"][i].properties[temp]
                    data[i] = data[i] + '<b>' + props[j] + ": </b>" + exec + "<br>"
                }
                data[i] = data[i] + "</p>"
                //console.log(data[i])
                let tempLatLng = L.latLng(markers["features"][i].geometry.coordinates[1], markers["features"][i].geometry.coordinates[0])
                let tempMarker = L.circleMarker(tempLatLng, {opacity: 0, fillOpacity: 0})
                tempMarker.bindPopup(JSON.stringify(markers["features"][i]["properties"]))

                //7/05/17 - on click function block for displaing marker information in sidenav
                tempMarker.on('click', (event: MouseEvent) => {
                    this.popupText.next(data[i]);
                    tempMarker.closePopup()
                    })
                features.push(tempMarker)

                
            };

            //Compiles all of the markers into a group that may be rendered just as before in map.component, but encapsulated here.
            featureGroup = L.featureGroup(features)
            //nowconsole.log(featureGroup)
            return featureGroup;
        });
    }
}