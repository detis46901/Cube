import { Http, Headers, Response, RequestOptions } from "@angular/http";
import { Location } from "../core/location.class";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs'
import { Subject } from 'rxjs/Subject';
import { LayerPermission, Layer, UserPageLayer, MyCubeField, MyCubeConfig, MyCubeComment } from '../../../_models/layer.model';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';



import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

@Injectable()


export class WMSService {
    http: Http;
    public headers: Headers;
    public options: RequestOptions;
    private token: string;
    public styleHead: Headers;
    public popupText = new Subject<string>();
    popupText$ = this.popupText.asObservable();
    private subject = new Subject<any>();
    private messageSubject = new Subject<any>();
    public sanitizedURL: SafeResourceUrl

    constructor(http: Http, public sanitizer: DomSanitizer) {
        this.http = http;

        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json'); //maybe it should be text/plain.  Most servers don't allow the application/json.  But text/plain fails on Geoserver
        this.headers.append('Accept', 'application/json');  //same as above
        this.headers.append('Authorization', 'Bearer ' + this.token);
        this.headers.append('Access-Control-Allow-Origin', '*');
        this.options = new RequestOptions({ headers: this.headers })

        this.styleHead = new Headers();
        this.styleHead.append('Content-Type', 'application/vnd.ogc.sld+xml')
        this.styleHead.append('Accept', 'application/json');

    }

    sendMessage(message: any) {
        console.log(message)
        this.messageSubject.next(message);
    }

    clearMessage() {
        this.messageSubject.next(null);
    }

    getMessage(): Observable<any> {
        console.log("in Get Message")
        return this.messageSubject.asObservable();
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
                    for (let i = 1; i < headArray.length; i++) {
                        let temp = headArray[i].substring(headArray[i].indexOf(">") + 1, headArray[i].indexOf("<"))
                        formattedHead[i - 1] = temp
                    }
                    for (let i = 1; i < dataArray.length; i++) {
                        let temp = dataArray[i].substring(dataArray[i].indexOf(">") + 1, dataArray[i].indexOf("<"))
                        formattedData[i - 1] = temp
                    }

                    //Create final string product to be displayed in HTML on sidenav
                    temp = "<h3>" + formattedData[0] + "</h3><br>"
                    for (let i = 1; i < formattedData.length; i++) {
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
                    let temp3 = temp2[0].replace(" ", "<BR>")
                    let re = /'"'/gi
                    temp3 = temp3.replace('\"', " ")
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
    public getCapabilities = (url): Observable<any> => {
        return this.http.get(url + "?request=GetCapabilities")
            .map((response: Response) => <any>response.text());
    }
    public setLoadEvent(layer: UserPageLayer, source: ol.source.Source) {
        source.on('tileloadstart', () => {
            layer.loadStatus = "Loading";
            // console.log(layer.layer.layerName + " loading");
        })
        source.on('tileloadend', () => {
            layer.loadStatus = "Loaded";
            // console.log(layer.layer.layerName + " loaded");
        })
        source.on('tileloaderror', () => {
            // console.log("error");
        })
        source.on('imageloadstart', () => {
            layer.loadStatus = "Loading";
            // console.log(layer.layer.layerName + " loading");
        })
        source.on('imageloadend', () => {
            layer.loadStatus = "Loaded";
            // console.log(layer.layer.layerName + " loaded");
        })
        source.on('imageloaderror', () => {
            console.log("error");
        })
    }

    public formLayerRequest(layer: UserPageLayer): string {
        switch (layer.layer.layerType) {
            case ('MapServer'): {
                let norest: string = layer.layer.server.serverURL.split('/rest/')[0] + '/' + layer.layer.server.serverURL.split('/rest/')[1];
                let url: string = norest + '/' + layer.layer.layerService + '/MapServer/WMSServer';
                return url;
            }
            case ('Geoserver'): {
                let url: string = layer.layer.server.serverURL;
                return url;
            }
        }
    }

}