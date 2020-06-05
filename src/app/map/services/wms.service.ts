
import {map, buffer} from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from "@angular/core";
import { Observable ,  Subject } from 'rxjs'
import { UserPageLayer } from '../../../_models/layer.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'environments/environment'
import { filter, catchError, mergeMap } from 'rxjs/operators';
import { FnParam } from '@angular/compiler/src/output/output_ast';
import { WMTS } from 'ol/source';
import { MapService } from "../../map/services/map.service";
import { Options } from 'ol/source/WMTS'


@Injectable()

export class WMSService {
    http: HttpClient;
    public headers: Headers;
    public options: any;
    private token: string;
    public popupText = new Subject<string>();
    popupText$ = this.popupText.asObservable();
    private messageSubject = new Subject<any>();
    public sanitizedURL: SafeResourceUrl;
    public wmts: WMTS;
    private mapService: MapService;
    public wmsoptions: Options

    constructor(http: HttpClient, public sanitizer: DomSanitizer) {
        this.http = http;
        this.options = {
            headers: new HttpHeaders({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.token,
                'Access-Control-Allow-Origin': '*'
            })
        };
    }

    // sendMessage(message: any) {
    //     console.log(message)
    //     this.messageSubject.next(message);
    // }

    // clearMessage() {
    //     this.messageSubject.next(null);
    // }

    // getMessage(): Observable<any> {
    //     console.log("in Get Message")
    //     return this.messageSubject.asObservable();
    // }
    

    getfeatureinfo(URL, mouseDown: boolean) {
        // let getFeatureInfoController = Ext.ComponentMgr.all.find(function(c) {
        //     return c instanceof gxp.plugins.WMSGetFeatureInfo;
        //   });
        this.options.getfeatureinfo = {
            'Buffer':'25'           
        }
        console.log(this.options.getfeatureinfo)
        return this.http.request("GET", URL, {responseType: 'text'}).pipe(
            map((responseData) => {
                //console.log(responseData)
                let temp: string = responseData['_body']
                try{
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
                    temp = temp3
                }
            }
                catch{return responseData}

                return temp;
            }))
    }

    getGeoJSONInfo(URL):Observable<string> {
        return this.http.request("GET", URL, {responseType: 'text'})
    }

    public getCapabilities = (url): Observable<any> => {
        return this.http.request("GET", url + "?request=GetCapabilities", {responseType: 'text'})
    }

    public setLoadStatus(layer: UserPageLayer) {
        layer.source.on('tileloadstart', () => {
            layer.loadStatus = "Loading";
        })
        layer.source.on('tileloadend', () => {
            layer.loadStatus = "Loaded";
        })
        layer.source.on('tileloaderror', () => {
        })
        layer.source.on('imageloadstart', () => {
            layer.loadStatus = "Loading";
        })
        layer.source.on('imageloadend', () => {
            layer.loadStatus = "Loaded";
        })
        layer.source.on('imageloaderror', () => {
            console.log("error");
        })
    }

    public formLayerRequest(layer: UserPageLayer, noProxy?:boolean): string {
        switch (layer.layer.layerType) {
            case ('MapServer'): {
                console.log("Found MapServer Layer")
                let norest: string = layer.layer.server.serverURL.split('/rest/')[0] + '/' + layer.layer.server.serverURL.split('/rest/')[1];
                let norest2: string = norest.split("//")[1]
                let url: string = environment.proxyUrl + '/' + norest2 + '/' + layer.layer.layerService + '/MapServer/WMSServer';
                if (noProxy) {
                    url = "http://" + norest2 + '/' + layer.layer.layerService + '/MapServer/WMSServer';
                }
                return url;
            }
            case ('Geoserver'): {
                let url: string = layer.layer.server.serverURL;
                return url;
            }
            case ('ArcGISRest'): {
                console.log("Found ArcGISRest Layer")
                let norest: string = layer.layer.server.serverURL.split('/rest/')[0] + '/' + layer.layer.server.serverURL.split('/rest/')[1];
                let norest2: string = norest.split("//")[1]
                let url: string = environment.proxyUrl + '/' + norest2 + '/' + layer.layer.layerService + '/MapServer/WMSServer';
                if (noProxy) {
                    url = "http://" + norest2 + '/' + layer.layer.layerService + '/MapServer/WMSServer';
                }
                console.log(url)
                return url;
            }
            case ('WMTS'): {
                console.log("Found MapServer WMTS Layer")
                let norest: string = layer.layer.server.serverURL.split('/rest/')[0] + '/' + layer.layer.server.serverURL.split('/rest/')[1];
                let norest2: string = norest.split("//")[1]
                let url: string = environment.proxyUrl + '/' + norest2 + '/' + layer.layer.layerService + '/MapServer/WMSServer';
                if (noProxy) {
                    url = "http://" + norest2 + '/' + layer.layer.layerService + '/MapServer/WMTS/1.0.0/WMTSCapabilities.xml';
                }
                console.log(url)
                return url;
            }
        }
    }
}
