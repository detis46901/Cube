import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../../_services/_server.service'
import { Server } from '../../../../_models/server.model'
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
  selector: 'server-new',
  templateUrl: './serverNew.component.html',
  styleUrls: ['./serverNew.component.scss'],
  providers: [ServerService]
})

export class ServerNewComponent implements OnInit {

    public server = new Server;
    public newserver = new Server;

    constructor(public dialog: MdDialog, private serverService: ServerService) {}

    ngOnInit() {
        this.newserver.serverName = ''
        this.newserver.serverType = ''
        this.newserver.serverURL = ''
    }

    addServer() {
        console.log(this.newserver)
        this.serverService
            .Add(this.newserver)
            .subscribe(result => {
                
                this.dialog.closeAll();
            })      
    }
}
