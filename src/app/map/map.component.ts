// <reference path='../../../typings/leaflet.d.ts'/>
// <reference path='../../../typings/leaflet-omnivore.d.ts'/>

//Import statements
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
import { LayerPermission, LayerAdmin, UserPageLayer } from "../../_models/layer.model";
import { UserPage } from '../../_models/user-model';
import { UserPageLayerService } from '../../_services/user-page-layer.service'
import { Http, Response, Headers } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import { Subscription }   from 'rxjs/Subscription';
import {Map, MouseEvent, Marker} from "leaflet";

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent {

    //Token and current user, Working on changing the token format to JWT once hashing is operational
    public token: string;
    public userID: number;
    public headers: Headers;
    public popuptx: string = ""
        
    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    //Constructor, elementref is for use in ngAfterViewInit to test the geoJSON file. the rest are necessary for map component to work.
    constructor(private _http: Http, private elementRef: ElementRef, private mapService: MapService, private wfsservice: WFSService, private geocoder: GeocodingService, private layerPermissionService: LayerPermissionService, private layerAdminService: LayerAdminService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private http:Http, private sidenavService: SidenavService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 

        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        wfsservice.popupText$.subscribe(tx => this.popuptx = tx)

    }

    //Class variables
    public _map: L.Map;

    //GeoJSON testing variables
    public geoFlag = false;
    public geoURL = "http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/ows?service=WFS&version=1.1.0&request=GetFeature&styles=Kokomo:point&typeName=Kokomo:Bench_Marks&srsName=EPSG:4326&maxFeatures=150&outputFormat=application%2Fjson";
    public geoURL2 = 'http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/ows?service=WFS&version=1.1.0&request=GetFeature&styles=Kokomo:point&typeName=Kokomo:Cabinets&srsName=EPSG:4326&maxFeatures=50&outputFormat=application%2Fjson'
    public geoURLWMS = "http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/wms?service=WMS&version=1.1.0&request=GetMap&layers=Kokomo:Bench_Marks&styles=&bbox=184144.95491078153,1888976.6503463583,221117.617793215,1918974.7383329805&width=768&height=623&srs=EPSG:2965&format=image%2Fpng"
    public geoTest: any;
    public geoLayerGroup: any;
    public geoArray: Array<L.Layer>
    public geoProp: Array<any>;
    public curMarker: any;
    public markerArr: Array<L.Marker>;
    public wfsmarker: Array<WFSMarker>;

    //Database information
    public layers: MapService;
    public layerpermissions: any;
    public layeradmin = new LayerAdmin;
    public layeradmins: Array<LayerAdmin>;
    public userpagelayers: Array<UserPageLayer>; 
    public userpages: any; 
    public currIdent: any;
    public layerList: Array<L.Layer> = [];

    public defaultpage: any; 
    public currentlayer: L.Layer;
    public overlays: any;
    public currPage: any

    //Angular component initialization
    ngOnInit() {
        this.setPage();       
    }
    
    //Takes results from getDefaultPage and sets the page based on result
    setPage(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data:UserPage[]) => this.userpages = data,
            error => console.log(error),
            () => this.getDefaultPage()
            );
    }

    //Currently this logic seems flawed. Whatever the last page that is set as default will be selected, consider a break statement within the if block
    getDefaultPage() {
        for (let userpage of this.userpages) {
            if (userpage.default == true) {
                this.defaultpage = userpage
            }
        }
        this.getUserPageLayers(this.defaultpage)
    } 

    //Gets data from the userpagelayers table based on the user that is accessing, and calls init_map() to intitialize the map
    getUserPageLayers(page): void {
        this.userPageLayerService
            .GetPageLayers(page.ID)
            .subscribe((data:UserPageLayer[]) => this.userpagelayers = data,
                error => console.log(error),
                () =>  this.init_map()
            );
    }

    init_map() {
        this.currPage = this.defaultpage.page
        this._map = L.map("mapid", {
            zoomControl: false,
            center: L.latLng(40.4864, -86.1336),
            zoom: 12,
            minZoom: 4,
            maxZoom: 18,
            layers: [this.mapService.baseMaps.OpenStreetMap]
        });               
        L.control.zoom({ position: "bottomright" }).addTo(this._map);
        L.control.scale().addTo(this._map);
        this.mapService.map = this._map;
        this.mapService.map = this._map
        this.markerComponent.Initialize()
        this.loadLayers();
        this.setFlags()
    }   

    //This method sets flags for use with the "Layers in Map Component" map.component.html control in order to determine
    //Which layers are currently active, so they can be turned on or off at will with the corresponding dropdown selection.
    setFlags() {
        for (let x of this.userpagelayers) {
            x.layerShown = x.layerON
        }
    }
        
    //Gets userpagelayers by page.ID, changes pages
    setUserPageLayers(page): void {
        this.currPage = page.page
        console.log(this.currPage)
        console.log("set pageID = " + page.ID)
        this.userPageLayerService
            .GetPageLayers(page.ID)
            .subscribe((data:UserPageLayer[]) => this.userpagelayers = data,
                error => console.log(error),
                () => this.changePages()
            );
    }
        
    changePages(): void {
        console.log('Flags array: ' + this.userpagelayers[0].layerShown)
        this.setFlags();
        this.mapService.map.eachLayer(function (removelayer) {removelayer.remove()})
        console.log(this.mapService.baseMaps)
        this.mapService.map.addLayer(L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
        }))
    }

    //loadLayers will load during map init and load the layers that should come on by themselves with the "layerON" property set (in userpagelayers)
    loadLayers() {
        let temp = this.userpagelayers
        for (let i=0; i<temp.length; i++) {
            if (temp[i].layerON) {
                this.toggleLayers(i,temp[i].layer_admin,false)
            }
        }
    }

    //Reads index of layer in dropdown, layeradmin, and if it is shown or not. Needs to remove a layer if a new one is selected
    toggleLayers(index, layer, checked) {

        if (checked == false) {
            this.currentlayer = (L.tileLayer.wms(layer.layerURL, {
                layers: layer.layerIdent,
                format: layer.layerFormat,
                transparent: true,
            })).addTo(this._map)

            this.layerList[index] = this.currentlayer
            this.currIdent = layer.layerIdent

            this.openFeatureInfo();
            this.userpagelayers[index].layerShown = true
        }

        else { 
            this.layerList[index].removeFrom(this._map)
            this.userpagelayers[index].layerShown = false
        }
        for(let i of this.userpagelayers){console.log(i.layerShown)}
    }

    //this needs to be set up for every layer
    openFeatureInfo() {
        console.log("openFeatureInfo")
        let ms_url="http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/wms";
        this._map.on('click', (event: MouseEvent) => {
            console.log("fired")
            let BBOX = this._map.getBounds().toBBoxString();
            let WIDTH = this._map.getSize().x;
            let HEIGHT = this._map.getSize().y;
            let X = this._map.layerPointToContainerPoint(event.layerPoint).x;
            let Y = Math.trunc(this._map.layerPointToContainerPoint(event.layerPoint).y);
            let IDENT = this.currIdent
            console.log(this._map.layerPointToContainerPoint(event.layerPoint).y)
            var URL = ms_url + '?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetFeatureInfo&LAYERS='+IDENT+'&QUERY_LAYERS='+IDENT+'&BBOX='+BBOX+'&FEATURE_COUNT=1&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326&X='+X+'&Y='+Y;
            console.log(URL)
            this.wfsservice.getfeatureinfo(URL)
                .subscribe((data: any) => console.log(data))
        })
    }

    openWFS(geometry, URL, index) {
        let myIcon = L.icon({iconUrl: 'my-icon.png', iconSize: [5, 5]});
        // switch(geometry) {
        //     case "Point": {
        //         this.wfsservice.getPointLayers(URL)
        //             .subscribe(res => {
        //                 res.addTo(this.mapService.map)
        //                 this.userpagelayers[index].featureGroupObject = res
        //             })
        //         break
        //     }
        //     case "Polyline": {
        //         this.wfsservice.getPolylineLayers(URL)
        //             .subscribe(res => {
        //                 res.addTo(this.mapService.map)
        //                 this.userpagelayers[index].featureGroupObject = res
        //             })
        //         break
        //     }
        //     case "Polygon": {
        //         this.wfsservice.getPolygonLayers(URL)
        //         break
        //     }
        //     case "Coverage": {
        //         //this.wfsservice.getCoverageLayers(URL)
        //         break
        //     }
        //     default: {
        //         alert("Invalid Geometry type: " + geometry)
        //     }
        // }
        
        // this._map.on('click', (event: MouseEvent) => {
        //     this.wfsservice.popupText.next("Click a layer for details.");
        //     console.log("fired")
        //     })
            //6/30/2017 Do something right here with assigning things to onClick of featureGroup        
    }

    /*discriminateGeom(geometry, index) {
        switch(geometry) {
            case "Point": {
                this.openWFS(this.layeradmin.layerURL + "?service=WFS&version=1.1.0&request=GetFeature&typeName=" + this.layeradmin.layerIdent + "&srsName=EPSG:4326&outputFormat=application%2Fjson", index)
                break
            }
            case "Polyline": {

                break
            }
            case "Polygon": {

                break
            }
            case "Coverage": {

                break
            }
            default: {
                alert("Invalid Geometry type.")
            }
        }
    }*/
}
