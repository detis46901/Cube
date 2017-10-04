import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../_services/_server.service'
import { Server } from '../../../_models/server.model'
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ServerNewComponent } from'./serverNew/serverNew.component'
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { ConfirmDeleteComponent } from '../confirmDelete/confirmDelete.component';
import { LayerNewComponent } from '../layerAdmin/layerNew/layerNew.component';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
    selector: 'server',
    templateUrl: './server.component.html',
    styleUrls: ['./server.component.scss'],
    providers: [ServerService]
})
export class ServerComponent implements OnInit {
    public headers;
    public options;
    public objCode = 6;
    public toCreate: boolean = false;

    public servers: Array<Server>;
    public currServer: Server;
    public workingserverURL: string;

    public layerArray: Array<string> = []
    public folderArray: Array<string> = []
    public serviceArray: Array<string> = []
    public formatArray: Array<string> = []

    public displayLayers: boolean;
    public displayFolders: boolean;
    public closeResult: string;
    public path: string = ""
    public activeService: number;

    constructor(private _http: Http, private serverService: ServerService, private dialog: MdDialog) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        this.headers.append('Accept', 'text/plain');
        this.options = new RequestOptions({headers:this.headers});
    }

    ngOnInit() {
        this.getServers()
        this.displayLayers = false;
    }

    getServers() {
        this.serverService
            .GetAll()
            .subscribe(
                (data) => this.servers = data
            );
    }

    clearArrays() {
        this.layerArray = [];        
        this.folderArray = [];
        this.formatArray = [];
        this.displayLayers = false;
    }

    getRequest(serv) {
        this.currServer = serv;
        this.clearArrays()
            this.displayLayers = true;
            this.serverService.getCapabilities(serv, this.options)
                .subscribe((response: string) =>
                    this.parseResponse(response)
                );
    }

    getLayers(serv, folder) {
        let path: string = ""
        this.currServer = serv;
        this.clearArrays()
        this.displayFolders = true;
        this.serverService.getFolders(serv, path, this.options)
            .subscribe((response: string) =>
                {this.parseLayers(response, folder); console.log("done")}
            );
    }

    parseLayers(res: string, folder) {
        let list = JSON.parse(res)
        if (list.folders) {
        console.log (list.folders)
            for (let i of list.folders) {
            this.folderArray.push(i)
            }
        }
        if (list.services) {
        console.log (list.services)
            for (let i of list.services) {
                this.serviceArray.push(i)
            }
        }
        if (list.layers) {
            console.log (list.layers)
            for (let i of list.layers) {
                this.layerArray.push(i)
            }
        }
    }

    parseResponse(res: string) {
        let list = res.split('<Layer')
        list.shift()
        list.shift()

        for (let i of list) {
            let name = i.substr(i.indexOf('<Name>') + 6, (i.indexOf('</Name>') - (i.indexOf('<Name>') + 6)))
            let format = i.substr(i.indexOf('<Format>') + 8, (i.indexOf('</Format>') - (i.indexOf('<Format>') + 8)))
            this.folderArray.push(name)
            this.formatArray.push(format)
        }
    }

    WMSRequest(path, type) {
        console.log('path = ' + path)
        console.log('type = ' + type)
        this.path = "/" + path
        this.clearArrays()
        this.displayFolders = true;
        this.serverService.getFolders(this.currServer, this.path, this.options)
            .subscribe((response: string) =>
                {this.parseLayers(response, this.path); console.log(this.path)}
            );
    }
    openConfDel(server) {
        const dialogRef = this.dialog.open(ConfirmDeleteComponent)
        dialogRef.componentInstance.objCode = this.objCode
        dialogRef.componentInstance.objID = server.ID
        dialogRef.componentInstance.objName = server.serverName

        dialogRef.afterClosed().subscribe(result => {
            if(result == true) {
                this.deleteServer(server.ID)
            }
            this.getServers()
        });
    }

    deleteServer(serverID) {
        this.serverService
            .Delete(serverID)
            .subscribe(result => {
                this.getServers();
            })
    }

    updateServer(server) {
        this.serverService
            .Update(server)
            .subscribe(result => {
                this.getServers();
            })
    }

    createLayer(index, name) {
        const dialogRef = this.dialog.open(LayerNewComponent, {height:'360px', width:'500px'})
        console.log(index)
        console.log("layer name? " + name) //error here
        dialogRef.componentInstance.layerName = name
        dialogRef.componentInstance.layerIdent = index
        dialogRef.componentInstance.layerService = this.path
        dialogRef.componentInstance.layerType = this.serviceArray[index]["type"]
        dialogRef.componentInstance.layerServer = this.currServer

        dialogRef.afterClosed().subscribe(result => {
            this.getDismissReason = result;
        });
    }

    openServerNew() {
        const dialogRef = this.dialog.open(ServerNewComponent, {height:'40%', width:'20%'});

        dialogRef.afterClosed().subscribe(result => {
            this.getServers()
        });
    }

    getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } 
        else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } 
        else {
            return  `with: ${reason}`;
        }
    }
    
}
