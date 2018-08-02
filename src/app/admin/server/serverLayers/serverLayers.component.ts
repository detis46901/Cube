import { Component, OnInit, Input } from '@angular/core';
import { ServerService } from '../../../../_services/_server.service';
import { Server } from '../../../../_models/server.model';
import { Layer, WMSLayer } from '../../../../_models/layer.model';
import { MatDialog } from '@angular/material';
import { LayerNewComponent } from '../../layer/layerNew/layerNew.component';

@Component({
    selector: 'app-serverLayers',
    templateUrl: './serverLayers.component.html',
    styleUrls: ['./serverLayers.component.css']
})

export class ServerLayersComponent implements OnInit {
    @Input() name;

    constructor(private dialog: MatDialog) { }

    ngOnInit() {
        // this.getRequest();
    }

    // private getLayers(serv: Server): void {
    //     let path: string = '';
    //     this.currServer = serv;
    //     this.clearArrays();
    //     this.displayFolders = true;
    //     this.serverService.getFolders(serv, path, "none", this.options)
    //         .subscribe((result: string) => {
    //             this.parseLayers(result);
    //         });
    // }

    // private parseLayers(response: string): void {
    //     console.log(response['folders'])
    //     let list = JSON.parse(response);
    //     if (list.folders) {
    //         for (let i of list.folders) {
    //             this.folderArray.push(i);
    //         }
    //     }
    //     if (list.services) {
    //         for (let i of list.services) {
    //             this.serviceArray.push(i);
    //         }
    //     }
    //     if (list.layers) {
    //         for (let i of list.layers) {
    //             this.layerArray.push(i);
    //         }
    //     }
    // }

    // private WMSRequest(server: Server, type: string): void {
    //     console.log("WMSRequest " + server.serverURL)
    //     this.path = '/' + server.serverURL;
    //     this.clearArrays();
    //     this.displayFolders = true;
    //     this.serverService.getFolders(server, this.path, type, this.options)
    //         .subscribe((response: string) => {
    //             this.parseLayers(response);
    //         });
    // }

    private getRequest(serv: Server): void {
        let url: string
        switch (serv.serverType) {
            case "Geoserver": {
                // this.getGeoserver(serv)
                break
            }
            case "GeoserverWMTS":
                url = serv.serverURL + '/gwc/service/wmts?request=getcapabilities';
                break
            case "ArcGIS":
                //serv.serverURL = serv.serverURL + '?f=pjson';
                // this.WMSRequest(serv, "Folder")
                break;
        }
    }

    private retrieveLayers(name) {
        // retrieves layers based upon the selected server's type, places them in an array
        // needs to add implementation for services
    }

    private openCreateLayer() {
        const dialogRef = this.dialog.open(LayerNewComponent, { width: '360px' });
    }
}
