import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ServerService } from '../../../_services/server.service'
import { Server } from '../../../_models/server.model'

@Component({
  selector: 'servernew',
  templateUrl: './servernew.component.html',
  styleUrls: ['./servernew.component.scss'],
  providers: [ServerService, NgbModal, NgbActiveModal]
})

export class ServerNewComponent implements OnInit {

    public server = new Server;
    public newserver = new Server;

    constructor(private modalService: NgbModal, private activeModal: NgbActiveModal, private serverService: ServerService) {}

    ngOnInit() {
        // this.newserver.serverName = ''
        // this.newserver.serverType = ''
        // this.newserver.serverURL = ''
    }

    addServer() {
        //this.server;

        this.serverService
            .Add(this.server)
            .subscribe(result => {
                this.activeModal.close('Next click');
            })      
    }

}
