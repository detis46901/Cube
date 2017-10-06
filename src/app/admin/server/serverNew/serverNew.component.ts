import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../../_services/_server.service';
import { Server } from '../../../../_models/server.model';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
    selector: 'server-new',
    templateUrl: './serverNew.component.html',
    styleUrls: ['./serverNew.component.scss'],
    providers: [ServerService]
})

export class ServerNewComponent implements OnInit {
    private server = new Server;
    private newserver = new Server;

    constructor(private dialog: MdDialog, private serverService: ServerService) {}

    ngOnInit() {
        this.newserver.serverName = '';
        this.newserver.serverType = '';
        this.newserver.serverURL = '';
    }

    private addServer(): void {
        this.serverService
            .Add(this.newserver)
            .subscribe(result => {
                this.dialog.closeAll();
            });
    }
}
