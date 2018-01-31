import { Component, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import { MapService } from './services/map.service';
import { MapConfig } from './models/map.model'
import { WFSService } from './services/wfs.service';
import { Location } from './core/location.class';
import { geoJSONService } from './services/geoJSON.service'
import { NavigatorComponent } from './navigator/navigator.component';
import { PMMarkerComponent } from './marker/PMmarker.component';
import { LayerPermissionService } from '../../_services/_layerPermission.service';
import { LayerService } from '../../_services/_layer.service';
import { UserPageService } from '../../_services/_userPage.service';
import { MyCubeService } from './services/mycube.service'
import { ServerService } from '../../_services/_server.service';
import { LayerPermission, Layer, UserPageLayer, MyCubeField, MyCubeConfig } from '../../_models/layer.model';
import { UserPage } from '../../_models/user.model';
import { UserPageLayerService } from '../../_services/_userPageLayer.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MessageService } from '../../_services/message.service'
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
    private mapConfig = new MapConfig;
    private token: string;
    private userID: number;
    private headers: Headers;
    private userPageLayers: Array<UserPageLayer> = [];
    private userPages: UserPage[];
    private activePages = new Array<UserPage>();
    private defaultPage: UserPage;
    private currPage: any = ''; //Could be "none"
    private noLayers: boolean;
    
    constructor(private geojsonservice: geoJSONService, private mapService: MapService, private wfsService: WFSService, private layerPermissionService: LayerPermissionService, private layerService: LayerService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private myCubeService: MyCubeService, private serverService: ServerService, private dialog: MatDialog, private messageService:MessageService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    // After view init the map target can be set!
    ngAfterViewInit() {
        //mapConfig.map.setTarget(this.mapElement.nativeElement.id)
    }
    
    //Angular component initialization
    ngOnInit() {
        this.mapConfig.userID = this.userID
         this.getDefaultPage()
         .then(() => this.mapService.initMap(this.mapConfig)
            .then((mapConfig) => {
                this.mapConfig = mapConfig  //Not sure if this is necessary.  Just in case.
                console.log("setting Target")
                mapConfig.map.setTarget(this.mapElement.nativeElement.id)  //This is supposed to be run in ngAfterViewInit(), but it's assumed that will have already happened.
            })    
         )}

    getDefaultPage(): Promise<any> {
        console.log("Getting default Page")   
        let promise = new Promise ((resolve, reject) => { 
        this.userPageService
            .GetActiveByUserID(this.userID)
            .subscribe((data: UserPage[]) => {
                this.mapConfig.name = "Current"
                this.mapConfig.userpages = data
                let index = this.mapConfig.userpages.findIndex(x => x.default == true)
                this.mapConfig.defaultpage = this.mapConfig.userpages[index]
                this.mapConfig.currentpage = this.mapConfig.userpages[index]
                this.currPage = this.mapConfig.userpages[index].page
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
            this.mapConfig.currentLayerName = null
        }
        this.mapService.loadLayers(this.mapConfig, false).then(() => {  
            this.mapConfig.currentLayerName = null
            this.mapConfig.editmode = false
            this.noLayers = true;
        })
    }
}