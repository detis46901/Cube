import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../_services/server.service'
import { Server } from '../../../_models/server.model'
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ServerNewComponent } from'./servernew.component'
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { ConfirmdeleteService } from '../../../_services/confirmdelete.service';
import { ConfirmdeleteComponent } from '../confirmdelete/confirmdelete.component';
import { LayerNewComponent } from '../layeradmin/layernew.component';

@Component({
    selector: 'server',
    templateUrl: './server.component.html',
    styleUrls: ['./server.component.scss'],
    providers: [ServerService, NgbModal, NgbActiveModal]
})
export class ServerComponent implements OnInit {
    public headers;
    public options;
    public objCode = 6;
    public toCreate: boolean = false;

    public servers: Array<Server>;
    public currServer: Server;

    public layerArray;
    public nameArray: Array<string> = []
    public formatArray: Array<string> = []

    public displayLayers: boolean;
    public closeResult: string;

    constructor(private _http: Http, private serverService: ServerService, private modalService: NgbModal, private activeModal: NgbActiveModal, private confDelService: ConfirmdeleteService) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        this.options = new RequestOptions({headers:this.headers});
    }

    ngOnInit() {
        this.getServers()
        this.displayLayers = false;
        console.log(this.activeModal)
    }

    getServers() {
        this.serverService
            .GetAll()
            .subscribe((data) => this.servers = data
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

    parseResponse(res: string) {
        let list = res.split('<Layer')
        list.shift()
        list.shift()
        //this.layerArray = [2, list.length-1]

        for (let i of list) {
            let name = i.substr(i.indexOf('<Name>') + 6, (i.indexOf('</Name>') - (i.indexOf('<Name>') + 6)))
            let format = i.substr(i.indexOf('<Format>') + 8, (i.indexOf('</Format>') - (i.indexOf('<Format>') + 8)))
            this.nameArray.push(name)
            this.formatArray.push(format)
            //this.layerArray[0, i]: = name
            //this.layerArray[1, i] = format
        }
    }

    openConfDel(server) {
        const modalRef = this.modalService.open(ConfirmdeleteComponent)
        modalRef.componentInstance.objCode = this.objCode
        modalRef.componentInstance.objID = server.ID
        modalRef.componentInstance.objName = server.serverName

        modalRef.result.then((result) => {
            this.deleteServer(server.ID)
            this.getServers();
        }, (reason) => {
            this.getServers();
        });
    }

    deleteServer(serverID) {
        this.serverService
            .Delete(serverID)
            .subscribe(result => {
                this.getServers();
            })
    }

    createLayer(index) {
        const modalRef = this.modalService.open(LayerNewComponent)
        console.log(this.nameArray[index] + this.formatArray[index])
        console.log(this.currServer.serverName)

        //not really working yet 7/31/17
        modalRef.componentInstance.layerName = this.nameArray[index]
        modalRef.componentInstance.layerIdent = this.nameArray[index]
        modalRef.componentInstance.layerFormat = this.formatArray[index]
        modalRef.componentInstance.layerServer = this.currServer

        modalRef.result.then((result) => {
            this.getServers();
        }, (reason) => {
            this.getServers();
        });
    }

    openServerNew() {
        const modalRef = this.modalService.open(ServerNewComponent, {size:'sm'})

        modalRef.result.then((result) => {
            this.getServers();
        }, (reason) => {
            this.getServers();
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
