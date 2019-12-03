import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../_services/_server.service';
import { Server } from '../../../_models/server.model';
import { Layer, WMSLayer } from '../../../_models/layer.model'
import { ServerNewComponent } from './serverNew/serverNew.component';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { ConfirmDeleteComponent } from '../confirmdelete/confirmdelete.component';
import { LayerNewComponent } from '../layer/layerNew/layerNew.component';
import { MatDialog } from '@angular/material';
import { ServerValidatorService } from './serverValidator.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { ServerDetailsComponent } from '../details/serverDetails/serverDetails.component';
import { ServerLayersComponent } from './serverLayers/serverLayers.component';
import WMSCapabilities from 'ol/format/WMSCapabilities';

@Component({
    selector: 'server',
    templateUrl: './server.component.html',
    styleUrls: ['./server.component.scss'],
    providers: [ServerService]
})

export class ServerComponent implements OnInit {
    public objCode = 6;
    public token: string;
    public options: any;

    public toCreate: boolean = false;

    public servers: Array<Server>;
    public currServer: Server;

    public layerArray: Array<string> = [];
    public folderArray: Array<string> = [];
    public serviceArray: Array<string> = [];
    public formatArray: Array<string> = [];
    public WMSLayers: Array<WMSLayer> = [];
    public newLayer = new Layer

    public displayGeoserverLayers: boolean;
    public displayFolders: boolean;
    public path: string = '';

    public serverColumns = ['serverID', 'serverName', 'serverType', 'serverURL', 'actionsColumn']
    public dataSource: any;
    public http: Http

    constructor(private serverService: ServerService, private dialog: MatDialog, http: Http
    ) {
    this.http = http
        this.options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'text/plain' //use token auth
            })
        }
    }

    ngOnInit() {
        this.getServers();
        this.displayGeoserverLayers = false;
    }

    public getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((servers) => {
                this.servers = servers;
                this.dataSource = servers;
            });
    }

    public getCapabilities = (url): Observable<any> => {
        return this.http.get(url)
            .map((response: Response) => <any>response.text())
    }

    public clearArrays(): void {
        this.layerArray = [];
        this.folderArray = [];
        this.formatArray = [];
        this.displayGeoserverLayers = false;
    }

    // public getRequest(serv: Server): void {
    //     let url: string
    //     switch (serv.serverType) {
    //         case "Geoserver": {
    //             this.getGeoserver(serv)
    //             break
    //         }
    //         case "GeoserverWMTS":
    //             url = serv.serverURL + '/gwc/service/wmts?request=getcapabilities';
    //             break
    //         case "ArcGIS":
    //             //serv.serverURL = serv.serverURL + '?f=pjson';
    //             this.WMSRequest(serv, "Folder")
    //             break;
    //     }
    // }

    public getGeoserver(serv: Server): void {
        let url = serv.serverURL //+ '?request=getCapabilities&service=WMS';
        this.getCapabilities(url)
            .subscribe((data) => {
                let parser = new WMSCapabilities();
                let result = parser.read(data)
                this.WMSLayers = result['Capability']['Layer']['Layer']
                this.currServer = serv
            })
        // this.currServer = serv;
        // this.clearArrays();
        // this.displayGeoserverLayers = true;

        // this.serverService.getCapabilities(serv)
        //     .subscribe((response: string) => {
        //         this.parseGeoserver(response);
        //     });
    }

    // public parseGeoserver(response: string): void {
    //     //list is returned with two elements at indeces 0 and 1 that do not represent valid objects, and must be trimmed off via shift()
    //     let list = response.split('<Layer');
    //     list.shift();
    //     list.shift();

    //     for (let i of list) {
    //         let name = i.substr(i.indexOf('<Name>') + 6, (i.indexOf('</Name>') - (i.indexOf('<Name>') + 6)));
    //         let format = i.substr(i.indexOf('<Format>') + 8, (i.indexOf('</Format>') - (i.indexOf('<Format>') + 8)));
    //         this.folderArray.push(name);
    //         this.formatArray.push(format);
    //     }
    // }

    // public getLayers(serv: Server): void {
    //     let path: string = '';
    //     this.currServer = serv;
    //     this.clearArrays();
    //     this.displayFolders = true;
    //     this.serverService.getFolders(serv, path, "none", this.options)
    //         .subscribe((result: string) => {
    //             this.parseLayers(result);
    //         });
    // }

    // public parseLayers(response: string): void {
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

    // public WMSRequest(server: Server, type: string): void {
    //     console.log("WMSRequest " + server.serverURL)
    //     this.path = '/' + server.serverURL;
    //     this.clearArrays();
    //     this.displayFolders = true;
    //     this.serverService.getFolders(server, this.path, type, this.options)
    //         .subscribe((response: string) => {
    //             this.parseLayers(response);
    //         });
    // }

    public openConfDel(server: Server): void {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent);
        dialogRef.componentInstance.objCode = this.objCode;
        dialogRef.componentInstance.objID = server.ID;
        dialogRef.componentInstance.objName = server.serverName;

        dialogRef.afterClosed().subscribe(result => {
            if (result == this.objCode) {
                this.deleteServer(server.ID);
            }
            this.getServers();
        });
    }

    public deleteServer(serverID: number): void {
        this.serverService
            .Delete(serverID)
            .subscribe(result => {
                this.getServers();
            });
    }

    public updateServer(server: Server): void {
        this.serverService
            .Update(server)
            .subscribe(result => {
                this.getServers();
            });
    }

    // public createLayer(index: number, name: string): void {
    //     const dialogRef = this.dialog.open(LayerNewComponent, {height:'700px', width:'700px'});
    //     dialogRef.componentInstance.layerName = name;
    //     dialogRef.componentInstance.layerIdent = (String)(index);
    //     dialogRef.componentInstance.layerServiceField = this.path;
    //     //dialogRef.componentInstance.layerType = this.serviceArray[index]['type'];
    //     //dialogRef.componentInstance.layerServer = this.currServer;
    // }

    // public createGeoserverLayer(WMSLayer: WMSLayer): void {
    //     const dialogRef = this.dialog.open(LayerNewComponent, {height:'700px', width:'700px'});
    //     this.newLayer.layerName = WMSLayer.Title
    //     this.newLayer.layerIdent = WMSLayer.Name
    //     this.newLayer.layerService = "None"
    //     this.newLayer.server = this.currServer
    //     this.newLayer.layerType = "Geoserver WMS"
    //     //dialogRef.componentInstance.layerServer = this.currServer;
    //     dialogRef.componentInstance.serverLayer = this.newLayer
    // }


    public openServerNew(): void {
        const dialogRef = this.dialog.open(ServerNewComponent, { height: '300px', width: '360px' });
        dialogRef.afterClosed()
            .subscribe(result => {
                this.getServers();
            });
    }

    public openLayers(ID: number) {
        const dialogRef = this.dialog.open(ServerLayersComponent, { width: '760px' });
        dialogRef.componentInstance.ID = ID;
    }

    public openDetails(id: number, name: string): void {
        const dialogRef = this.dialog.open(ServerDetailsComponent, { width: '320px' });
        dialogRef.componentInstance.ID = id;
        dialogRef.componentInstance.name = name;
        dialogRef.afterClosed().subscribe(() => {
            this.getServers();
        })
    }
}