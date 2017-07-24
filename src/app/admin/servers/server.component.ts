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
    public serverName: string = 'placeholder';
    public serverURL: string = 'placeholder';
    public serverType: string = 'placeholder';

    public closeResult: string;

    constructor(private _http: Http, private serverService: ServerService, private modalService: NgbModal, private activeModal: NgbActiveModal) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        this.options = new RequestOptions({ headers: this.headers });
    }

    ngOnInit() {
        this.getServers()
    }

    getServers() {
        this.serverService
            .GetAll()
            .subscribe((data) => this.servers = data,
                error => console.log(error),
                () => console.log(this.servers)
            );
    }

    /*getCapabilities(serv: Server, options) {
        let actionURL: string = serv.serverURL + '/wms?request=getCapabilities'
        return this._http.get(actionURL, options)
            .map((response: Response) => response.json())
    }*/

    getRequest(serv) {
        this.serverService.getCapabilities(serv, this.options)
            .subscribe((response: string) =>
                this.parseResponse(response)
            );
    }

    parseResponse(res: string) {
        let layerArray: Array<string> = []
        let nameArray: Array<string> = []
        let formatArray: Array<string> = []

        layerArray = res.split('<Layer')
        layerArray.shift()
        layerArray.shift()

        for (let i of layerArray) {
            nameArray.push(i.substr(i.indexOf('<Name>') + 6, (i.indexOf('</Name>') - (i.indexOf('<Name>') + 6))))
            formatArray.push(i.substr(i.indexOf('<Format>') + 8, (i.indexOf('</Format>') - (i.indexOf('<Format>') + 8))))
        }

        console.log(nameArray)
        console.log(formatArray)
        
        
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
