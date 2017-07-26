import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../_services/server.service'
import { Server } from '../../../_models/server.model'
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ServerNewComponent } from'./servernew.component'
import { Http, Response, RequestOptions, Headers } from '@angular/http'

@Component({
    selector: 'server',
    templateUrl: './server.component.html',
    styleUrls: ['./server.component.scss'],
    providers: [ServerService, NgbModal, NgbActiveModal]
})
export class ServerComponent implements OnInit {
    public headers;
    public options;

    public servers: Array<Server>;

    public layerArray;
    public nameArray: Array<string> = []
    public formatArray: Array<string> = []

    public displayLayers: boolean;
    public closeResult: string;

    constructor(private _http: Http, private serverService: ServerService, private modalService: NgbModal, private activeModal: NgbActiveModal) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        this.options = new RequestOptions({headers:this.headers});
    }

    ngOnInit() {
        this.getServers()
        this.displayLayers = false;
    }

    getServers() {
        this.serverService
            .GetAll()
            .subscribe((data) => this.servers = data,
                error => console.log(error),
                () => console.log(this.servers)
            );
    }

    clearArrays() {
        this.layerArray = [];        
        this.nameArray = [];
        this.formatArray = [];
    }

    getRequest(serv) {
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

    openServerNew() {
        this.modalService.open(ServerNewComponent, {size:'sm'}).result.then((result) => {
            console.log(result)
            this.closeResult = `Closed with: ${result}`;
            //this.getServerItems();
        }, (reason) => {
            console.log(reason);
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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
