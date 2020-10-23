
import { map, retry, catchError } from 'rxjs/operators';
import { Component, OnInit, Input } from '@angular/core';
import { ServerService } from '../../../../_services/_server.service';
import { Server, ArcGISServer } from '../../../../_models/server.model';
import { Layer, WMSLayer } from '../../../../_models/layer.model';
import { MatDialog } from '@angular/material/dialog';
import { LayerNewComponent } from '../../layer/layerNew/layerNew.component';
import { Observable } from 'rxjs';


import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { environment } from 'environments/environment'
import WMSCapabilities from 'ol/format/WMSCapabilities';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import { parse } from 'path';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-serverLayers',
    templateUrl: './serverLayers.component.html',
    styleUrls: ['./serverLayers.component.scss']
})

export class ServerLayersComponent implements OnInit {

    @Input() ID;
    public http: HttpClient;
    public server = new Server
    private options: any;
    public layers: any;
    public WMSLayers = new Array<Layer>()
    public WMTSLayers = new Array<Layer>()
    public FeatureServerLayers = new Array<Layer>()
    public folders: any;
    public services: ArcGISServer[];
    public selectedFolder: string;
    private selectedService: any;
    private selectedServiceType: any;
    selected = new FormControl(0)

    private headerDict = {
        'X-Requested-With': 'XMLHttpRequest'
    }

    private requestOptions = {
        headers: new Headers(this.headerDict),
    };

    constructor(private dialog: MatDialog, private serverService: ServerService, http: HttpClient, private snackBar: MatSnackBar) {
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
        // console.log(url, { observe: 'body', responseType: 'text'} )
        return this.http.get(url, { observe: 'body', responseType: 'text' })
    }

    public getArcGIS = (url): Observable<any> => {
        console.log("getArcGIS (with proxy server")
        //This may also need to be addressed as well.  While unlikely, this won't work if the ArcGIS server is on the same domain as Cube.
        console.log(url)
        //return this.http.get(environment.proxyUrl + '/' + url2)
        return this.http.get(url).pipe(
            catchError(err => this.handleError(url))
        )

        //environment.proxyUrl + '/' + //this may need to go back in here somewhere.
    }

    public handleError(url): Observable<any> {
        let url2 = url.split('//')[1]
        return this.http.get(environment.proxyUrl + '/' + url2)
    }
    public getCapabilitiesWithProxy = (url): Observable<any> => {
        console.log("getArcGIS (with proxy server")
        //This may also need to be addressed as well.  While unlikely, this won't work if the ArcGIS server is on the same domain as Cube.
        let url2 = url.split('//')[1]
        return this.http.get(url, { observe: 'body', responseType: 'text' }).pipe(
            catchError(err => this.handleError2(url))
        )
    }
    public handleError2(url): Observable<any> {
        let url2 = url.split('//')[1]
        return this.http.get(environment.proxyUrl + '/' + url2, { observe: 'body', responseType: 'text' })
    }
    public getLayers(serv: Server): void {
        switch (serv.serverType) {
            case "ArcGIS WMS": {  //need to change over to just "ArcGIS"
                this.getFolders()
                break
            }
            case "ArcGIS": {  //need to change over to just "ArcGIS"
                this.getFolders()
                break
            }
            case "ArcGIS WMTS": {
                console.log('getting ArcGIS WMTS Layers')
                this.getFolders()
                break
            }
            case "Geoserver": {
                this.getGeoserverLayers()
                break
            }
        }
    }
    private getGeoserverLayers(): void {
        this.selectedService = "None"
        this.selectedServiceType = "Geoserver"
        this.getCapabilities(this.server.serverURL + '/wms?service=wms&version=1.1.1&request=GetCapabilities')
            .subscribe(
                data => {
                    let parser = new WMSCapabilities()
                    let result = parser.read(data);
                    let WMSLayers: any[] = result['Capability']['Layer']['Layer']
                    // this.WMSLayers = result['Capability']['Layer']['Layer']
                    WMSLayers.forEach((x) => {
                        let ly = new Layer
                        ly.layerFormat = "Geoserver WMS"
                        ly.layerDescription = x['Abstract']
                        ly.layerIdent = x['Name']
                        ly.layerName = x['Title']
                        ly.layerType = 'Geoserver WMS'
                        ly.layerGeom = 'Point' //this just needs to be removed
                        ly.layerService = 'None'
                        ly.server = this.server
                        ly.layerFormat = 'image/png'
                        ly.serverID = this.server.ID
                        this.WMSLayers.push(ly)
                    })
                }
                // err => console.log('HTTP Error', err)
            )
        this.getCapabilities(this.server.serverURL + "/gwc/service/wmts?request=GetCapabilities")
            .subscribe((data) => {
                let parser = new WMTSCapabilities()
                let result: any = parser.read(data)
                let WMTSLayers: any
                WMTSLayers = result['Contents']['Layer']
                WMTSLayers.forEach((x) => {
                    let ly = new Layer
                    ly.layerFormat = "Geoserver WMTS"
                    ly.layerIdent = x['Identifier']
                    ly.layerName = x['Title']
                    ly.layerType = 'Geoserver WMTS'
                    ly.layerGeom = 'Point' //this just needs to be removed
                    ly.layerService = 'None'
                    ly.server = this.server
                    ly.layerFormat = 'image/png'
                    ly.serverID = this.server.ID
                    this.WMTSLayers.push(ly)
                })
            })
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
                console.log(data)
                this.selected.setValue(0)
            })

    }
    public getServices(folder: string): void {
        this.selectedFolder = folder
        console.log(this.selectedFolder)
        console.log('getServices')
        this.getArcGIS(this.server.serverURL + '/' + folder + '?f=pjson')
            .subscribe((data) => {
                console.log(data['services'])
                this.services = data['services']
                this.services = this.services.filter(this.filterForMapServer)
            })
        this.selected.setValue(1);
    }

    private filterForMapServer(element, index, array) {
        return element['type'] == "ImageServer" || "MapServer"
    }

    public getArcGISLayers(service: string): void {
        console.log('getArcGISLayers')
        this.selectedService = service['name']
        this.selectedServiceType = service['type']
        let norest: string
        norest = this.server.serverURL.split('/rest')[0]
        norest = norest + '/services'
        console.log(norest + '/' + service['name'] + '/' + service['type'] + '/WMSServer?request=GetCapabilities&service=WMS')
        this.getCapabilitiesWithProxy(norest + '/' + service['name'] + '/' + service['type'] + '/WMSServer?request=GetCapabilities&service=WMS')
            .subscribe((data) => {
                let parser = new WMSCapabilities()
                let result: any
                try {
                    result = parser.read(data);
                    if (result['version'] != null) {
                        this.layers = result['Capability']['Layer']['Layer']
                        let WMSLayers: any[] = result['Capability']['Layer']['Layer']
                        // this.WMSLayers = result['Capability']['Layer']['Layer']
                        WMSLayers.forEach((x) => {
                            let ly = new Layer
                            ly.layerFormat = "MapServer WMS"
                            ly.layerDescription = x['Abstract']
                            ly.layerIdent = x['Name']
                            ly.layerName = x['Title']
                            ly.layerType = 'MapServer WMS'
                            ly.layerGeom = 'Point' //this just needs to be removed
                            ly.layerService = service['name']
                            ly.server = this.server
                            ly.layerFormat = 'image/png'
                            ly.serverID = this.server.ID
                            this.WMSLayers.push(ly)
                        })
                        this.selected.setValue(2);
                    }
                }
                catch (error) {
                    let snackBarRef = this.snackBar.open('No WMS Layers Found', '', {
                        duration: 4000
                    })
                }

            },
                error => {
                    {
                        let snackBarRef = this.snackBar.open('No WMS Layers Found', '', {
                            duration: 4000
                        })
                    }
                })
        this.getArcGISWMTS(service)
        this.getArcGISFeatureServer(service)
    }
    private getArcGISFeatureServer(service: string): void {
        console.log(this.server.serverURL + '/' + service['name'] + '/FeatureServer?f=pjson')
        this.getArcGIS(this.server.serverURL + '/' + service['name'] + '/FeatureServer?f=pjson')
        .subscribe((x) => {
            let layers = new Array<any>()
            layers = x['layers']
            console.log(layers)
            layers.forEach((y) => {
                let ly = new Layer
                ly.layerName = y['name']
                ly.layerIdent = y['id']
                ly.layerType = "FeatureServer"
                ly.layerGeom = y['defaultVisibility']
                ly.layerService = service['name']
                ly.layerFormat = 'image/png'
                ly.serverID = this.server.ID
                this.FeatureServerLayers.push(ly)
            })
        })
    }

    private getArcGISWMTS(service: string): void {
        this.getCapabilities(this.server.serverURL + '/' + service['name'] + '/' + service['type'] + '/WMTS/1.0.0/WMTSCapabilities.xml')
            .subscribe((data) => {
                let parser = new WMTSCapabilities()
                let result = parser.read(data)
                this.selected.setValue(2)
                if (result['version'] != null) {
                    if (result['ServiceIdentification']['ServiceType'] == "OGC WMTS") {
                        this.layers = result['Contents']['Layer']
                        let WMTSLayers: any
                        WMTSLayers = result['Contents']['Layer']
                        WMTSLayers.forEach((x) => {
                            console.log(x)
                            let ly = new Layer
                            ly.layerIdent = x['Identifier']
                            ly.layerName = x['Title']
                            ly.layerType = service['type'] + ' WMTS'
                            ly.layerGeom = 'Point' //this just needs to be removed
                            ly.layerService = service['name']
                            ly.server = this.server
                            ly.layerFormat = 'image/png'
                            ly.serverID = this.server.ID
                            this.WMTSLayers.push(ly)
                        })
                    }
                    else {
                        console.log('No WMTS Layers')
                    }
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

    public openCreateLayer(layer: Layer) {
        console.log('in openCreateLayer')
        console.log(layer)
        console.log(this.selectedService)
        // let ly = new Layer
        // ly.layerName = layer['Title']
        // ly.layerDescription = layer['Abstract']
        // ly.layerIdent = layer['Name']
        // ly.layerService = this.selectedService
        // ly.layerType = this.selectedServiceType
        // ly.serverID = this.server.ID
        // if (this.server.serverType == "WMTS") {
        //     ly.layerGeom = "Coverage"
        //     ly.layerType = "WMTS"
        //     ly.layerDescription = layer['Abstract']
        //     ly.layerIdent = layer['Identifier']
        // }
        // if (this.server.serverType == "ArcGIS WMTS") {
        //     ly.layerGeom = "Coverage"
        //     ly.layerType = "WMTS"
        //     ly.layerDescription = layer['Abstract']
        //     ly.layerIdent = layer['Identifier']
        // }
        // console.log(ly)
        const dialogRef = this.dialog.open(LayerNewComponent, { data: { serverLayer: layer, layerName: layer.layerName }, width: '500px' });
    }

    public setTab(event) {

    }
}
