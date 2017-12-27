import { Component, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import { MapService } from './services/map.service';
import { WFSService } from './services/wfs.service';
import { Location } from './core/location.class';
import { GeocodingService } from './services/geocoding.service';
import { geoJSONService } from './services/geoJSON.service'
import { NavigatorComponent } from './navigator/navigator.component';
import { PMMarkerComponent } from './marker/PMmarker.component';
import { LayerPermissionService } from '../../_services/_layerPermission.service';
import { LayerAdminService } from '../../_services/_layerAdmin.service';
import { UserPageService } from '../../_services/_userPage.service';
import { SideNavService } from '../../_services/sidenav.service';
import { MyCubeService } from './services/mycube.service'
import { ServerService } from '../../_services/_server.service';
import { LayerPermission, LayerAdmin, UserPageLayer, MyCubeField, MyCubeConfig } from '../../_models/layer.model';
import { Server } from '../../_models/server.model';
import { UserPage } from '../../_models/user.model';
import { UserPageLayerService } from '../../_services/_userPageLayer.service';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { LeafletDirective, LeafletDirectiveWrapper } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawDirective, LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';
declare var ol: any;

@Component({
    moduleId: module.id,
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: [ServerService, geoJSONService]
})

export class MapComponent {
    // This is necessary to access the html element to set the map target (after view init)!
    @ViewChild("mapElement") mapElement: ElementRef;
    public map: any;
    private token: string;
    private userID: number;
    private headers: Headers;
    private userPageLayers: Array<UserPageLayer> = [];
    private activePageLayers = new Array<UserPageLayer>();
    private currLayer: UserPageLayer;
    private userPages: UserPage[];
    private activePages = new Array<UserPage>();
    private server: Server;
    private servers: Array<Server>;
    private perm: LayerPermission;
    private perms: LayerPermission[];

    private defaultPage: UserPage;
    private currPage: any = ''; //Could be "none"
    private currLayerName: string = ''; //Could say something besides nothing
    private noLayers: boolean;
    private shown: boolean = false
    
    constructor(private _http: Http, private geojsonservice: geoJSONService, private mapService: MapService, private wfsService: WFSService, private geoCoder: GeocodingService, private layerPermissionService: LayerPermissionService, private layerAdminService: LayerAdminService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private http: Http, private sideNavService: SideNavService, private myCubeService: MyCubeService, private serverService: ServerService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid;
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        
    }

    // After view init the map target can be set!
    ngAfterViewInit() {
        this.map = this.mapService.initMap()
        this.map.setTarget(this.mapElement.nativeElement.id);
        
    }
    
    //Angular component initialization
    ngOnInit() {
        this.getPage();
 
    
    }

    private getPage(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data: UserPage[]) => {
                console.log(data);
                this.userPages = data;
                for(let active of data) {
                    if(active.active) {
                        this.activePages.push()
                    }
                }
                this.getDefaultPage();
            });
    }

    private getDefaultPage(): void {
        for (let userpage of this.userPages) {
            //console.log('Userpage = ' + userpage.page);
            //console.log('Default = ' + userpage.default);
            if (userpage.default === true) {
                this.defaultPage = userpage;
            }
        }
        //console.log(this.defaultPage);
        this.currPage = this.defaultPage.page;
        this.mapService.getUserPageLayers(this.defaultPage);
    }

    //This method sets flags for use with the "Layers in Map Component" map.component.html control in order to determine
    //Which layers are currently active, so they can be turned on or off at will with the corresponding dropdown selection.
    private setFlags(): void {
        for (let x of this.userPageLayers) {
            x.layerShown = x.layerON;
        }
    }

    private getUserPageItems(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data: UserPage[]) => {
                this.userPages = data;
            });
    }
        
    //Gets userPageLayers by page.ID, changes pages
    private setUserPageLayers(page: UserPage): void {
        this.currPage = page.page;
        this.cleanPage();
        this.mapService.getUserPageLayers(page);
        this.currLayerName = 'No Active Layer';
        this.noLayers = true;
    }
        
    private cleanPage(): void {
        //console.log('Flags array: ' + this.userPageLayers[0].layerShown);
        this.clearMessage();
        this.setFlags();
        this.mapService.map.eachLayer(function (removelayer) {
            removelayer.remove();
        });
        console.log(this.mapService.baseMaps);
    }

    private sendMessage(message: string): void {
        message = message.split("<body>")[1]
        this.sideNavService.sendMessage(message);
    }

    private clearMessage(): void {
        this.sideNavService.clearMessage();
    }

    private clearMyCubeData(): void {
        this.myCubeService.clearMyCubeData();
    }
}