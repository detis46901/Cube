import { Component, OnInit, Input } from '@angular/core';
import { ServerService } from '../../../../_services/_server.service';
import { Server } from '../../../../_models/server.model';
import { Layer, WMSLayer } from '../../../../_models/layer.model';
import { MatDialog } from '@angular/material';
import { LayerNewComponent } from '../../layer/layerNew/layerNew.component';
import { Observable } from 'rxjs/Observable';
import { retry, catchError } from 'rxjs/operators';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { environment } from 'environments/environment'
import WMSCapabilities from 'ol/format/WMSCapabilities';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import { parse } from 'path';
import { request } from '@esri/arcgis-rest-request';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-serverLayers',
    templateUrl: './serverLayers.component.html',
    styleUrls: ['./serverLayers.component.scss']
})

export class ServerLayersComponent implements OnInit {

    @Input() ID;
    public http: Http;
    public server = new Server
    private options: any;
    private layers: any;
    private folders: any;
    private services: string[];
    private selectedService: any;
    private selectedServiceType: any;
    selected = new FormControl(0)

    private headerDict = {
        'X-Requested-With': 'XMLHttpRequest'
    }

    private requestOptions = {
        headers: new Headers(this.headerDict),
    };

    constructor(private dialog: MatDialog, private serverService: ServerService, http: Http, private snackBar: MatSnackBar) {
        this.http = http
    }

    ngOnInit() {
        this.options = {
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'text/plain' //use token auth
            })
        }
        this.getServer(this.ID)
    }

    public getServer(ID: number) {
        this.serverService.GetSingle(ID)
            .subscribe((data) => {
                this.server = data
                this.getLayers(this.server)
            })
    }

    public getCapabilities = (url): Observable<any> => {
        //This needs to be looked at.  This will work fine as long as Geoserver is on the same server as Cube.  It may not work otherwise if CORS isn't set up on Geoserver.
        console.log(url)
        return this.http.get(url)
            .map((response: Response) => <any>response.text());
    }

    public getArcGIS = (url): Observable<any> => {
        console.log("getArcGIS (with proxy server")
        //This may also need to be addressed as well.  While unlikely, this won't work if the ArcGIS server is on the same domain as Cube.
        let url2 = url.split('//')[1]
        return this.http.get(environment.proxyUrl + '/' + url2)
            .map((response: Response) => {return response.json()});
    }
    public getCapabilitiesWithProxy = (url): Observable<any> => {
        console.log("getArcGIS (with proxy server")
        //This may also need to be addressed as well.  While unlikely, this won't work if the ArcGIS server is on the same domain as Cube.
        let url2 = url.split('//')[1]
        return this.http.get(environment.proxyUrl + '/' + url2)
            .map((response: Response) => {return response.text()});
    }

    private getLayers(serv: Server): void {
        switch (serv.serverType) {
            case "Geoserver WMS": {
                this.getGeoserverLayers()
                break
            }
            case "ArcGIS WMS": {
                this.getFolders()
                break
            }
            case "Geoserver WMTS": {
                this.getWMTSLayers()
                break
            }
            case "ArcGIS WMTS": {
                console.log('getting ArcGIS WMTS Layers')
                this.getFolders()
                break
            }
        }
    }
    private getGeoserverLayers(): void {
        this.selectedService = "None"
        this.selectedServiceType = "Geoserver"
        this.getCapabilities(this.server.serverURL + '?service=wms&version=1.1.1&request=GetCapabilities')
            .subscribe(
                data => {
                    let parser = new WMSCapabilities()
                    let result = parser.read(data);
                    this.layers = result['Capability']['Layer']['Layer']
                    console.log(this.layers)
                },
                err => { console.log('error') }
            )
    }
    private getWMTSLayers(): void {
        this.getCapabilities(this.server.serverURL + "?request=GetCapabilities")
            .subscribe((data) => {
                let parser = new WMTSCapabilities()
                let result = parser.read(data)
                this.layers = result['Contents']['Layer']
            })
    }
    private getFolders(): void {
        console.log('getFolders')
        this.getArcGIS(this.server.serverURL + '?f=pjson')
            .subscribe((data) => {
                this.folders = data['folders']
                this.services = data['services']
                this.selected.setValue(0)
            })
    }
    private getServices(folder: string): void {
        console.log('getServices')
        this.getArcGIS(this.server.serverURL + '/' + folder + '?f=pjson')
            .subscribe((data) => {
                console.log(data['services'])
                this.services = data['services']
                this.services = this.services.filter(this.filterForMapServer)
                this.selected.setValue(1);
            })
    }

    private filterForMapServer(element, index, array) {
        return element['type'] == "MapServer"
    }

    private getArcGISLayers(service: string): void {
        console.log('getArcGISLayers')
        if (this.server.serverType == 'ArcGIS WMTS') {
            this.getArcGISWMTS(service)
            return
        }
        this.selectedService = service['name']
        this.selectedServiceType = service['type']
        let norest: string
        norest = this.server.serverURL.split('/rest')[0]
        norest = norest + '/services'
        //something needs to go here
        console.log(norest + '/' + service['name'] + '/' + service['type'] + '/WMSServer?request=GetCapabilities&service=WMS')
        this.getCapabilitiesWithProxy(norest + '/' + service['name'] + '/' + service['type'] + '/WMSServer?request=GetCapabilities&service=WMS')
            .subscribe((data) => {
                let parser = new WMSCapabilities()
                let result = parser.read(data);
                this.layers = result['Capability']['Layer']['Layer']
                this.selected.setValue(2);
            },
                error => {
                    {
                        let snackBarRef = this.snackBar.open('No WMS Layers Found', '', {
                            duration: 4000
                        })
                    }
                })
    }
    private getArcGISWMTS(service: string): void {
        this.selectedService = service['name']
        this.getCapabilities(this.server.serverURL + '/' + service['name'] + '/MapServer/WMTS/1.0.0/WMTSCapabilities.xml')
            .subscribe((data) => {
                let parser = new WMTSCapabilities()
                let result = parser.read(data)
                this.selected.setValue(2)
                if (result['ServiceIdentification']['ServiceType'] == "OGC WMTS") {
                    this.layers = result['Contents']['Layer']
                }
                else {
                    console.log('No WMTS Layers')
                }
            },
                err => {
                    let snackBarRef = this.snackBar.open('No WMTS Layers Found', '', {
                        duration: 4000
                    });
                })
    }

    private getArcGISLayersFromGetCapabilities(url: string) {
        this.getCapabilities(url + 'request=GetCapabilities&service=WMS')
            .subscribe((data) => {
                let parser = new WMSCapabilities()
                let result = parser.read(data);
                this.layers = result['Capability']['Layer']['Layer']
                this.selected.setValue(2);
            })
    }

    private getRequest(serv: Server): void {  //Not being used.  May be useful some day??
        let url: string
        switch (serv.serverType) {
            case "Geoserver": {
                // this.getGeoserver(serv)
                break
            }
            case "GeoserverWMTS":
                url = serv.serverURL + '/gwc/service/wmts?request=getcapabilities';
                break
            case "ArcGIS":
                //serv.serverURL = serv.serverURL + '?f=pjson';
                // this.WMSRequest(serv, "Folder")
                break;
        }
    }

    private retrieveLayers(name) {
        // retrieves layers based upon the selected server's type, places them in an array
        // needs to add implementation for services
    }

    private openCreateLayer(layer) {
        console.log('in openCreateLayer')
        console.log(layer)
        console.log(this.selectedService)
        let ly = new Layer
        ly.layerName = layer['Title']
        ly.layerDescription = layer['Abstract']
        ly.layerIdent = layer['Name']
        ly.layerService = this.selectedService
        ly.layerType = this.selectedServiceType
        ly.serverID = this.server.ID
        if (this.server.serverType == "WMTS") {
            ly.layerGeom = "Coverage"
            ly.layerType = "WMTS"
            ly.layerDescription = layer['Abstract']
            ly.layerIdent = layer['Identifier']
        }
        if (this.server.serverType == "ArcGIS WMTS") {
            ly.layerGeom = "Coverage"
            ly.layerType = "WMTS"
            ly.layerDescription = layer['Abstract']
            ly.layerIdent = layer['Identifier']
        }
        console.log(ly)
        const dialogRef = this.dialog.open(LayerNewComponent, { data: { serverLayer: ly, layerName: layer['Name'] }, width: '500px' });
    }
}
