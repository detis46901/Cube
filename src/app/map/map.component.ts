import { Component, ViewChild, AfterViewInit, ElementRef, Input } from '@angular/core';
import { MapService } from './services/map.service';
import { MapConfig } from './models/map.model';
import { WMSService } from './services/wms.service';
import { geoJSONService } from './services/geoJSON.service'
import { LayerPermissionService } from '../../_services/_layerPermission.service';
import { LayerService } from '../../_services/_layer.service';
import { UserPageService } from '../../_services/_userPage.service';
import { MyCubeService } from './services/mycube.service'
import { ServerService } from '../../_services/_server.service';
import { GroupMemberService } from '../../_services/_groupMember.service';
import { GroupService } from '../../_services/_group.service';
import { LayerPermission, Layer, UserPageLayer, MyCubeField, MyCubeConfig, MyCubeComment } from '../../_models/layer.model';
import { UserPage } from '../../_models/user.model';
import { UserPageLayerService } from '../../_services/_userPageLayer.service';
import { Observable } from 'rxjs/Observable';
import { PageConfigComponent2 } from '../admin2/user/pageconfig/pageconfig.component';
import { MatDialog } from '@angular/material';
import { Clipboard } from 'ts-clipboard';
import { Configuration } from '../../_api/api.constants';
import { MatSnackBar } from '@angular/material';
import * as ol from 'openlayers';
import { GeocodingService } from './services/geocoding.service'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MapConfigService } from './../../_services/mapConfig.service'
import { environment } from 'environments/environment'

@Component({
    moduleId: module.id,
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: [ServerService, geoJSONService, GroupService, GroupMemberService, MapConfigService]
})

export class MapComponent {
    // This is necessary to access the html element to set the map target (after view init)!
    @ViewChild("mapElement") mapElement: ElementRef;
    @ViewChild("layers") layers: ElementRef;
    @Input() id:string
    layerCtrl = new FormControl();
    filteredPermissions: Observable<LayerPermission[]>;
    public showNewLayer: boolean = false
    public mapConfig = new MapConfig;
    public token: string;
    public userID: number;
    public public: boolean = false;
    public headers: Headers;
    public measureShow: boolean = false;
    public userPageLayers: Array<UserPageLayer> = [];
    public userPages: UserPage[];
    public activePages = new Array<UserPage>();
    public defaultPage: UserPage;
    public currPage: any = ''; //Could be "none"
    //public noLayers: boolean;
    public interval: any;
    public toolbar: any;
    public message: any;
    public myCubeData: MyCubeField;
    public myCubeComments: MyCubeComment[]
    public disableCurrent: Boolean //used to make sure that a layer can't be set as current until it's ready



    constructor(
        public snackBar: MatSnackBar, private configuration: Configuration,
        private geojsonservice: geoJSONService, public mapService: MapService, private wfsService: WMSService,
        private layerPermissionService: LayerPermissionService, private layerService: LayerService,
        private userPageService: UserPageService, private userPageLayerService: UserPageLayerService,
        private myCubeService: MyCubeService, private serverService: ServerService, private dialog: MatDialog,
        private groupMemberService: GroupMemberService,
        private groupService: GroupService,
        private geocodingService: GeocodingService,
        private mapConfigService: MapConfigService,
    ) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userID;
        this.public = currentUser && currentUser.public;
        this.mapConfig.layerpermission = []
        this.filteredPermissions = this.layerCtrl.valueChanges
            .pipe(
                startWith(''),
                map(value => typeof value === 'string' ? value : value.layer.layerName),
                map(layer => layer ? this._filterPermissions(layer) : this.mapConfig.layerpermission.slice())
            );
    }

    // After view init the map target can be set!
    ngAfterViewInit() {
        //mapConfig.map.setTarget(this.mapElement.nativeElement.id)
        //this.refreshLayers()

    }

    ngOnDestroy() {
        this.mapService.stopInterval()
        ol.Observable.unByKey(this.mapService.modkey)
        //need to run stop interval on all the userpagelayers
    }

    //Angular component initialization
    ngOnInit() {
        this.getMapConfig(this.id)
    }

    private getMapConfig(id) {
        if (id) {
            this.mapConfig.userID = id
            console.log(this.token)
        }
        else {
            this.mapConfig.userID = this.userID;
        }
        this.mapConfigService.GetSingle(this.mapConfig)
            .subscribe((x) => {
                this.mapConfig = x
                this.currPage = this.mapConfig.currentpage.page
                this.mapConfig.selectedFeatures = new ol.Collection<ol.Feature>() //for some reason, this is necessary
                this.mapConfig.selectedFeatures.push(this.mapConfig.selectedFeature)
                this.mapConfig.layers = [];
                let osm_layer: any
                if (environment.MapBoxBaseMapUrl != '') {
                    osm_layer = new ol.layer.Tile({
                        source: new ol.source.XYZ({
                            url: environment.MapBoxBaseMapUrl
                        })
                    });
                }
                else {
                    osm_layer = new ol.layer.Tile({
                    source: new ol.source.OSM({ cacheSize: environment.cacheSize })
                });
                }
                osm_layer.setVisible(true);
                this.mapConfig.sources.push(new ol.source.OSM({ cacheSize: environment.cacheSize }));
                this.mapConfig.layers.push(osm_layer);

                if (this.mapConfig.userpagelayers.length == 0) {
                    this.mapConfig.currentLayer = new UserPageLayer;
                    this.mapConfig.currentLayerName = "";
                }
                this.mapConfig.userpagelayers.forEach((userpagelayer) => {
                    let j = this.mapConfig.layerpermission.findIndex((x) => x.layerID == userpagelayer.layerID);
                    if (j >= 0) {
                        userpagelayer.layerPermissions = this.mapConfig.layerpermission[j];
                        //need to make sure the maximum permissions get provided.  probably need to use foreach instead of findIndex  It uses the first one instead of the most liberal.
                    }
                    else {
                        //if there isn't an entry for the layer, it allows the viewing, but not anything else.  This is necessary because I'm not adding permissions to layers required by a module.
                        //The module should define the layer permissions
                        userpagelayer.layerPermissions = new LayerPermission
                        userpagelayer.layerPermissions.edit = false
                    }
                })
                this.mapConfig.userpagelayers.forEach((userpagelayer) => {
                    let j = this.mapConfig.modulepermission.findIndex((x) => x.moduleInstanceID == userpagelayer.userPageInstanceID);
                    if (j >= 0) {
                        userpagelayer.modulePermissions = this.mapConfig.modulepermission[j];
                        //need to make sure the maximum permissions get provided.  probably need to use foreach instead of findIndex  It uses the first one instead of the most liberal.
                    }
                })
                this.mapService.loadLayers(this.mapConfig, true).then(() => {
                    this.mapConfig.view = new ol.View({
                        projection: 'EPSG:3857',
                        center: ol.proj.transform([environment.centerLong, environment.centerLat], 'EPSG:4326', 'EPSG:3857'),
                        zoom: environment.centerZoom,
                        enableRotation: false
                    })
                    this.mapConfig.map = new ol.Map({
                        layers: this.mapConfig.layers,
                        view: this.mapConfig.view,
                        controls: ol.control.defaults({
                            attribution: false,
                            zoom: null
                        })
                    });
                    let ptkey = this.mapConfig.map.on('pointermove', (evt: any) => {
                        if (this.mapConfig.map.hasFeatureAtPixel(evt.pixel)) {
                            this.mapConfig.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
                                let index = this.mapConfig.userpagelayers.findIndex(z => z.olLayer == layer);
                                if (index > -1) {
                                    this.mapConfig.mouseoverLayer = this.mapConfig.userpagelayers[index]
                                    if (this.mapConfig.mouseoverLayer.olLayer == this.mapConfig.currentLayer.olLayer) {
                                        this.mapConfig.map.getTargetElement().style.cursor = this.mapConfig.map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';
                                    }
                                }
                            })
                        }
                        else {
                            this.mapConfig.mouseoverLayer = null;
                            this.mapConfig.map.getTargetElement().style.cursor = '';
                        }
                    }, { hitTolerance: 20 })
                    let mkey = this.mapConfig.map.on('pointerdrag', (evt: any) => {
                        this.geocodingService.centerMapToggle = false
                    })
                    this.mapConfig.map.setTarget(this.mapElement.nativeElement.id)  //This is supposed to be run in ngAfterViewInit(), but it's assumed that will have already happened.
                    this.toolbar = "Layers"
                    this.mapConfig.modulesShow = true
                    this.geocodingService.trackMe(this.mapConfig)
                    //this.setDefaultPageLayer()  At some point, the default layer needs to be set current
                    this.mapService.mapConfig = this.mapConfig
                })
            }
            )
    }

    private _filterPermissions(value: string): LayerPermission[] {
        const filterValue = value.toLowerCase();
        return this.mapConfig.layerpermission.filter(layerPermission => layerPermission.layer.layerName.toLowerCase().includes(filterValue));
    }

    public displayFn(layerPermission?: LayerPermission): string | undefined {
        return layerPermission ? layerPermission.layer.layerName : undefined;
    }

    public addLayer(): void {
        console.log(this.layerCtrl.value)
        let LP = new LayerPermission
        LP = this.mapConfig.layerpermission.find(x => x == this.layerCtrl.value)
        console.log(LP)
        let UPL = new UserPageLayer
        UPL.defaultON = true
        UPL.userID = this.userID
        UPL.layer = LP.layer
        UPL.layerID = LP.layer.ID
        UPL.layerPermissions = LP
        UPL.style = UPL.layer.defaultStyle
        this.mapConfig.userpagelayers.push(UPL)
        this.mapService.loadLayers(this.mapConfig, false, true)
        this.showNewLayer = false
        this.layerCtrl.setValue('')
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
                    //this.noLayers = true;
                    this.disableCurrent = false
                })
            })
        //this.noLayers = true;
        this.toolbar = "Layers"
    }

    public setToolbar(bar: string) {
        this.toolbar = bar
    }

    public openPageConfig(pageID: number, userID: number, name: string): void {
        let dialogRef = this.dialog.open(PageConfigComponent2);
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

    public addUserPageLayer(UPL: UserPageLayer) {
        let newUPL = new UserPageLayer
        newUPL.userPageID = this.mapConfig.currentpage.ID
        newUPL.userID = this.userID;
        newUPL.defaultON = UPL.layerShown;
        newUPL.style = UPL.layer.defaultStyle
        newUPL.serverID = UPL.serverID
        newUPL.userID = UPL.userID
        newUPL.layerID = UPL.layer.ID
        console.log(UPL)
        console.log(newUPL)
        this.userPageLayerService
            .Add(newUPL)
            .subscribe((result: UserPageLayer) => {
                console.log(result)
                UPL.ID = result.ID
            });
    }

    public deleteUserPageLayer(userPageLayer: UserPageLayer): void {
        if (userPageLayer.layerShown) { this.mapService.toggleLayers(userPageLayer) }
        this.userPageLayerService
            .Delete(userPageLayer.ID)
            .subscribe((res) => {
                this.mapConfig.userpagelayers.splice(this.mapConfig.userpagelayers.findIndex((x) => x == userPageLayer), 1)
            });
    }

    private cleanPage(): void {
        // The tempUPL is set up so that the expansion panel can immediately get cleared while the page is cleaning.
        this.disableCurrent = true
        let tempUPL:UserPageLayer[]
        tempUPL = this.mapConfig.userpagelayers
        this.mapConfig.userpagelayers = []
        tempUPL.forEach((x) => {
            this.mapConfig.map.removeLayer(x.olLayer)
            this.mapConfig.currentLayerName = "";
            this.mapConfig.featureList = []
            if (x.layer.layerType == "MyCube") {
                clearInterval(x.updateInterval)
                x.source.clear(true)
            }

        })
        this.mapConfig.editmode = false
        this.mapConfig.filterOn = false;
        this.mapConfig.filterShow = false;
        this.mapConfig.styleShow = false
        this.myCubeService.clearMyCubeData();
        this.myCubeService.clearWMS();

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
    dropLayer(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.mapService.mapConfig.userpagelayers, event.previousIndex, event.currentIndex);
        console.log(event)
        console.log(this.mapService.mapConfig.userpagelayers)
        let i: number = 0
        this.mapService.mapConfig.userpagelayers.forEach((x) => {
            x.layerOrder = i

            i++
        })
        this.mapService.mapConfig.userpagelayers.forEach((x) => {
            console.log(x)
            let UPLUpdate = new UserPageLayer
            UPLUpdate.ID = x.ID
            UPLUpdate.layerOrder = x.layerOrder
            this.userPageLayerService.Update(UPLUpdate).subscribe();
        })
    }
    dropPage(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.mapService.mapConfig.userpages, event.previousIndex, event.currentIndex);
        let i: number = 0
        this.mapService.mapConfig.userpages.forEach((x) => {
            x.pageOrder = i

            i++
        })
        this.mapService.mapConfig.userpages.forEach((x) => {
            let pageUpdate = new UserPage
            pageUpdate.ID = x.ID
            pageUpdate.page = x.page
            pageUpdate.pageOrder = x.pageOrder
            this.userPageService.Update(pageUpdate).subscribe((data) => {
            });
        })
    }
}