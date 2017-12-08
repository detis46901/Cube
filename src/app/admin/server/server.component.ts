import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../_services/_server.service';
import { Server } from '../../../_models/server.model';
import { ServerNewComponent } from './serverNew/serverNew.component';
import { Http, RequestOptions, Headers } from '@angular/http';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { LayerNewComponent } from '../layerAdmin/layerNew/layerNew.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'server',
    templateUrl: './server.component.html',
    styleUrls: ['./server.component.scss'],
    providers: [ServerService]
})

export class ServerComponent implements OnInit {
    private objCode = 6;
    private headers: Headers;
    private options: RequestOptions;
    
    private toCreate: boolean = false;

    private servers: Array<Server>;
    private currServer: Server;

    private layerArray: Array<string> = [];
    private folderArray: Array<string> = [];
    private serviceArray: Array<string> = [];
    private formatArray: Array<string> = [];

    private displayGeoserverLayers: boolean;
    private displayFolders: boolean;
    private path: string = '';

    constructor(private serverService: ServerService, private dialog: MatDialog) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        this.headers.append('Accept', 'text/plain');
        this.options = new RequestOptions({headers: this.headers});
    }

    ngOnInit() {
        this.getServers();
        this.displayGeoserverLayers = false;
    }

    private getServers(): void {
        this.serverService
            .GetAll()
            .subscribe((data) => {
                this.servers = data;
            });
    }

    private clearArrays(): void {
        this.layerArray = [];
        this.folderArray = [];
        this.formatArray = [];
        this.displayGeoserverLayers = false;
    }

    private getRequest(serv: Server): void {
        switch(serv.serverType) {
            case "Geoserver": {
                this.getGeoserver(serv)
                break
            }
            case "ArcGIS": {
                this.getLayers(serv)
                break
            }
        }
    }
    private getGeoserver(serv: Server): void {
        this.currServer = serv;
        this.clearArrays();
        this.displayGeoserverLayers = true;

        this.serverService.getCapabilities(serv, this.options)
            .subscribe((response: string) => {
                this.parseGeoserver(response);
            });
    }

    private parseGeoserver(response: string): void {
        //list is returned with two elements at indeces 0 and 1 that do not represent valid objects, and must be trimmed off via shift()
        let list = response.split('<Layer');
        list.shift();
        list.shift();

        for (let i of list) {
            let name = i.substr(i.indexOf('<Name>') + 6, (i.indexOf('</Name>') - (i.indexOf('<Name>') + 6)));
            let format = i.substr(i.indexOf('<Format>') + 8, (i.indexOf('</Format>') - (i.indexOf('<Format>') + 8)));
            this.folderArray.push(name);
            this.formatArray.push(format);
        }
    }

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

    private WMSRequest(path: string, type: string): void {
        console.log("WMSRequest " + path)
        this.path = '/' + path;
        this.clearArrays();
        this.displayFolders = true;
        this.serverService.getFolders(this.currServer, this.path, type, this.options)
            .subscribe((response: string) => {
                console.log(response)
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
        const dialogRef = this.dialog.open(LayerNewComponent, {height:'450px', width:'500px'});
        dialogRef.componentInstance.layerName = name;
        dialogRef.componentInstance.layerIdent = (String)(index);
        dialogRef.componentInstance.layerService = this.path;
        dialogRef.componentInstance.layerType = this.serviceArray[index]['type'];
        dialogRef.componentInstance.layerServer = this.currServer;
    }

    private createGeoserverLayer(name: string): void {
        const dialogRef = this.dialog.open(LayerNewComponent, {height:'360px', width:'500px'});
        dialogRef.componentInstance.layerName = name;
        dialogRef.componentInstance.layerIdent = name;
        dialogRef.componentInstance.layerService = "None";
        dialogRef.componentInstance.layerType = "Geoserver";
        dialogRef.componentInstance.layerServer = this.currServer;
    }
    

    private openServerNew(): void {
        const dialogRef = this.dialog.open(ServerNewComponent, {height:'300px', width:'350px'});
        dialogRef.afterClosed()
        .subscribe(result => {
            this.getServers();
        });
    }    
}