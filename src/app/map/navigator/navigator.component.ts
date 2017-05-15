import {Component} from "@angular/core";
import {GeocodingService} from "../services/geocoding.service";
import {MapService} from "../services/map.service";
import {Location} from "../core/location.class";
import {Map} from "leaflet";

@Component({
    selector: "navigator",
    templateUrl: "./navigator.component.html",
    styleUrls: ['./navigator.component.less', '../../styles/main.less'],
    providers: []
})
export class NavigatorComponent {
    address: string;

    private map: Map;

    constructor(private geocoder: GeocodingService, private mapService: MapService) {
        this.address = "";
    }

    ngOnInit() {
        this.mapService.disableMouseEvent("goto");
        this.mapService.disableMouseEvent("place-input");
        this.map = this.mapService.map;
    }

    goto() {
        if (!this.address) { return; }

        this.geocoder.geocode(this.address)
        .subscribe(location => {
            console.log(location)
            this.map.fitBounds(location.viewBounds, {}); //Error thrown here, goto text field is nonfunctional
            this.address = location.address;
        }, error => console.error(error));
        //this.address = "Chocolate";
    }
}
