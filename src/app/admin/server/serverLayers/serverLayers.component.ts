import { Component, OnInit, Input } from '@angular/core';
import { ServerService } from '../../../../_services/_server.service';
import { Server } from '../../../../_models/server.model';
import { Layer, WMSLayer } from '../../../../_models/layer.model';
import { MatDialog } from '@angular/material';
import { LayerNewComponent } from '../../layer/layerNew/layerNew.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';


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
    private services: any;

    constructor(private dialog: MatDialog, private serverService: ServerService, http: Http) { 
        this.http = http
        this.options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'text/plain' //use token auth
            })
        }
    }

    ngOnInit() {
        // this.getRequest();
        this.getServer(this.ID)
    }

    public getServer(ID: number) {
        this.serverService.GetSingle(ID)
        .subscribe((data) => {
            this.server = data
            console.log(this.server)
            this.getLayers(this.server)
        })
    }

    public getCapabilities = (url): Observable<any> => {
        return this.http.get(url)
            .map((response: Response) => <any>response.text());
    }

    public getArcGIS = (url): Observable<any> => {
        return this.http.get(url)
            .map((response: Response) => <any>response.json());
    }

    private getLayers(serv: Server): void {
        switch(serv.serverType) {
            case "Geoserver": {
                this.getGeoserverLayers()
            }
            case "ArcGIS": {
                this.getFolders()
            }
        }
    }
    private getGeoserverLayers(): void {
        console.log(this.server.serverURL)
        this.getCapabilities(this.server.serverURL + '?service=wms&version=1.1.1&request=GetCapabilities')
        .subscribe((data) => {  
        let parser = new ol.format.WMSCapabilities()
        let result = parser.read(data);
        this.layers = result['Capability']['Layer']['Layer']
        console.log(this.layers)
    })
    }
    private getFolders(): void {
        this.getArcGIS(this.server.serverURL + '?f=pjson')
        .subscribe((data) => {
            console.log(data['folders'])
            this.folders = data['folders']
        })
    }
    private getServices(folder: string): void {
        this.getArcGIS(this.server.serverURL + '/' + folder + '?f=pjson')
        .subscribe((data) => {
            console.log(data)
            this.services = data['services']
        })
    }
    private getArcGISLayers(service: string): void {
        let norest: string
        norest = this.server.serverURL.split('/rest')[0]
        norest = norest + '/services'
        console.log(norest + '/' + service['name'] + '/' + service['type'] + '/WMSServer?request=GetCapabilities&service=WMS')
        this.getCapabilities(norest + '/' + service['name'] + '/' + service['type'] + '/WMSServer?request=GetCapabilities&service=WMS')
        .subscribe((data) => {
            let parser = new ol.format.WMSCapabilities()
            let result = parser.read(data);
            this.layers = result['Capability']['Layer']['Layer']
            console.log(this.layers)    
        })
    }
    // private getLayers(serv: Server): void {
    //     let path: string = '';
    //     this.currServer = serv;
    //     this.clearArrays();
    //     this.displayFolders = true;
    //     this.serverService.getFolders(serv, path, "none", this.options)
    //         .subscribe((result: string) => {
    //             this.parseLayers(result);
    //         });
    // }

    // private parseLayers(response: string): void {
    //     console.log(response['folders'])
    //     let list = JSON.parse(response);
    //     if (list.folders) {
    //         for (let i of list.folders) {
    //             this.folderArray.push(i);
    //         }
    //     }
    //     if (list.services) {
    //         for (let i of list.services) {
    //             this.serviceArray.push(i);
    //         }
    //     }
    //     if (list.layers) {
    //         for (let i of list.layers) {
    //             this.layerArray.push(i);
    //         }
    //     }
    // }

    // private WMSRequest(server: Server, type: string): void {
    //     console.log("WMSRequest " + server.serverURL)
    //     this.path = '/' + server.serverURL;
    //     this.clearArrays();
    //     this.displayFolders = true;
    //     this.serverService.getFolders(server, this.path, type, this.options)
    //         .subscribe((response: string) => {
    //             this.parseLayers(response);
    //         });
    // }

    private getRequest(serv: Server): void {
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

    private openCreateLayer() {
        const dialogRef = this.dialog.open(LayerNewComponent, { width: '360px' });
    }
}
