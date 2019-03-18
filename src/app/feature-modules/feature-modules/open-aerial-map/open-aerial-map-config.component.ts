import { Component, Input, OnInit } from '@angular/core';
import { OpenAerialMapService } from './open-aerial-map.service'
@Component({
    selector: 'open-aerial-map-config',
    templateUrl: './open-aerial-map-config.component.html',
    providers: [OpenAerialMapService],
    styleUrls: ['./open-aerial-map-config.component.scss']
})

export class OpenAerialMapConfigComponent implements OnInit {
    @Input() instanceID;
    private token: string;


    constructor(public openAerialMapService: OpenAerialMapService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    ngOnInit() {
       
    }


}