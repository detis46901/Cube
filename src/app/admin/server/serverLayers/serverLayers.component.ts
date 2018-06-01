import { Component, OnInit, Input} from '@angular/core';
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

    constructor() { }

    ngOnInit() {
    }

    private retrieveLayers(name) {
        // retrieves layers based upon the selected server's type, places them in an array
        // needs to add implementation for services
    }

    private openCreateLayer() {
        // const dialogRef = this.dialog.open(LayerNewComponent, {width: '320px'});
    }
}
