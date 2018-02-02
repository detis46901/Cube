import {Http, Headers, Response, RequestOptions} from "@angular/http";
import {Location} from "../core/location.class";
import {Injectable} from "@angular/core";
import {Observable} from 'rxjs'
import { Subject } from 'rxjs/Subject';
import * as L from "leaflet";

import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

@Injectable()


export class WFSService {
    http: Http;
    public headers: Headers;
    public options: RequestOptions;
    private token: string;
    public styleHead: Headers;
    public popupText = new Subject<string>();
    popupText$ = this.popupText.asObservable();
    
    constructor(http: Http) {
        this.http = http;

        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json'); //maybe it should be text/plain.  Most servers don't allow the application/json.  But text/plain fails on Geoserver
        this.headers.append('Accept', 'application/json');  //same as above
        this.headers.append('Authorization', 'Bearer ' + this.token);
        this.headers.append('Access-Control-Allow-Origin', '*');
        this.options = new RequestOptions({headers: this.headers})

        this.styleHead = new Headers();
        this.styleHead.append('Content-Type', 'application/vnd.ogc.sld+xml')
        this.styleHead.append('Accept', 'application/json');

    }
    
    getfeatureinfo(URL, mouseDown: boolean) {
        return this.http.get(URL)
            .map((responseData) => {
                let temp: string = responseData['_body']

                //This "if" block captures layer features with no pre-formatted "content.ftl" file
                if (temp.startsWith("<table")) {
                    let formattedHead: Array<string> = [];
                    let formattedData: Array<string> = [];
                    let headArray = temp.split("<th")
                    let dataArray = temp.split("<td")

                    //Fill arrays with table heading values and data values of each, respectively
                    for (let i=1; i<headArray.length; i++) {
                        let temp = headArray[i].substring(headArray[i].indexOf(">")+1,headArray[i].indexOf("<"))
                        formattedHead[i-1] = temp
                    }
                    for (let i=1; i<dataArray.length; i++) {
                        let temp = dataArray[i].substring(dataArray[i].indexOf(">")+1,dataArray[i].indexOf("<"))
                        formattedData[i-1] = temp
                    }

                    //Create final string product to be displayed in HTML on sidenav
                    temp = "<h3>" + formattedData[0] + "</h3><br>"
                    for (let i=1; i<formattedData.length; i++) {
                        temp = temp + "<b>" + formattedHead[i] + ":</b> " + formattedData[i] + "<br>"
                    }
                }

                //This "if" block captures layer features from ArcGIS Servers
                
                if (temp.includes("<FIELDS")) {
                    console.log('ArcGIS Data')
                    let formattedHead: Array<string> = [];
                    let formattedData: Array<string> = [];
                    let temp1 = temp.split("<FIELDS ")
                    let temp2 = temp1[1].split("></FIELDS>")
                    let temp3 = temp2[0].replace(" ","<BR>")
                    let re = /'"'/gi
                    temp3 = temp3.replace('\"'," ")
                    //temp3 = temp3.replace('"'," ")
                    temp = temp3
                }

                // this.popupText.next(temp)
                //7/13/17 This allows click events to create sidenav popup information, while allowing mousemove events to change the cursor icon to a pointing hand without updating popup.
                // if (!mouseDown)
                //     {this.popupText.next(temp)}
                return temp;
            })
    }

    //Not used
    getPointLayers(path: string) {
        let features: Array<L.Layer> = [];
        let props: Array<any> = [];
        let exec: any = '';
        let featureGroup: L.FeatureGroup;
        let len: number = 1;
        let data: Array<any> = [];

        return this.http.get(path, this.options)
            .map( (responseData) => {
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
                    let tempLatLng = L.latLng(markers["features"][i].geometry.coordinates[1], markers["features"][i].geometry.coordinates[0])
                    let tempMarker = L.circleMarker(tempLatLng, {opacity: 0, fillOpacity: 0})
                    tempMarker.bindPopup(JSON.stringify(markers["features"][i]["properties"]))

                    //7/05/17 - on click function block for displaying marker information in sidenav
                    tempMarker.on('click', (event: L.LeafletMouseEvent) => {
                        this.popupText.next(data[i]);
                        tempMarker.closePopup()
                    })
                    features.push(tempMarker)
                };
                featureGroup = L.featureGroup(features)
                return featureGroup;
            });
    }

    //Not used
    getPolylineLayers(path: string) {
        let polylineOptions = {color:'blue', weight:6, opacity:0};
        let props, len, exec, polylineGroup;
        let data = Array<any>();
        let polylist: Array<L.Layer> = [];
        let count:number = 0;

        return this.http.get(path, this.options)
            .map( (responseData) => {
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
                        
                        polyline.on('click', (event: L.LeafletMouseEvent) => {
                            this.popupText.next(data[i]);
                            polyline.closePopup()
                        })
                        polylist.push(polyline)
                    }
                    
                };
                polylineGroup = L.featureGroup(polylist)
                return polylineGroup;
            });
    }

}