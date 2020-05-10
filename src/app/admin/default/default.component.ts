import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscriber } from 'rxjs';
import { Layer } from '../../../_models/layer.model';
import { LayerService } from '../../../_services/_layer.service';

@Component({
    selector: 'default',
    templateUrl: './default.component.html',
    providers: [LayerService],
    styleUrls: ['./default.component.scss']
})

export class DefaultsComponent implements OnInit {
    private layers: Observable<Layer[]>;

    constructor(private layerService: LayerService) { }
    ngOnInit() {
        this.layers = this.layerService.GetAll()
    }

    time = new Observable<string>((observer: Subscriber<string>) => {
        setInterval(() => observer.next(new Date().toString()), 1000);
    });
}
