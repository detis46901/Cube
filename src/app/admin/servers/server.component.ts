import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../_services/server.service'
import { Server } from '../../../_models/server.model'
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ServerNewComponent } from'./servernew.component'
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { ConfirmdeleteService } from '../../../_services/confirmdelete.service';
import { ConfirmdeleteComponent } from '../confirmdelete/confirmdelete.component';
import { LayerNewComponent } from '../layeradmin/layernew.component';
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

    public layerArray;
    public nameArray: Array<string> = []
    public formatArray: Array<string> = []

    public displayLayers: boolean;
    public displayFolders: boolean;
    public closeResult: string;
    public path: Array<string> = []

    constructor(private _http: Http, private serverService: ServerService, private dialog: MdDialog, private confDelService: ConfirmdeleteService) {
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
        this.nameArray = [];
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
        this.path.push
        let list = JSON.parse(res)
        console.log (list.folders)
            for (let i of list.folders) {
            let name = i
            this.nameArray.push(name)
            }
    }

    parseResponse(res: string) {
        let list = res.split('<Layer')
        list.shift()
        list.shift()

        for (let i of list) {
            let name = i.substr(i.indexOf('<Name>') + 6, (i.indexOf('</Name>') - (i.indexOf('<Name>') + 6)))
            let format = i.substr(i.indexOf('<Format>') + 8, (i.indexOf('</Format>') - (i.indexOf('<Format>') + 8)))
            this.nameArray.push(name)
            this.formatArray.push(format)
        }
    }

    followFolder(folder) {
        let path: string = "/" + folder
        this.clearArrays()
        this.displayFolders = true;
        this.serverService.getFolders(this.currServer, path, this.options)
            .subscribe((response: string) =>
                {this.parseLayers(response, folder); console.log("done")}
            );
    }
    openConfDel(server) {
        const dialogRef = this.dialog.open(ConfirmdeleteComponent)
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

    createLayer(index) {
        const dialogRef = this.dialog.open(LayerNewComponent, {height:'38%', width:'28%'})

        dialogRef.componentInstance.layerName = this.nameArray[index]
        dialogRef.componentInstance.layerIdent = this.nameArray[index]
        dialogRef.componentInstance.layerFormat = this.formatArray[index]
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
