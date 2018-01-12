import { Component, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import { MapService } from './services/map.service';
import { MapConfig } from './models/map.model'
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
import { MessageService } from '../../_services/message.service'
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png';

import { PageConfigComponent } from '../admin/user/pageConfig/pageConfig.component';
import { MatDialog } from '@angular/material';

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
    private mapConfig = new MapConfig;
    private token: string;
    private userID: number;
    private headers: Headers;
    private userPageLayers: Array<UserPageLayer> = [];
    private activePageLayers = new Array<UserPageLayer>();
    private userPages: UserPage[];
    private activePages = new Array<UserPage>();
    private server: Server;
    private servers: Array<Server>;
    private perm: LayerPermission;
    private perms: LayerPermission[];

    private defaultPage: UserPage;
    private currPage: any = ''; //Could be "none"
    private noLayers: boolean;
    
    constructor(private _http: Http, private geojsonservice: geoJSONService, private mapService: MapService, private wfsService: WFSService, private geoCoder: GeocodingService, private layerPermissionService: LayerPermissionService, private layerAdminService: LayerAdminService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private http: Http, private sideNavService: SideNavService, private myCubeService: MyCubeService, private serverService: ServerService, private dialog: MatDialog, private messageService:MessageService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        
    }

    // After view init the map target can be set!
    ngAfterViewInit() {
        //mapConfig.map.setTarget(this.mapElement.nativeElement.id)
    }
    
    //Angular component initialization
    ngOnInit() {
         this.getDefaultPage()
         .then(() => this.mapService.initMap(this.mapConfig)
            .then((mapConfig) => {
                this.mapConfig = mapConfig  //Not sure if this is necessary.  Just in case.
                console.log("setting Target")
                mapConfig.map.setTarget(this.mapElement.nativeElement.id)  //This is supposed to be run in ngAfterViewInit(), but it's assumed that will have already happened.
            })    
         )}

    getDefaultPage(): Promise<any> {   
        let promise = new Promise ((resolve, reject) => {
        this.userPageService
            .GetActiveByUserID(this.userID)
            .subscribe((data: UserPage[]) => {
                this.mapConfig.name = "Current"
                console.log(data)
                this.mapConfig.userpages = data
                for (let userpage of this.mapConfig.userpages) {
                    if (userpage.default === true) {
                        this.mapConfig.defaultpage = userpage;
                        this.mapConfig.currentpage = userpage;
                        this.currPage = userpage.page;
                    }
                }
                resolve()
            });
         
        })
        return promise
    }

    //Gets userPageLayers by page.ID, changes pages
    private setPage(page: UserPage): void {
        this.mapConfig.currentpage = page
        this.currPage = page.page;
        this.mapService.getUserPageLayers(this.mapConfig)
        .then(() => this.mapService.getLayerPerms())
        .then(() => {this.cleanPage();})
        //this.mapService.getUserPageLayers(page);
        this.noLayers = true;
    }

    private openPageConfig(pageID: number, userID: number, name: string): void {
        let dialogRef = this.dialog.open(PageConfigComponent);
        dialogRef.componentInstance.pageID = pageID;
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.pageName = name;

        dialogRef.afterClosed()
        .subscribe((response: UserPageLayer[]) => {
            if(response != null) {
                for(let i of response) {
                    this.userPageLayerService.Update(i).subscribe();
                }
            }
        });
    }
        

    private cleanPage(): void {
        console.log("layer=" + this.mapConfig.layers)
        for (let k=1; k< this.mapConfig.layers.length; k) {
            console.log(k + " of " + this.mapConfig.layers.length)
            this.mapConfig.map.removeLayer(this.mapConfig.layers[k])
            this.mapConfig.layers.splice(k,1)
            console.log(this.mapConfig.layers)
        }
        this.mapService.loadLayers(this.mapConfig, false).then(() => {  
            this.mapConfig.currLayerName = ""
            this.noLayers = true;
        })
    }

    private clearMyCubeData(): void {
        this.myCubeService.clearMyCubeData();
    }
}