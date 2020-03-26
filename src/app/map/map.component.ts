import { Component, ViewChild, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { MapService } from './services/map.service';
import { MapConfig, mapStyles } from './models/map.model';
import { geoJSONService } from './services/geoJSON.service'
import { UserPageService } from '../../_services/_userPage.service';
import { MyCubeService } from './services/mycube.service'
import { ServerService } from '../../_services/_server.service';
import { GroupMemberService } from '../../_services/_groupMember.service';
import { GroupService } from '../../_services/_group.service';
import { LayerPermission, UserPageLayer, MyCubeField, MyCubeComment } from '../../_models/layer.model';
import { UserPage, User } from '../../_models/user.model';
import { UserPageLayerService } from '../../_services/_userPageLayer.service';
import { Observable, of } from 'rxjs';
import { PageConfigComponent2 } from '../admin2/user/pageconfig/pageconfig.component';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from 'ts-clipboard';
import { Configuration } from '../../_api/api.constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import OSM from 'ol/source/OSM';
import { transform } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { GeocodingService } from './services/geocoding.service'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl } from '@angular/forms';
import { map, startWith, switchMap, debounceTime, tap, finalize } from 'rxjs/operators';
import { MapConfigService } from './../../_services/mapConfig.service'
import { environment } from 'environments/environment'
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import Point from 'ol/geom/Point'

@Component({
    moduleId: module.id,
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: [ServerService, geoJSONService, GroupService, GroupMemberService, MapConfigService]
})

export class MapComponent implements OnDestroy, OnInit{
    // This is necessary to access the html element to set the map target (after view init)!
    @ViewChild("mapElement") mapElement: ElementRef;
    @ViewChild("layers") layers: ElementRef;
    @Input() user: User;
    layerCtrl = new FormControl();
    searchCtrl = new FormControl();
    filteredPermissions: Observable<LayerPermission[]>;
    searchResults$: Observable<any>;
    public showNewLayer: boolean = false
    public mapConfig = new MapConfig;
    public token: string;
    public public: boolean = false;
    public headers: Headers;
    public measureShow: boolean = false;
    public userPageLayers: Array<UserPageLayer> = [];
    public userPages: UserPage[];
    public activePages = new Array<UserPage>();
    public defaultPage: UserPage;
    public currPage: any = ''; //Could be "none"
    public interval: any;
    public toolbar: any;
    public message: any;
    public myCubeData: MyCubeField;
    public myCubeComments: MyCubeComment[]
    public disableCurrent: Boolean //used to make sure that a layer can't be set as current until it's ready
    public showSearch: boolean
    public searchresults: any
    public isLoading: boolean

    constructor(
        public snackBar: MatSnackBar,
        private configuration: Configuration,
        public mapService: MapService,
        private userPageService: UserPageService,
        private userPageLayerService: UserPageLayerService,
        private myCubeService: MyCubeService,
        private dialog: MatDialog,
        private geocodingService: GeocodingService,
        private mapConfigService: MapConfigService,
        private mapSetyles: mapStyles
    ) {}

    //Angular component initialization
    ngOnInit() {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        // this.userID = currentUser && currentUser.userID;
        this.public = currentUser && currentUser.public;
        this.mapConfig.layerpermission = []
        this.filteredPermissions = this.layerCtrl.valueChanges
            .pipe(
                startWith(''),
                map(value => typeof value === 'string' ? value : value.layer.layerName),
                map(layer => layer ? this._filterPermissions(layer) : this.mapConfig.layerpermission.slice())
            );
            this.searchResults$ = this.searchCtrl.valueChanges
            .pipe(
              startWith(''),
              debounceTime(300),
              tap(() => this.isLoading = true), //This is supposed to show a spinner but I can't get it to work right now.  Oh, Well...
               switchMap(value => {
                 if (value !== '') {
                  this.isLoading = false
                  this.geocodingService.search(value).subscribe((x) => {
                    this.searchresults = x
                  })
                   return this.geocodingService.search(value) }
                  else {
                    this.isLoading = false
                    return of(null)
                  }
               }
              )
            );
        this.getMapConfig()

    }

    ngOnDestroy() {
    }

    private getMapConfig() { //id is used for public pages.
        this.mapConfig.user = this.user
        this.mapConfigService.GetSingle(this.mapConfig)
            .subscribe((x) => {
                this.mapConfig = x
                this.currPage = this.mapConfig.currentpage.page
                this.mapConfig.selectedFeatures = new Collection<Feature>() //for some reason, this is necessary
                this.mapConfig.selectedFeatures.push(this.mapConfig.selectedFeature)
                this.mapConfig.baseLayers = [];
                let baseLayer: any
                if (environment.MapBoxBaseMapUrl != '') {
                    baseLayer = new TileLayer({
                        source: new XYZ({
                            url: environment.MapBoxBaseMapUrl
                        })
                    });
                }
                else {
                    baseLayer = new TileLayer({
                        source: new OSM({ cacheSize: environment.cacheSize })
                    });
                    baseLayer.setZIndex(-1)
                }
                baseLayer.setVisible(true);
                this.mapConfig.baseLayers.push(baseLayer);

                //sets up so WMS layers can show selected features
                this.mapConfig.selectedFeatureSource = new VectorSource ({  format: new GeoJSON()})
                this.mapConfig.selectedFeatureLayer = new VectorLayer({ source: this.mapConfig.selectedFeatureSource})
                this.mapConfig.selectedFeatureLayer.setZIndex(1000)
                this.mapConfig.baseLayers.push(this.mapConfig.selectedFeatureLayer)

                if (this.mapConfig.userpagelayers.length == 0) {
                    this.mapConfig.currentLayer = new UserPageLayer;
                    this.mapConfig.currentLayerName = "";
                }
                this.mapConfig.userpagelayers.forEach((userpagelayer) => {
                    let j = this.mapConfig.layerpermission.findIndex((x) => x.layerID == userpagelayer.layerID);
                    if (j >= 0) {
                        userpagelayer.layerPermissions = this.mapConfig.layerpermission[j];
                    }
                    else {
                        //if there isn't an entry for the layer, it allows the viewing, but not anything else.  This is necessary because I'm not adding permissions to layers required by a module.
                        //The module should define the layer permissions
                        userpagelayer.layerPermissions = new LayerPermission
                        userpagelayer.layerPermissions.edit = false
                    }
                    let k = this.mapConfig.modulepermission.findIndex((x) => x.moduleInstanceID == userpagelayer.userPageInstanceID);
                    if (k >= 0) {
                        userpagelayer.modulePermissions = this.mapConfig.modulepermission[j];
                    }
                })
                this.mapService.loadLayers(this.mapConfig, true).then(() => {
                    this.mapConfig.view = new View({
                        projection: 'EPSG:3857',
                        center: transform([environment.centerLong, environment.centerLat], 'EPSG:4326', 'EPSG:3857'),
                        zoom: environment.centerZoom,
                        enableRotation: false
                    })
                    this.mapConfig.map = new Map({
                        layers: this.mapConfig.baseLayers,
                        view: this.mapConfig.view,
                        controls: defaultControls({
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
                    console.log('setting click event')
                    this.mapConfig.evkey = this.mapConfig.map.on('click', (e: any) => {
                        this.mapService.mapClickEvent(e)
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
        let LP = new LayerPermission
        LP = this.mapConfig.layerpermission.find(x => x == this.layerCtrl.value)
        let UPL = new UserPageLayer
        UPL.defaultON = true
        UPL.userID = this.user.ID
        UPL.layer = LP.layer
        UPL.layerID = LP.layer.ID
        UPL.layerPermissions = LP
        UPL.style = UPL.layer.defaultStyle
        this.mapConfig.userpagelayers.push(UPL)
        this.mapService.loadLayers(this.mapConfig, false, true)
        this.showNewLayer = false
        this.layerCtrl.setValue('')
    }

    public addSearch(searchResults): void {
      if (searchResults.length) {return} //If there aren't any results, don't do anything.
      if (this.mapConfig.searchResultSource) {this.mapConfig.searchResultSource.clear()}
      this.mapConfig.view.animate({ zoom: 18, center: transform([+searchResults.lon, +searchResults.lat], 'EPSG:4326', 'EPSG:3857') })
      this.mapConfig.searchResult = new Feature({
        geometry: new Point(transform([+searchResults.lon, +searchResults.lat], 'EPSG:4326', 'EPSG:3857'))
      })
      this.mapConfig.searchResultSource = new VectorSource()
      this.mapConfig.searchResultSource.addFeature(this.mapConfig.searchResult)
      this.mapConfig.searchResultLayer = new VectorLayer({ source: this.mapConfig.searchResultSource})
      this.mapConfig.searchResultLayer.setStyle(this.mapSetyles.selected)
      this.mapConfig.selectedFeatureLayer.setZIndex(1000)
      this.mapConfig.map.addLayer(this.mapConfig.searchResultLayer)
      this.geocodingService.sendSearchResults(searchResults)
    }

    public setSearch() {
      this.showSearch = !this.showSearch
      if (!this.showSearch) {
        if (this.mapConfig.searchResultSource){this.mapConfig.searchResultSource.clear()}
        this.searchCtrl.setValue(null)
        this.geocodingService.sendSearchResults(null)
      }
    }

    public searchDisplay(results) {
      return results && results.display_name ? results.display_name : '';
    }

    getDefaultPage(): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            this.userPageService
                .GetActiveByUserID(this.user.ID)
                .subscribe((data: UserPage[]) => {
                    this.mapConfig.name = "Current";
                    this.mapConfig.userpages = data;
                    let index = this.mapConfig.userpages.findIndex(x => x.default == true);
                    console.log(index)
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
    public setPage(page: UserPage): void {
        this.mapConfig.currentpage = page;
        this.mapConfig.currentLayer = new UserPageLayer;
        this.currPage = page.page;
        this.cleanPage()
        this.mapService.getUserPageLayers()
            .then(() => this.mapService.getUserPageInstances())
            .then(() => this.mapService.getLayerPerms())
            .then(() => {
                this.mapService.loadLayers(this.mapConfig, false).then(() => {
                    this.mapConfig.currentLayerName = "";
                    this.mapConfig.editmode = false;
                    this.disableCurrent = false
                })
            })
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
        console.log(UPL)
        let newUPL = new UserPageLayer
        newUPL.userPageID = this.mapConfig.currentpage.ID
        newUPL.userID = this.user.ID;
        newUPL.defaultON = UPL.layerShown;
        newUPL.style = UPL.style
        newUPL.serverID = UPL.serverID
        newUPL.userID = UPL.userID
        newUPL.layerID = UPL.layer.ID
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
        let tempUPL: UserPageLayer[]
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
        this.mapConfig.showDeleteButton = false
        this.mapConfig.showFilterButton = false
        this.mapConfig.showStyleButton = false
        this.myCubeService.clearMyCubeData();
        this.myCubeService.clearWMS();
        this.mapConfig.selectedFeatureSource.clear()

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

    public isolate(layer: UserPageLayer) {
        this.mapService.isolate(layer)
    }

    public dropLayer(event: CdkDragDrop<string[]>) {
      console.log('dropLater')
      console.log(event)
        moveItemInArray(this.mapService.mapConfig.userpagelayers, event.previousIndex, event.currentIndex);
        let i: number = 0
        this.mapService.mapConfig.userpagelayers.forEach((x) => {
            x.layerOrder = i

            i++
        })
        this.mapService.mapConfig.userpagelayers.forEach((x) => {
            let UPLUpdate = new UserPageLayer
            UPLUpdate.ID = x.ID
            UPLUpdate.layerOrder = x.layerOrder
            this.userPageLayerService.Update(UPLUpdate).subscribe();
        })
    }

    public dropPage(event: CdkDragDrop<string[]>) {
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
