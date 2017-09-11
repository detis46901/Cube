import { ElementRef, Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { MapService } from "./services/map.service";
import { WFSService } from "./services/wfs.service";
import { WFSMarker } from "../../_models/wfs.model";
import { Location } from "./core/location.class";
import { GeocodingService } from "./services/geocoding.service";
import { NavigatorComponent } from "./navigator/navigator.component";
import { MarkerComponent } from "./marker/marker.component";
import { LayerPermissionService } from "../../_services/layerpermission.service"
import { LayerAdminService } from "../../_services/layeradmin.service"
import { UserPageService } from '../../_services/user-page.service'
import { SidenavService } from '../../_services/sidenav.service'
import { ServerService } from '../../_services/server.service'
import { LayerPermission, LayerAdmin, UserPageLayer } from "../../_models/layer.model";
import { Server } from "../../_models/server.model";
import { UserPage } from '../../_models/user-model';
import { UserPageLayerService } from '../../_services/user-page-layer.service'
import { Http, Response, Headers } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { Subscription }   from 'rxjs/Subscription';
import * as L from "leaflet";

@Component({
  selector: 'new-map',
  templateUrl: './new-map.component.html',
  styleUrls: ['./new-map.component.scss'],
  providers: [ServerService]
})

export class NewMapComponent {

    public token: string;
    public userID: number;
    public headers: Headers;
    public popuptx: string = ""

    //Class variables
    public _map: L.Map;

    //GeoJSON testing variables

    public getFeatureData: any;

    //Database information
    public userpagelayers: Array<UserPageLayer> = [];
    public currLayer: UserPageLayer; 
    public userpages: any; 
    public layerList: Array<L.Layer> = [];
    public server: Server;
    public servers: Array<Server>;

    public defaultpage: any; 
    public turnonlayer: L.Layer;
    public overlays: any;
    public currPage: any = "None"
    public currLayerName: string = "No Active Layer"
          
    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    constructor(private _http: Http, private elementRef: ElementRef, private mapService: MapService, private wfsservice: WFSService, private geocoder: GeocodingService, private layerPermissionService: LayerPermissionService, private layerAdminService: LayerAdminService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private http: Http, private sidenavService: SidenavService, private serverService: ServerService ) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        wfsservice.popupText$.subscribe(tx => this.popuptx = tx)
    }
}
