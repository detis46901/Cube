import {Http, Headers, Response} from "@angular/http";
import {Location} from "../core/location.class";
import {Injectable} from "@angular/core";
import {Observable} from 'rxjs'
import { Subject } from 'rxjs/Subject';
import {WFSMarker } from '../../../_models/wfs.model'
import "leaflet";

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
    getPointLayers(path: string) {
        let features: Array<L.Layer> = [];
        let props: Array<any> = [];
        let exec: any = '';
        let featureGroup: L.FeatureGroup;
        let len: number = 1;
        let data: Array<any> = [];

        return this.http.get(path, {headers: this.headers})
            .map( (responseData) => {
                //console.log(responseData)
                return responseData.json();
            })
            .map((markers: Array<JSON>) => {
                props = JSON.stringify(markers["features"][0]["properties"]).split(',')
                len = props.length
                props[0] = props[0].substr(1)
                props[len-1] = props[len-1].substring(0,props[len-1].indexOf('}'))

                for(let i=0; i<len; i++) {
                    props[i]=props[i].substring(1,props[i].indexOf('"', 1))
                }  
                
                for (let i=0; i<markers["features"].length; i++) {
                    data.push ('<p>')
                    props = JSON.stringify(markers["features"][i]["properties"]).split(',')
                    props[0] = props[0].substr(1)
                    props[len-1] = props[len-1].substring(0,props[len-1].indexOf('}'))

                    for(let j=0; j<len; j++) {
                        props[j]=props[j].substring(1,props[j].indexOf('"', 1))
                    }

                    for(let j=0; j<len; j++) {
                        let temp: string = props[j]
                        exec = markers["features"][i].properties[temp]
                        data[i] = data[i] + '<b>' + props[j] + ": </b>" + exec + "<br>"
                    }

                    data[i] = data[i] + "</p>"
                    //console.log(markers["features"][i].geometry.coordinates[1], markers["features"][i].geometry.coordinates[0])
                    let tempLatLng = L.latLng(markers["features"][i].geometry.coordinates[1], markers["features"][i].geometry.coordinates[0])
                    let tempMarker = L.circleMarker(tempLatLng, {opacity: 0, fillOpacity: 0})
                    tempMarker.bindPopup(JSON.stringify(markers["features"][i]["properties"]))

                    //7/05/17 - on click function block for displaying marker information in sidenav
                    tempMarker.on('click', (event: MouseEvent) => {
                        this.popupText.next(data[i]);
                        console.log(this.popupText)
                        tempMarker.closePopup()
                    })
                    features.push(tempMarker)
                };
                featureGroup = L.featureGroup(features)
                return featureGroup;
            });
    }

    //Can probably get this into the method above, and group them all together. They share a great deal of logic, could be divided through conditionals
    getPolylineLayers(path: string) {
        let polylineOptions = {color:'blue', weight:6, opacity:0};
        let props, len, exec, polylineGroup;
        let data = Array<any>();
        let polylist: Array<L.Layer> = [];
        let count:number = 0;

        return this.http.get(path, {headers: this.headers})
            .map( (responseData) => {
                console.log(responseData)
                return responseData.json();
            })
            .map((markers: Array<JSON>) => {
                console.log(markers)
                props = JSON.stringify(markers["features"][0]["properties"]).split(',')
                len = props.length
                props[0] = props[0].substr(1)
                props[len-1] = props[len-1].substring(0,props[len-1].indexOf('}'))

                for(let i=0; i<len; i++) {
                    props[i]=props[i].substring(1,props[i].indexOf('"', 1))
                }  
                
                for (let i=0; i<markers["features"].length; i++) {
                    data.push ('<p>')
                    props = JSON.stringify(markers["features"][i]["properties"]).split(',')
                    props[0] = props[0].substr(1)
                    props[len-1] = props[len-1].substring(0,props[len-1].indexOf('}'))

                    for(let j=0; j<len; j++) {
                        props[j]=props[j].substring(1,props[j].indexOf('"', 1))
                    }

                    for(let j=0; j<len; j++) {
                        let temp: string = props[j]
                        exec = markers["features"][i].properties[temp]
                        data[i] = data[i] + '<b>' + props[j] + ": </b>" + exec + "<br>"
                    }

                    data[i] = data[i] + "</p>"
                    let polylinePoints = Array<L.LatLng>();
                    let coordList = markers["features"][i].geometry.coordinates;

                    if(coordList.length != 0) { //Object number 36338 of Kokomo:Pipes has an empty coordinates array

                        //7/7/17 Cycles through the list of coordinate pairs from each indiviual polyline, then adds the coordinate pair to the line
                        for(let j=0; j<coordList[0].length; j++) {
                            if(j>count){count=j}//7/7/17 Finding largest coord pair
                            polylinePoints.push(L.latLng(coordList[0][j][1], coordList[0][j][0]))
                        }

                        let polyline = L.polyline(polylinePoints, polylineOptions);
                        polyline.bindPopup(JSON.stringify(markers["features"][i]["properties"]))
                        
                        polyline.on('click', (event: MouseEvent) => {
                            this.popupText.next(data[i]);
                            polyline.closePopup()
                        })
                        polylist.push(polyline)
                    }
                    
                };
                console.log(count)//Max number of coord pairs for Kokomo:Pipes is 180
                polylineGroup = L.featureGroup(polylist)
                return polylineGroup;
            });
    }

    getPolygonLayers(URL) {

    }

    getCoverageLayers(URL) {

    }

    getfeatureinfo(URL) {
        return this.http.get(URL, {headers: this.headers})
            .map((responseData) => {
                let temp: string = responseData['_body']
                if (temp.startsWith("<table")) {
                    console.log("caught")
                    let formattedHead: string = "";
                    let formattedData: string = "";

                    let headArray = temp.split("<th")
                    for (let i=1; i<headArray.length; i++) {
                        let temp = headArray[i].substring(headArray[i].indexOf("<"))
                        formattedHead = formattedHead + temp.split("<")[0] + "\n"
                    } 
                    console.log(formattedHead)

                    //7/12/17
                    /*while(there are still <th> tags) {
                        take substring of text between <th> OR <th > AND </th> and add (with line-break) to formattedHead
                    }
                    while(there are still <td> tags) {
                        take substring of text between <td> AND </td> and add (with line-break) to formattedData
                    }*/
                }
                this.popupText.next(temp)
                return temp;
            })
    }
}