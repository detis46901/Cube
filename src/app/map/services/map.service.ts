import {Injectable} from "@angular/core";
//import {Location} from "../core/location.class";
import {Map} from "leaflet";
import {Http, Response } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class MapService {
    public map: Map;
    public baseMaps: any;
    public overlays: any;
    public jsonlayer: any;
  
    constructor(private http:Http) {
        this.baseMaps = {
            OpenStreetMap: L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
            }),
            Esri: L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            }),
            CartoDB: L.tileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            }),
            Mapbox: L.tileLayer("https://api.mapbox.com/styles/v1/careystranahan/cijekqitl00d496lusw340mz3/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2FyZXlzdHJhbmFoYW4iLCJhIjoiY2lobDZkaDNmMDZreXUyajd4OW85MG4yZCJ9.KWMtpJfoSPadPLeydp5W8g", {
                attribution: 'From Mapbox and the City of Kokomo'
            })
        };
        this.overlays = {
            Geoserver: L.tileLayer("http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/wfs", {
                layers: 'Kokomo:Pipes',
                format: 'image/png',
                transparent: true,
                outputFormat: 'application/json'
            })
        };

    }

    disableMouseEvent(elementId: string) {
        let element = <HTMLElement>document.getElementById(elementId);

        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);
        
    };

        public openjson (URL) {
        return this.http.get(URL)
            .map((response: Response) => <any>response.json())
            .subscribe(data => console.log(data))
        }
}
