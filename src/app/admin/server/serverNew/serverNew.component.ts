import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../../_services/_server.service';
import { Server } from '../../../../_models/server.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'server-new',
    templateUrl: './serverNew.component.html',
    styleUrls: ['./serverNew.component.scss'],
    providers: [ServerService]
})

export class ServerNewComponent implements OnInit {
    public server = new Server;
    public newserver = new Server;

    constructor(private dialog: MatDialog, private serverService: ServerService) { }

    ngOnInit() {
        this.newserver.serverName = '';
        this.newserver.serverType = '';
        this.newserver.serverURL = '';
    }

    public addServer(): void {
        this.serverService
            .Add(this.newserver)
            .subscribe(result => {
                this.dialog.closeAll();
            });
    }
}
