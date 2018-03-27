import { Component, OnInit, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Layer } from '../../../../_models/layer.model';
import { LayerService } from '../../../../_services/_layer.service';

@Component({
    selector: 'layer-details',
    templateUrl: './layerDetails.component.html',
    providers: [LayerService],
    styleUrls: ['./layerDetails.component.scss']
})

export class LayerDetailsComponent implements OnInit {
    @Input() ID;
    @Input() name;

    private layer: Layer;
    private style: string;

    constructor(private layerService: LayerService) {
    }

    ngOnInit() {
        this.getLayer(this.ID)
    }

    private getLayer(id) {
        this.layerService
            .GetSingle(id)
            .subscribe((res: Layer) => {
                this.layer = res
                this.style = JSON.stringify(this.layer.defaultStyle)
            })
    }

    private submit(layer) {
        this.layerService
            .Update(layer)
            .subscribe()
    }
}
