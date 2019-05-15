import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MapService } from './services/map.service';
import { MapConfig } from './models/map.model';
import { WMSService } from './services/wms.service';
import { Location } from './core/location.class';
import { geoJSONService } from './services/geoJSON.service'
import { LayerPermissionService } from '../../_services/_layerPermission.service';
import { LayerService } from '../../_services/_layer.service';
import { UserPageService } from '../../_services/_userPage.service';
import { MyCubeService } from './services/mycube.service'
import { ServerService } from '../../_services/_server.service';
import { GroupMemberService } from '../../_services/_groupMember.service';
import { GroupService } from '../../_services/_group.service';
import { LayerPermission, Layer, UserPageLayer, MyCubeField, MyCubeConfig, MyCubeComment } from '../../_models/layer.model';
import { UserPage, User } from '../../_models/user.model';
import { Group, GroupMember } from '../../_models/group.model';
import { UserPageLayerService } from '../../_services/_userPageLayer.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { PageConfigComponent } from '../admin/user/pageconfig/pageconfig.component';
import { MatDialog } from '@angular/material';
import { Clipboard } from 'ts-clipboard';
import { Configuration } from '../../_api/api.constants';
import { MatSnackBar } from '@angular/material';
import * as ol from 'openlayers';
import { GeocodingService} from './services/geocoding.service'

//import { Feature } from 'geojson';

@Component({
    moduleId: module.id,
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: [ServerService, geoJSONService, GroupService, GroupMemberService]
})

export class MapComponent {
    // This is necessary to access the html element to set the map target (after view init)!
    @ViewChild("mapElement") mapElement: ElementRef;
    @ViewChild("layers") layers: ElementRef;
    public mapConfig = new MapConfig;
    public token: string;
    public userID: number;
    public headers: Headers;
    public measureShow: boolean = false;
    public userPageLayers: Array<UserPageLayer> = [];
    public userPages: UserPage[];
    public activePages = new Array<UserPage>();
    public defaultPage: UserPage;
    public currPage: any = ''; //Could be "none"
    public noLayers: boolean;
    public interval: any;
    public toolbar: any;
    public message: any;
    public myCubeData: MyCubeField;
    public myCubeComments: MyCubeComment[]



    constructor(
        public snackBar: MatSnackBar, private configuration: Configuration,
        private geojsonservice: geoJSONService, public mapService: MapService, private wfsService: WMSService,
        private layerPermissionService: LayerPermissionService, private layerService: LayerService,
        private userPageService: UserPageService, private userPageLayerService: UserPageLayerService,
        private myCubeService: MyCubeService, private serverService: ServerService, private dialog: MatDialog,
        private groupMemberService: GroupMemberService,
        private groupService: GroupService,
        private geocodingService: GeocodingService
    ) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
    }

    // After view init the map target can be set!
    ngAfterViewInit() {
        //mapConfig.map.setTarget(this.mapElement.nativeElement.id)
        //this.refreshLayers()

    }

    ngOnDestroy() {
        this.mapService.stopInterval()
        //need to run stop interval on all the userpagelayers
    }

    //Angular component initialization
    ngOnInit() {
        this.mapConfig.userID = this.userID;
        this.getDefaultPage()
            .then(() => this.mapService.initMap(this.mapConfig)
                .then((mapConfig) => {
                    let ptkey = this.mapConfig.map.on('pointermove', (evt:any) => {
                        if (mapConfig.map.hasFeatureAtPixel(evt.pixel)) {
                            this.mapConfig.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                                let index = this.mapConfig.userpagelayers.findIndex(z => z.olLayer == layer);
                                if (index > -1) {
                                    this.mapConfig.mouseoverLayer = this.mapConfig.userpagelayers[index]
                                    if (this.mapConfig.mouseoverLayer.olLayer == this.mapConfig.currentLayer.olLayer) {
                                        mapConfig.map.getTargetElement().style.cursor = mapConfig.map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
                                    }
                                }
                            })
                        }
                        else {
                            this.mapConfig.mouseoverLayer = null;
                            mapConfig.map.getTargetElement().style.cursor = '';
                        }
                    }, { hitTolerance: 20 })
                    let mkey = this.mapConfig.map.on('pointerdrag', (evt:any) => {
                        this.geocodingService.isTracking = false
                    })
                    mapConfig.map.setTarget(this.mapElement.nativeElement.id)  //This is supposed to be run in ngAfterViewInit(), but it's assumed that will have already happened.
                    this.toolbar = "Layers"
                    this.mapConfig.modulesShow = true
                    this.geocodingService.trackMe(mapConfig)
                    //this.setDefaultPageLayer()  At some point, the default layer needs to be set current
                })
            )
    }

    getDefaultPage(): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            this.userPageService
                .GetActiveByUserID(this.userID)
                .subscribe((data: UserPage[]) => {
                    this.mapConfig.name = "Current";
                    this.mapConfig.userpages = data;
                    let index = this.mapConfig.userpages.findIndex(x => x.default == true);
                    this.mapConfig.defaultpage = this.mapConfig.userpages[index];
                    this.mapConfig.currentpage = this.mapConfig.userpages[index];
                    this.currPage = this.mapConfig.userpages[index].page;
                    this.mapConfig.selectedFeature = null;
                    resolve();
                });
        })
        return promise;
    }

    //Gets userPageLayers by page.ID, changes pages
    private setPage(page: UserPage): void {
        this.mapConfig.currentpage = page;
        this.mapConfig.currentLayer = new UserPageLayer;
        this.currPage = page.page;
        this.cleanPage()
        this.mapService.getUserPageLayers(this.mapConfig)
            .then(() => this.mapService.getUserPageInstances(this.mapConfig))
            .then(() => this.mapService.getLayerPerms())
            .then(() => {
                this.mapService.loadLayers(this.mapConfig, false).then(() => {
                    this.mapConfig.currentLayerName = "";
                    this.mapConfig.editmode = false;
                    this.noLayers = true;
                })
            })
        this.noLayers = true;
        this.toolbar = "Layers"
    }

    public setToolbar(bar: string) {
        this.toolbar = bar
    }

    public openPageConfig(pageID: number, userID: number, name: string): void {
        let dialogRef = this.dialog.open(PageConfigComponent);
        dialogRef.componentInstance.pageID = pageID;
        dialogRef.componentInstance.userID = userID;
        dialogRef.componentInstance.pageName = name;

        dialogRef.afterClosed()
            .subscribe((response: UserPageLayer[]) => {
                if (response != null) {
                    for (let i of response) {
                        this.userPageLayerService.Update(i).subscribe();
                    }
                }
            });
    }

    private cleanPage(): void {
        this.mapConfig.userpagelayers.forEach((x) => {
            this.mapService.stopInterval()
            this.mapConfig.map.removeLayer(x.olLayer)
            this.mapConfig.currentLayerName = "";
            this.mapConfig.featureList = []
        })
        //this.mapConfig.sources = [];
        this.mapConfig.editmode = false
        this.mapConfig.filterOn = false;
        this.mapConfig.filterShow = false;
        this.mapConfig.styleShow = false
        this.myCubeService.clearMyCubeData();
        this.myCubeService.clearWMS();
        //this.mapConfig.sources.push(new ol.source.OSM());

    }

    public copyToClipboard(url: string) {
        Clipboard.copy(this.configuration.serverWithApiUrl + url + '&apikey=' + this.token);
        this.snackBar.open("Copied to the clipboard", "", {
            duration: 2000,
        });
    }

    public copyGSToClipboard(url: string) {
        Clipboard.copy('=IMPORTHTML("' + this.configuration.serverWithApiUrl + url + '&apikey=' + this.token + '", "table", 1)');
        this.snackBar.open("Copied to the clipboard", "", {
            duration: 2000,
        });
    }

    public setDefaultPage(userpage: UserPage) {
        this.mapConfig.defaultpage.default = false;
        this.userPageService
            .Update(this.mapConfig.defaultpage)
            .subscribe();

        userpage.default = true;
        this.userPageService
            .Update(userpage)
            .subscribe((data) => {
                this.mapConfig.defaultpage = userpage;
            })
    }

    public setDefaultPageLayer() {
        this.mapConfig.userpagelayers.forEach((userpagelayer) => {
            if (this.mapConfig.currentpage.defaultLayer == userpagelayer.ID) {
                this.mapService.setCurrentLayer(userpagelayer)
            }
        })
    }
    public canEditPerm(layerID: number) {

    }

    public canDeleteLayer(layerID: number) {

    }
    public isolate(layer: UserPageLayer) {
        this.mapService.isolate(layer)
    }
}