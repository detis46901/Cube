import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../_services/_server.service';
import { Server } from '../../../_models/server.model';
import { Layer, WMSLayer } from '../../../_models/layer.model'
import { ServerNewComponent } from './serverNew/serverNew.component';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { LayerNewComponent } from '../layer/layerNew/layerNew.component';
import { MatDialog } from '@angular/material';
import { TableDataSource, DefaultValidatorService, ValidatorService, TableElement } from 'angular4-material-table';
import { ServerValidatorService } from './serverValidator.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { ServerDetailsComponent } from '../details/serverDetails/serverDetails.component';
import { ServerLayersComponent } from './serverLayers/serverLayers.component';

@Component({
    selector: 'server',
    templateUrl: './server.component.html',
    styleUrls: ['./server.component.scss'],
    providers: [ServerService, {provide: ValidatorService, useClass: ServerValidatorService}]
})

export class ServerComponent implements OnInit {
    private objCode = 6;
    private token: string;
    private options: any;
    
    private toCreate: boolean = false;

    private servers: Array<Server>;
    private currServer: Server;

    private layerArray: Array<string> = [];
    private folderArray: Array<string> = [];
    private serviceArray: Array<string> = [];
    private formatArray: Array<string> = [];
    private WMSLayers: Array<WMSLayer> = [];
    private newLayer = new Layer

    private displayGeoserverLayers: boolean;
    private displayFolders: boolean;
    private path: string = '';

    private serverColumns = ['serverID', 'serverName', 'serverType', 'serverURL', 'actionsColumn']
    private dataSource: TableDataSource<Server>;
    private http:Http

    constructor(private serverService: ServerService, private dialog: MatDialog, private serverValidator: ValidatorService, http: Http
         ) {this.http = http 
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

    private getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((servers) => {
                this.servers = servers;
                this.dataSource = new TableDataSource<Server>(servers, Server, this.serverValidator);
            });
    }

    public getCapabilities = (url): Observable<any> => {        
        return this.http.get(url)
            .map((response: Response) => <any>response.text())
    }

    private clearArrays(): void {
        this.layerArray = [];
        this.folderArray = [];
        this.formatArray = [];
        this.displayGeoserverLayers = false;
    }

    private getRequest(serv: Server): void {
        let url: string
        switch (serv.serverType) {
            case "Geoserver": {
                this.getGeoserver(serv)
                break
            }
            case "GeoserverWMTS":
                url = serv.serverURL + '/gwc/service/wmts?request=getcapabilities';
                break
            case "ArcGIS":
                //serv.serverURL = serv.serverURL + '?f=pjson';
                this.WMSRequest(serv, "Folder")
                break;
        }
    }
        
    private getGeoserver(serv: Server): void {
        console.log("getGeoserver")
        let url = serv.serverURL //+ '?request=getCapabilities&service=WMS';
        console.log(url)
        this.getCapabilities(url)
        .subscribe((data) => {
            console.log(data)
            let parser = new ol.format.WMSCapabilities();
            let result = parser.read(data)
            console.log(result)
            console.log(result['Capability']['Layer']['Layer'])
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

    // private parseGeoserver(response: string): void {
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

    private getLayers(serv: Server): void {
        let path: string = '';
        this.currServer = serv;
        this.clearArrays();
        this.displayFolders = true;
        this.serverService.getFolders(serv, path, "none", this.options)
            .subscribe((result: string) => {
                this.parseLayers(result);
            });
    }

    private parseLayers(response: string): void {
        console.log(response['folders'])
        let list = JSON.parse(response);
        if (list.folders) {
            for (let i of list.folders) {
                this.folderArray.push(i);
            }
        }
        if (list.services) {
            for (let i of list.services) {
                this.serviceArray.push(i);
            }
        }
        if (list.layers) {
            for (let i of list.layers) {
                this.layerArray.push(i);
            }
        }
    }

    private WMSRequest(server: Server, type: string): void {
        console.log("WMSRequest " + server.serverURL)
        this.path = '/' + server.serverURL;
        this.clearArrays();
        this.displayFolders = true;
        this.serverService.getFolders(server, this.path, type, this.options)
            .subscribe((response: string) => {
                this.parseLayers(response);
            });
    }

    private openConfDel(server: Server): void {
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

    private deleteServer(serverID: number): void {
        this.serverService
            .Delete(serverID)
            .subscribe(result => {
                this.getServers();
            });
    }

    private updateServer(server: Server): void {
        this.serverService
            .Update(server)
            .subscribe(result => {
                this.getServers();
            });
    }

    private createLayer(index: number, name: string): void {
        const dialogRef = this.dialog.open(LayerNewComponent, {height:'700px', width:'700px'});
        dialogRef.componentInstance.layerName = name;
        dialogRef.componentInstance.layerIdent = (String)(index);
        dialogRef.componentInstance.layerServiceField = this.path;
        //dialogRef.componentInstance.layerType = this.serviceArray[index]['type'];
        //dialogRef.componentInstance.layerServer = this.currServer;
    }

    private createGeoserverLayer(WMSLayer: WMSLayer): void {
        const dialogRef = this.dialog.open(LayerNewComponent, {height:'700px', width:'700px'});
        this.newLayer.layerName = WMSLayer.Title
        this.newLayer.layerIdent = WMSLayer.Name
        this.newLayer.layerService = "None"
        this.newLayer.server = this.currServer
        this.newLayer.layerType = "Geoserver WMS"
        //dialogRef.componentInstance.layerServer = this.currServer;
        dialogRef.componentInstance.serverLayer = this.newLayer
    }
    

    private openServerNew(): void {
        const dialogRef = this.dialog.open(ServerNewComponent, {height:'300px', width:'360px'});
        dialogRef.afterClosed()
        .subscribe(result => {
            this.getServers();
        });
    }

    private openLayers(name: string) {
        const dialogRef = this.dialog.open(ServerLayersComponent, {width:'360px'});
        dialogRef.componentInstance.name = name;
    }
    
    private openDetails(id: number, name: string): void {
        const dialogRef = this.dialog.open(ServerDetailsComponent, {width:'320px'});
        dialogRef.componentInstance.ID = id;
        dialogRef.componentInstance.name = name;
        dialogRef.afterClosed().subscribe(() => {
            this.getServers();
        })
    }
}