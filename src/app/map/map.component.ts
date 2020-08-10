import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { MapService } from './services/map.service';
import { MapConfig, mapStyles, featureList } from './models/map.model';
import { geoJSONService } from './services/geoJSON.service'
import { UserPageService } from '../../_services/_userPage.service';
import { ServerService } from '../../_services/_server.service';
import { GroupMemberService } from '../../_services/_groupMember.service';
import { GroupService } from '../../_services/_group.service';
import { LayerPermission, UserPageLayer } from '../../_models/layer.model';
import { UserPage, User } from '../../_models/user.model';
import { UserPageLayerService } from '../../_services/_userPageLayer.service';
import { Observable, of } from 'rxjs';
import { PageConfigComponent2 } from '../admin2/user/pageconfig/pageconfig.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import OSM from 'ol/source/OSM';
import { transform } from 'ol/proj';
import { defaults as defaultControls, Control } from 'ol/control';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { GeocodingService } from './services/geocoding.service'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl } from '@angular/forms';
import { map, startWith, switchMap, debounceTime, tap } from 'rxjs/operators';
import { MapConfigService } from './../../_services/mapConfig.service'
import { environment } from 'environments/environment'
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import Point from 'ol/geom/Point'
import { LogFormConfig } from '../shared.components/data-component/data-form.model'
import { FeatureModulesComponent } from '../feature-modules/feature-modules.component'
import DragAndDrop from 'ol/interaction/DragAndDrop';
import { WMSService } from './services/wms.service';
import ImageWMS from 'ol/source/ImageWMS';
import { Clipboard } from 'ts-clipboard';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import ImageLayer from 'ol/layer/Image';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import WMTS from 'ol/source/WMTS';
import TileWMS from 'ol/source/TileWMS';
import { FeatureModulesService } from '../feature-modules/feature-modules.service'
import KML from 'ol/format/KML';
import { default as ob } from 'ol/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Stroke, Style } from 'ol/style';
import GML3 from 'ol/format/GML3';
import {transformExtent} from 'ol/proj';
import { getLength } from 'ol/sphere';
import { invert } from 'lodash';
import { MyCubeStyle } from '_models/style.model';


@Component({
    moduleId: module.id,
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
    providers: [ServerService, geoJSONService, GroupService, GroupMemberService, MapConfigService]
})

export class MapComponent implements OnInit {
    // This is necessary to access the html element to set the map target (after view init)!
    @ViewChild("mapElement") mapElement: ElementRef;
    @ViewChild("layers") layers: ElementRef;
    @ViewChild("newLayer") newLayer: ElementRef 
    @ViewChild("setSearchElement") setSearchElement: ElementRef
    @ViewChild(FeatureModulesComponent)
    private featureModuleComponent: FeatureModulesComponent
    @Input() user: User;
    public layerCtrl = new FormControl();
    public searchCtrl = new FormControl();
    public filteredPermissions: Observable<LayerPermission[]>;
    public searchResults$: Observable<any>;
    public showNewLayer: boolean = false
    public mapConfig = new MapConfig;
    public public: boolean = false;
    public showSearch: boolean
    public searchresults: any
    public isLoading: boolean
    public token: string;

    constructor(
        public snackBar: MatSnackBar,
        public mapService: MapService,
        private userPageService: UserPageService,
        private userPageLayerService: UserPageLayerService,
        private dialog: MatDialog,
        private geocodingService: GeocodingService,
        private mapConfigService: MapConfigService,
        private mapStyles: mapStyles,
        private wmsService: WMSService,
        private featureModuleService: FeatureModulesService,
        protected _http: HttpClient

    ) { }

    ngOnInit() {
        console.log('8-8-20')
        console.log(this.user)
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
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
                        return this.geocodingService.search(value)
                    }
                    else {
                        this.isLoading = false
                        return of(null)
                    }
                }
                )
            );
        this.getMapConfig()

    }

    private getMapConfig() { //id is used for public pages.
        this.mapConfig.user = this.user
        this.mapConfigService.GetSingle(this.mapConfig)
            .subscribe((x) => {
                this.mapConfig = x
                this.mapConfig.modulesShow = true  //this delays the rendering of the modules until the mapConfig is loaded.
                this.mapConfig.currentPageName = this.mapConfig.currentpage.page
                this.mapConfig.selectedFeatures = new Collection<Feature>() //for some reason, this is necessary
                this.mapConfig.selectedFeatures.push(this.mapConfig.selectedFeature)
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
                this.mapConfig.selectedFeatureSource = new VectorSource({ format: new GeoJSON() })
                this.mapConfig.selectedFeatureLayer = new VectorLayer({ source: this.mapConfig.selectedFeatureSource })
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

                this.loadLayers(this.mapConfig, true).then(() => {
                    this.mapConfig.view = new View({
                        projection: 'EPSG:3857',
                        center: transform([environment.centerLong, environment.centerLat], 'EPSG:4326', 'EPSG:3857'),
                        zoom: environment.centerZoom,
                        enableRotation: true
                    })
                    this.mapConfig.map = new Map({
                        layers: this.mapConfig.baseLayers,
                        view: this.mapConfig.view,
                        controls: []
                    });

                    this.mapConfig.evkey = this.mapConfig.map.on('click', (e: any) => {
                        this.mapClickEvent(e)
                    })
                    this.mapConfig.map.setTarget(this.mapElement.nativeElement.id)  //This is supposed to be run in ngAfterViewInit(), but it's assumed that will have already happened.
                    this.mapConfig.toolbar = "Layers"

                    this.geocodingService.trackMe(this.mapConfig)
                    //this.setDefaultPageLayer()  At some point, the default layer needs to be set current
                    this.mapService.mapConfig = this.mapConfig
                    let source = new VectorSource();
                    let layer = new VectorLayer({
                        source: source
                    });
                    this.mapConfig.map.addLayer(layer);
                    //drag and drop - needs to be improved.  It only works if, inside formatConstructers, it says KML.  It shows an error, but will work.
                    //Need to make it so these layers can be added permanently.
                    // let dragAndDropInteraction = new DragAndDrop({
                    //     formatConstructors: [
                    //       KML
                    //     ]
                    //   });
                    // dragAndDropInteraction.on('addfeatures', ((event) => {
                    //     var vectorSource = new VectorSource({
                    //       features: event.features
                    //     });
                    //     this.mapConfig.map.addLayer(new VectorLayer({
                    //       source: vectorSource
                    //     }));
                    //     this.mapConfig.map.getView().fit(vectorSource.getExtent(), {
                    //         duration: 1000,
                    //         maxZoom: 18
                    //     });
                    //   }));
                    // this.mapConfig.map.addInteraction(dragAndDropInteraction)
                })
            })
    }

    ////////////Commands from map.component.html start here
    public setToolbar(bar: string) {
        this.mapConfig.toolbar = bar
    }

    public dropPage(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.mapService.mapConfig.userpages, event.previousIndex, event.currentIndex);
        let i: number = 0
        this.mapService.mapConfig.userpages.forEach((x) => {
            x.pageOrder = i
            i++
        })
        if (this.public) {return}
        this.mapService.mapConfig.userpages.forEach((x) => {
            let pageUpdate = new UserPage
            pageUpdate.ID = x.ID
            pageUpdate.page = x.page
            pageUpdate.pageOrder = x.pageOrder
            this.userPageService.Update(pageUpdate).subscribe(() => {
            });
        })
    }

    public setDefaultPage(userPage: UserPage) {
        this.mapService.setDefaultPage(userPage)
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

    public setPage(page: UserPage): void {
        this.mapConfig.modulesShow = false
        this.mapConfig.currentpage = page;
        this.mapConfig.currentLayer = new UserPageLayer;
        this.mapConfig.currentPageName = page.page;
        this.mapService.cleanPage()
        this.mapService.getUserPageLayers()
            .then(() => this.mapService.getUserPageInstances().then(() => { this.mapConfig.modulesShow = true }))
            .then(() => this.mapService.getLayerPerms())
            .then(() => {
                this.loadLayers(this.mapConfig, false).then(() => {
                    this.mapConfig.currentLayerName = "";
                    this.mapConfig.editmode = false;
                    this.mapConfig.disableCurrentLayer = false
                })
            })
        this.mapConfig.toolbar = "Layers"
    }

    public isolate(layer: UserPageLayer) {
        this.mapService.isolate(layer)
    }

    public zoomExtents(): void {
        this.mapConfig.view.animate({ zoom: environment.centerZoom, center: transform([environment.centerLong, environment.centerLat], 'EPSG:4326', 'EPSG:3857') })
    }

    public toggleBasemap() {
        this.mapService.toggleBasemap()
    }




    public drawFeature(featureType: string) {
        console.log(featureType)
        if (this.mapConfig.currentLayer.user_page_instance) {
            this.featureModuleComponent.checkSomething("draw " + featureType, this.mapConfig.currentLayer).then((x) => {
                console.log(x)
                if (!x) {
                    console.log('going to drawFeature')
                    this.mapService.drawFeature(featureType)
                }
            })
        }
        else {
            this.mapService.drawFeature(featureType)
        }
    }

    public deleteFeature() {
        this.mapService.deleteFeature()
    }

    public dropLayer(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.mapService.mapConfig.userpagelayers, event.previousIndex, event.currentIndex);
        let i: number = 0
        this.mapService.mapConfig.userpagelayers.forEach((x) => {
            x.layerOrder = i
            i++
            console.log(x.layerOrder)
        })
        //setting a variable to be index of last user page layer
        let leng = this.mapService.mapConfig.userpagelayers.length
        let a = leng - 1
        
        this.mapService.mapConfig.userpagelayers.forEach((x) => {
            let UPLUpdate = new UserPageLayer
            UPLUpdate.ID = x.ID
            UPLUpdate.layerOrder = x.layerOrder
            UPLUpdate.style = x.style //another stupid hack
            console.log(`new index of ${x.layer.layerName}: ${UPLUpdate.layerOrder}`)
            let zdex = a
            a-- //decrementing from index of last user page layer
            this.mapConfig.selectedFeatureLayer.setZIndex(zdex)
            console.log(`ZIndex = ${this.mapConfig.selectedFeatureLayer.getZIndex()}`)
            this.userPageLayerService.Update(UPLUpdate).subscribe();
            
        })
        //this.userPageService.Update()
        //window.location.reload(true)
    }

    // new features: assignNewLayerIndex, deleteLayerIndex, reloadIndex -BB

    public assignNewLayerIndex(layer: UserPageLayer) {
        let len = this.mapService.mapConfig.userpagelayers.length
        layer.layerOrder = (len - 1)
        this.reloadIndex()
    }

    public deleteLayerIndex(layer: UserPageLayer) {
        let ind = layer.layerOrder
        this.reloadIndex()
        this.mapService.mapConfig.userpagelayers.splice(ind, 0)
        this.reloadIndex()
    }

    public reloadIndex() {
        let i: number = 0
        this.mapService.mapConfig.userpagelayers.forEach((x) => {
            x.layerOrder = i
            i++
        })
        this.mapService.mapConfig.userpagelayers.forEach((x) => {
            let UPLUpdate = new UserPageLayer
            UPLUpdate.ID = x.ID
            UPLUpdate.layerOrder = x.layerOrder
            UPLUpdate.style = x.style //another stupid hack
            this.userPageLayerService.Update(UPLUpdate).subscribe();
        })
    }

    // public createHeatMap(layer: UserPageLayer){
    //     layer = this.mapConfig.currentLayer
    //     this.mapService.createHeatMap(layer)
    // }

    public addUserPageLayer(layer: UserPageLayer) {
        this.mapService.addUserPageLayer(layer)
        this.assignNewLayerIndex(layer)
    }

    public toggleDefaultOn(layer: UserPageLayer) {
        this.mapService.toggleDefaultOn(layer)
    }

    public deleteUserPageLayer(layer: UserPageLayer) {
        this.mapService.deleteUserPageLayer(layer)
        this.deleteLayerIndex(layer)
    }

    public copyToClipboard(url: string) {
        url = environment.serverWithApiUrl + url + '&apikey=' + this.user.apikey
        const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
        Clipboard.copy(environment.serverWithApiUrl + url);
        this.snackBar.open("Copied to the clipboard", "", {
            duration: 2000,
        });
    }

    public copyGSToClipboard(url: string) {
        Clipboard.copy('=IMPORTHTML("' + environment.serverWithApiUrl + url + '&apikey=' + this.user.apikey + '", "table", 1)');
        this.snackBar.open("Copied to the clipboard", "", {
            duration: 2000,
        });
    }

    public clearLayerConfig(): Promise<boolean> { //The only time this is called is during 'setCurrentLayer'
        let promise = new Promise<boolean>((resolve) => {
            this.mapConfig.filterOn = false;
            this.mapConfig.filterShow = false;
            this.mapConfig.styleShow = false;
            this.mapConfig.editmode = false;
            this.mapConfig.showDeleteButton = false
            this.mapConfig.showStyleButton = false
            this.mapConfig.showFilterButton = false
            this.mapConfig.WMSFeatureData = null
            this.mapConfig.map.removeInteraction(this.mapService.modify);
            let test = new ob
            this.mapConfig.drawMode = ""
            // test.un("change", this.mapService.modkey);
            this.mapConfig.map.removeInteraction(this.mapService.drawInteraction);
            this.mapService.modify = null;
            this.mapService.clearFeature();
            this.mapConfig.userpagelayers.forEach(layer => {
                if (layer.userPageInstanceID) {
                    this.featureModuleComponent.checkSomething('unsetCurrentLayer', layer).then((x) => {
                        if (!x) {
                            if (layer.layer.layerType == "MyCube") {
                                this.mapService.setStyle(layer, 'load')
                            }
                        }
                    })
                }
                else {
                    if (layer.layer.layerType == "MyCube") {
                        this.mapService.setStyle(layer, 'load')
                    }
                }
                resolve(true)
            });

        })
        return promise
    }

    public setCurrentLayer(layer: UserPageLayer): void {
        this.clearLayerConfig().then((x) => {
            this.mapConfig.currentLayer = layer;
            this.mapConfig.currentLayerName = layer.layer.layerName  //Puts the current name in the component
            if (layer.userPageInstanceID) {
                this.featureModuleComponent.checkSomething('setCurrentLayer', layer).then((x) => {
                    if (!x) {
                        if (layer.layer.layerType == "MyCube") { this.mapService.setCurrentLayer(layer) }
                    }
                })
                this.featureModuleComponent.checkSomething('getFeatureList', layer).then((x) => {
                    if (!x && layer.layer.layerType == "MyCube") { this.mapService.getFeatureList() }
                })
            }
            else {
                if (layer.layer.layerType == 'MyCube') { this.mapService.setCurrentMyCube(layer) }
            }
        });
    }

    public toggleLayers(layer: UserPageLayer) {
        if (layer.olLayer) { layer.olLayer.setVisible(!layer.layerShown) }
        layer.layerShown = !layer.layerShown;
        if (layer.layerShown === false) { //turning a layer off
            if (this.mapConfig.currentLayer == layer) {
                this.mapConfig.currentLayer = new UserPageLayer;
                this.mapConfig.currentLayerName = "";
                this.mapService.clearFeature()
                this.mapConfig.showStyleButton = false
                this.mapConfig.showFilterButton = false
                this.mapConfig.WMSFeatureData = null
            }
            //could add something here that would move to the next layerShown=true.  Not sure.
            this.mapConfig.editmode = this.mapConfig.currentLayer.layerPermissions.edit  //not sure why I need this
        }
        else {
            this.setCurrentLayer(layer);
        }
        if (layer.layerShown === false) { //turning a layer off
            this.featureModuleComponent.checkSomething('unloadLayer', layer).then(() => {
                if (this.mapConfig.currentLayer == layer) {
                    this.featureModuleComponent.checkSomething('unSetCurrentLayer', layer)
                }
            })
        }
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
        this.loadLayers(this.mapConfig, false, true)
        this.showNewLayer = false
        this.layerCtrl.setValue('')
        this.assignNewLayerIndex(UPL)
    }

    public addSearch(searchResults): void {
        if (searchResults.length) { return } //If there aren't any results, don't do anything.
        if (this.mapConfig.searchResultSource) { this.mapConfig.searchResultSource.clear() }
        this.mapConfig.view.animate({ zoom: 18, center: transform([+searchResults.lon, +searchResults.lat], 'EPSG:4326', 'EPSG:3857') })
        this.mapConfig.searchResult = new Feature({ geometry: new Point(transform([+searchResults.lon, +searchResults.lat], 'EPSG:4326', 'EPSG:3857')) })
        this.mapConfig.searchResultSource = new VectorSource()
        this.mapConfig.searchResultSource.addFeature(this.mapConfig.searchResult)
        this.mapConfig.searchResultLayer = new VectorLayer({ source: this.mapConfig.searchResultSource })
        this.mapConfig.searchResultLayer.setStyle(this.mapStyles.selected)
        this.mapConfig.selectedFeatureLayer.setZIndex(1000)
        this.mapConfig.map.addLayer(this.mapConfig.searchResultLayer)
        this.geocodingService.sendSearchResults(searchResults)
        // this.searchCtrl.setValue('')
    }

    public setSearch() {
        this.showSearch = !this.showSearch
        this.showNewLayer = false
        if(this.showSearch) {
            setTimeout(()=>{ // this will make the execution after the above boolean has changed
                this.setSearchElement.nativeElement.focus();
              },0);    
        }
        else {
            if (this.mapConfig.searchResultSource) { this.mapConfig.searchResultSource.clear() }
            this.searchCtrl.setValue(null)
            this.geocodingService.sendSearchResults(null)
        }
    }

    public setNewLayer() {
        this.showNewLayer = !this.showNewLayer
        this.showSearch = false
        if (this.showNewLayer) {
            setTimeout(()=>{ // this will make the execution after the above boolean has changed
                this.newLayer.nativeElement.focus();
              },0);    
        }
            }

    public zoomToFeature(fl: featureList) {
        this.mapConfig.view.fit(fl.feature.getGeometry().getExtent(), {
            duration: 1000,
            maxZoom: 18
        })
        this.findMyCubeFeature(undefined, fl.feature)
    }

    public changedDataForm() {
        this.mapService.loadLogConfig(this.mapConfig.currentLayer)
    }

    public onNewComment(logFormConfig: LogFormConfig) {
        this.mapService.renderLogConfig(logFormConfig)
    }

    private _filterPermissions(value: string): LayerPermission[] {
        const filterValue = value.toLowerCase();
        return this.mapConfig.layerpermission.filter(layerPermission => layerPermission.layer.layerName.toLowerCase().includes(filterValue));
    }

    public _displayFn(layerPermission?: LayerPermission): string | undefined {
        return layerPermission ? layerPermission.layer.layerName : undefined;
    }

    public _searchDisplay(results) {
        return results && results.display_name ? results.display_name : '';
    }

    public styleFunction(layer: UserPageLayer, feature: Feature, version: string): Style {
        let style = this.featureModuleService.styleLayer(this.mapConfig, layer, feature, 'load')
        return style
    }
    //loadLayers will load during map init and load the layers that should come on by themselves with the "defaultON" property set (in userPageLayers)
    public loadLayers(mapConfig: MapConfig, init: boolean, single?: boolean): Promise<any> {
        //this.reloadOrder()

        this.mapConfig = mapConfig
        let j = 0;
        let promise = new Promise((resolve) => {
            this.mapConfig.userpagelayers.forEach(userpagelayer => {
                if (single) { //If you're adding a single layer, under the "addLayer() from the map.component"
                    j++
                    if (j < this.mapConfig.userpagelayers.length) {
                        return
                    }
                }
                userpagelayer.layerShown = userpagelayer.defaultON;
                if (!userpagelayer.olLayer) {
                    switch (userpagelayer.layer.layerType) {
                        case "GeoserverWFS": {
                            let stylefunction = ((feature: Feature, resolution) => {  //"resolution" has to be here to make sure feature gets the feature and not the resolution
                                return (this.styleFunction(userpagelayer, feature, 'current'));
                            })
                            var vectorSource = new VectorSource({
                                format: new GeoJSON(),
                                url: function (extent) {
                                    // Commented items are for KML stuff
                                    // let newExtent = transformExtent(extent, "EPSG:3857", "EPSG:4326")
                                    // console.log(newExtent)
                                    return userpagelayer.layer.server.serverURL.split('/wms')[0] + '/' + userpagelayer.layer.layerIdent.split(':')[0] + '/ows?service=WFS&version=1.0.0&request=GetFeature&'+
                                    '&typeName=' + userpagelayer.layer.layerIdent + '&outputFormat=application/json&srsname=EPSG:3857&' +
                                    // console.log('https://cube-kokomo.com:8080/geoserver/Kokomo/wms?service=wms&request=GetMap&version=1.1.1&format=application/vnd.google-earth.kml+xml&layers=Kokomo:paser_inspections&styles=paser&height=1328&width=2048&transparent=false&srs=EPSG:4326&format_options=AUTOFIT:true;KMATTR:true;KMPLACEMARK:false;KMSCORE:20;MODE:superoverlay&superoverlay_mode=raster&' + 'bbox=' + newExtent.join(','))
                                    // return 'https://cube-kokomo.com:8080/geoserver/Kokomo/wms?service=wms&request=GetMap&version=1.1.1&format=application/vnd.google-earth.kml+xml&layers=Kokomo:paser_inspections&styles=paser&height=1328&width=2048&transparent=false&srs=EPSG:4326&format_options=AUTOFIT:true;KMATTR:true;KMPLACEMARK:false;KMSCORE:20;MODE:superoverlay&superoverlay_mode=raster&'
                                    // https://cube-kokomo.com:8080/geoserver/Kokomo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Kokomo%3Apaser_inspections&maxFeatures=50&outputFormat=application%2Fjson
                                    // return 'https://cube-kokomo.com:8080/geoserver/Kokomo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Kokomo%3Apaser_inspections&' +
                                        // 'outputFormat=gml3&srsname=EPSG:3857&' +
                                        'bbox=' + extent.join(',') + ',EPSG:3857';
                                },
                                strategy: bboxStrategy,

                            });
                            userpagelayer.source = vectorSource
                            var vector = new VectorLayer({
                                source: vectorSource,
                                style: stylefunction
                            })
                            if (init) {
                                this.mapConfig.baseLayers.push(vector);  //to delete
                            }
                            userpagelayer.olLayer = vector
                            userpagelayer.source = vectorSource
                            if (init == false) { //necessary during initialization only, as the map requires the layers in an array to start with.
                                mapConfig.map.addLayer(vector);
                            }
                            if (this.featureModuleService.loadLayer(this.mapConfig, userpagelayer)) {
                                // console.log('this is a mycube layer that is being loaded by the FMS')
                                // j++
                                // if (j == this.mapConfig.userpagelayers.length) {
                                //     resolve()
                                // }
                            }
                            j++;
                            if (j == this.mapConfig.userpagelayers.length) {
                                resolve();
                            }
                            break
                        }
                        case "GeoserverMosaic": {
                            {  //testing...
                                let wmsSource = new ImageWMS({
                                    url: this.wmsService.formLayerRequest(userpagelayer),
                                    params: {
                                        'LAYERS': userpagelayer.layer.layerIdent,
                                        'FORMAT': 'image/png',
                                        'VERSION': '1.1.1',
                                        "exceptions": 'application/vnd.ogc.se_inimage'
                                    },
                                    ratio: 1,
                                    projection: 'EPSG:2965',
                                    serverType: 'geoserver',
                                    crossOrigin: 'anonymous',
                                });
                                let wmsLayer: ImageLayer = new ImageLayer({
                                    source: wmsSource
                                });
                                wmsLayer.setZIndex(j)
                                wmsLayer.setVisible(userpagelayer.defaultON);
                                if (userpagelayer.style['opacity']) { wmsLayer.setOpacity(userpagelayer.style['opacity']) }
                                userpagelayer.olLayer = wmsLayer
                                userpagelayer.source = wmsSource
                                this.wmsService.setLoadStatus(userpagelayer);
                                if (init == false) { //necessary during initialization only, as the map requires the layers in an array to start with.
                                    mapConfig.map.addLayer(wmsLayer);
                                }
                                j++;
                                if (j == this.mapConfig.userpagelayers.length) {
                                    resolve();
                                }
                                break
                            }
                        }
                        case "ArcGISRest": {
                            let wmsSource = new ImageArcGISRest()
                            wmsSource.setUrl(userpagelayer.layer.server.serverURL + '/' + userpagelayer.layer.layerService + '/MapServer')
                            let wmsLayer: ImageLayer = new ImageLayer({ source: wmsSource })
                            wmsLayer.setZIndex(j)
                            wmsLayer.setVisible(userpagelayer.defaultON);
                            if (userpagelayer.style['opacity']) { wmsLayer.setOpacity(userpagelayer.style['opacity']) }
                            userpagelayer.olLayer = wmsLayer
                            userpagelayer.source = wmsSource
                            this.wmsService.setLoadStatus(userpagelayer);
                            if (init == false) { //necessary during initialization only, as the map requires the layers in an array to start with.
                                mapConfig.map.addLayer(wmsLayer);
                            }
                            j++;
                            if (j == this.mapConfig.userpagelayers.length) { resolve() }
                            break
                        }
                        case "MyCube": {
                            //if (userpagelayer.style['opacity']) { userpagelayer.olLayer.setOpacity(userpagelayer.style['opacity'] / 100) }
                            if (this.featureModuleService.loadLayer(this.mapConfig, userpagelayer)) {
                                j++
                                if (j == this.mapConfig.userpagelayers.length) {
                                    resolve()
                                }
                            }
                            else {
                                this.mapService.loadMyCube(userpagelayer, j).then((layer: UserPageLayer) => {
                                    layer.updateInterval = setInterval(() => {
                                        this.mapService.runInterval(layer).then(() => {
                                            if (layer.userPageInstanceID) {
                                                this.featureModuleComponent.checkSomething('styleMyCube', layer).then((x) => {
                                                    if (!x) {
                                                        this.mapService.setStyle(layer)
                                                    }
                                                })
                                            }
                                            else {
                                                this.mapService.setStyle(layer)
                                            }
                                        })
                                    }, 20000);
                                    if (layer.userPageInstanceID) {
                                        this.featureModuleComponent.checkSomething('styleMyCube', layer).then((x) => {
                                            if (!x) {
                                                this.mapService.setStyle(layer)
                                            }
                                        })
                                    }
                                    else {
                                        this.mapService.setStyle(layer)
                                    }
                                }
                                )
                                j++;
                                if (j == this.mapConfig.userpagelayers.length) { resolve() }
                            }
                            break;
                        }
                        case "WMTS": {
                            let url: string
                            let diffWMS: ImageWMS
                            diffWMS = new ImageWMS({
                                url: this.wmsService.formLayerRequest(userpagelayer, true),
                                params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
                                projection: 'EPSG:4326',
                                serverType: 'geoserver',
                                crossOrigin: 'anonymous'
                            })
                            userpagelayer.layer.legendURL = diffWMS.getLegendUrl(23)
                            if (userpagelayer.layer.server.serverType == "ArcGIS WMTS") {
                                url = userpagelayer.layer.server.serverURL + '/' + userpagelayer.layer.layerService + '/MapServer/WMTS/1.0.0/WMTSCapabilities.xml'
                                // '/ImageServer/WMTS/1.0.0/WMTSCapabilities.xml'
                            }
                            else {
                                url = userpagelayer.layer.server.serverURL
                            }
                            this.wmsService.getCapabilities(url)
                                .subscribe((data) => {
                                    let parser = new WMTSCapabilities();
                                    let result = parser.read(data);
                                    let options = optionsFromCapabilities(result, {
                                        layer: userpagelayer.layer.layerIdent,
                                        matrixSet: 'EPSG:3857',
                                        cacheSize: environment.cacheSize
                                    });
                                    let wmtsSource = new WMTS(options);
                                    let wmtsLayer = new TileLayer({
                                        opacity: 1,
                                        source: new WMTS(options)
                                    });
                                    wmtsLayer.setVisible(userpagelayer.defaultON);
                                    userpagelayer.olLayer = wmtsLayer
                                    userpagelayer.source = wmtsSource
                                    this.wmsService.setLoadStatus(userpagelayer);
                                    if (init == false) {
                                        mapConfig.map.addLayer(wmtsLayer);
                                    }
                                    j++;
                                    if (userpagelayer.style['opacity']) { userpagelayer.olLayer.setOpacity(+userpagelayer.style['opacity'] / 100) }
                                    if (j == this.mapConfig.userpagelayers.length) { resolve() }
                                })
                            break;
                        }
                        case "Module": {
                            console.log('module layer')
                            if (this.featureModuleService.loadLayer(this.mapConfig, userpagelayer)) {
                                j++
                                if (j == this.mapConfig.userpagelayers.length) { resolve() }
                            }
                            break
                        }
                        default: {  //this is the WMS load
                            let wmsSource = new TileWMS({
                                url: this.wmsService.formLayerRequest(userpagelayer),
                                params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
                                projection: 'EPSG:4326',
                                serverType: 'geoserver',
                                crossOrigin: 'anonymous',
                                cacheSize: environment.cacheSize
                            });
                            let wmsLayer: TileLayer = new TileLayer({ source: wmsSource });
                            wmsLayer.setZIndex(j)
                            wmsLayer.setVisible(userpagelayer.defaultON);
                            if (init) {
                                this.mapConfig.baseLayers.push(wmsLayer);  //to delete
                            }
                            userpagelayer.olLayer = wmsLayer
                            userpagelayer.source = wmsSource
                            this.wmsService.setLoadStatus(userpagelayer);
                            if (init == false) { //necessary during initialization only, as the map requires the layers in an array to start with.
                                mapConfig.map.addLayer(wmsLayer);
                            }
                            j++;
                            if (userpagelayer.style['opacity']) { userpagelayer.olLayer.setOpacity(+userpagelayer.style['opacity'] / 100) }
                            if (j == this.mapConfig.userpagelayers.length) { resolve() }
                            let diffWMS: ImageWMS
                            diffWMS = new ImageWMS({
                                url: this.wmsService.formLayerRequest(userpagelayer, true),
                                params: { 'LAYERS': userpagelayer.layer.layerIdent, TILED: true },
                                projection: 'EPSG:4326',
                                serverType: 'geoserver',
                                crossOrigin: 'anonymous'
                            })
                            if (userpagelayer.layer.legendURL) { userpagelayer.layer.legendURL = diffWMS.getLegendUrl(2).split('&SCALE')[0] }
                        }
                    }
                }
            }
            )
        })
        return promise;
    }

    public mapClickEvent(evt) {
        if (this.mapConfig.drawMode != '') { return }
        this.mapConfig.selectedFeatureSource.clear()
        if (this.mapConfig.measureShow) { return }  //disables select/deselect when the measure tool is open.
        let layer = this.mapConfig.currentLayer
        switch (this.mapConfig.currentLayer.layer.layerType) {
            case ("GeoserverWFS"):
            case ("Geoserver"): {
                let url2 = this.wmsService.formLayerRequest(layer);
                if (layer.layer.layerType == 'WMTS') { }
                let wmsSource = new ImageWMS({
                    url: url2,
                    params: { 'FORMAT': 'image/png', 'VERSION': '1.1.1', 'LAYERS': layer.layer.layerIdent, 'exceptions': 'application/vnd.ogc.se_inimage', tilesOrigin: 179999.975178479 + "," + 1875815.463803232 },
                    projection: 'EPSG:4326',
                    serverType: 'geoserver',
                    crossOrigin: 'anonymous'
                });
                let viewResolution = this.mapConfig.map.getView().getResolution();
                let url = wmsSource.getFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857', { 'INFO_FORMAT': 'text/html' });
                let url3 = wmsSource.getFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857', { 'INFO_FORMAT': 'application/json' })
                if (url3) {
                    this.wmsService.getGeoJSONInfo(url3)
                        .subscribe((data: string) => {
                            let data1 = data.split('numberReturned":') //probably a better way to do this.
                            if (data1[1][0] == '0') {
                                //if (this.featuremodulesservice.clearFeature(this.mapConfig, this.mapConfig.currentLayer)) { return }
                                this.featureModuleComponent.checkSomething('clearFeature', layer).then((x) => {
                                    if (x) { return }
                                })
                            }
                            else {
                                this.mapConfig.selectedFeature = new GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }).readFeatures(data)[0];
                                this.mapConfig.selectedFeatureSource.addFeature(this.mapConfig.selectedFeature)
                                this.mapConfig.selectedFeature.setStyle(this.mapStyles.selected);
                                this.featureModuleComponent.checkSomething('selectFeature', layer).then(() => { })
                            }
                            if (url) {
                                this.wmsService.getfeatureinfo(url, false)
                                    .subscribe((data: any) => {
                                        this.mapService.parseAndSendWMS(data)
                                    });
                            }
                        })
                }
                break
            }
            case ("MapServer"): {
                let url2 = this.wmsService.formLayerRequest(layer);
                let wmsSource = new ImageWMS({
                    url: url2,
                    params: { 'FORMAT': 'image/png', 'VERSION': '1.1.1', 'LAYERS': layer.layer.layerIdent, 'exceptions': 'application/vnd.ogc.se_inimage', tilesOrigin: 179999.975178479 + "," + 1875815.463803232 },
                    projection: 'EPSG:4326',
                    serverType: 'geoserver',
                    crossOrigin: 'anonymous'
                });
                let viewResolution = this.mapConfig.map.getView().getResolution();
                let url = wmsSource.getFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857', { 'INFO_FORMAT': 'text/html' });
                if (url) {
                    this.wmsService.getfeatureinfo(url, false)
                        .subscribe((data: any) => {
                            this.mapService.parseAndSendWMS(data)
                        });
                    this.featureModuleComponent.checkSomething('selectFeature', layer).then(() => { })
                }
                break
            }
            case ("WMTS"): {
                let url2 = this.wmsService.formLayerRequest(layer);
                if (layer.layer.layerType == 'WMTS') {
                    let layerroot = layer.layer.server.serverURL.split('/gwc')[0]
                    url2 = layerroot + '/wms?'
                }
                let wmsSource = new ImageWMS({
                    url: url2,
                    params: { 'FORMAT': 'image/png', 'VERSION': '1.1.1', 'LAYERS': layer.layer.layerIdent, 'exceptions': 'application/vnd.ogc.se_inimage', tilesOrigin: 179999.975178479 + "," + 1875815.463803232 },
                    projection: 'EPSG:4326',
                    serverType: 'geoserver',
                    crossOrigin: 'anonymous'
                });
                let viewResolution = this.mapConfig.map.getView().getResolution();
                wmsSource.get;
                let url = wmsSource.getFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857', { 'INFO_FORMAT': 'text/html' });
                if (url) {
                    this.wmsService.getfeatureinfo(url, false)
                        .subscribe((data: any) => {
                            this.mapService.parseAndSendWMS(data)
                        });
                }
                break
            }
            case ("MyCube"): {
                this.findMyCubeFeature(evt)
                break
            }
            case ("Module"): {
                let hit = false;

                this.mapConfig.map.forEachFeatureAtPixel(evt.pixel, (feature: Feature, selectedLayer: any) => {
                    if (selectedLayer === layer.olLayer) {
                        hit = true;
                        this.mapConfig.selectedFeature = feature;
                    }
                    ;
                }, {
                    hitTolerance: 5
                });

                if (hit) {
                    this.featureModuleComponent.checkSomething('selectFeature', layer).then((x) => {
                        if (x) { return }
                        else {
                            this.mapService.selectMyCubeFeature(layer)
                        }
                        this.featureModuleComponent.checkSomething('styleSelectedFeature', layer).then(() => {
                        })
                    })
                }
                else {
                    this.featureModuleComponent.checkSomething('clearFeature', layer).then((x) => {
                        if (!x) {
                            this.featureModuleComponent.checkSomething('unstyleSelectedFeature', layer)
                            this.mapService.clearFeature()
                        }
                    })
                }

                console.log("this is a module layer.  It gets its click event from the feature module during setCurrentLayer()")
            }
        }
    }

    public findMyCubeFeature(evt?, selectedFeature?: Feature) {
        //the selectedFeature part would only come from the zoomToFeature() command
        let layer = this.mapConfig.currentLayer
        if (this.mapConfig.currentLayer.userPageInstanceID) {
            this.featureModuleComponent.checkSomething('unstyleSelectedFeature', layer).then((x) => {
                if (!x) {
                    if (this.mapConfig.selectedFeature) {
                        this.mapConfig.selectedFeature.setStyle(null);
                    }
                }
                let hit = false;
                if (!selectedFeature) {
                    this.mapConfig.map.forEachFeatureAtPixel(evt.pixel, (feature: Feature, selectedLayer: any) => {
                        if (selectedLayer === layer.olLayer) {
                            hit = true;
                            this.mapConfig.selectedFeature = feature;
                        }
                        ;
                    }, {
                        hitTolerance: 5
                    });
                }
                else {
                    hit = true
                    this.mapConfig.selectedFeature = selectedFeature
                }
                if (hit) {
                    this.featureModuleComponent.checkSomething('selectFeature', layer).then((x) => {
                        if (x) { return }
                        else {
                            this.mapService.selectMyCubeFeature(layer)
                        }
                        this.featureModuleComponent.checkSomething('styleSelectedFeature', layer).then(() => {
                        })
                    })
                }
                else {
                    this.featureModuleComponent.checkSomething('clearFeature', layer).then((x) => {
                        if (!x) {
                            this.featureModuleComponent.checkSomething('unstyleSelectedFeature', layer)
                            this.mapService.clearFeature()
                        }
                    })
                }
            })
        }
        else {
            //no module associated with this layer
            if (this.mapConfig.selectedFeature) {
                this.mapConfig.selectedFeature.setStyle(null);
            }
            let hit = false;
            if (!selectedFeature) {
                this.mapConfig.map.forEachFeatureAtPixel(evt.pixel, (feature: Feature, selectedLayer: any) => {
                    if (selectedLayer === layer.olLayer) {
                        hit = true;
                        this.mapConfig.selectedFeature = feature;
                    }
                    ;
                }, {
                    hitTolerance: 5
                });
            }
            else {
                hit = true
                this.mapConfig.selectedFeature = selectedFeature
            }
            if (hit) {
                this.mapConfig.selectedFeature.setStyle(this.mapStyles.selected);
                this.mapService.selectMyCubeFeature(layer)
            }
            else {
                this.mapService.clearFeature();
            }
        }
    }


}
