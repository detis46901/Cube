/// <reference path='../../../typings/leaflet.d.ts'/>
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
import { LayerPermission, LayerAdmin, UserPageLayer, ControlLayers } from "../../_models/layer.model";
import { UserPage } from '../../_models/user-model';
import { UserPageLayerService } from '../../_services/user-page-layer.service'
import { Http, Response, Headers } from '@angular/http'
import { Observable } from 'rxjs/Observable';
import {Map, MouseEvent, Marker} from "leaflet";

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  //providers: [Http, ElementRef, MapService, WFSService, GeocodingService, LayerPermissionService, LayerAdminService, UserPageService, UserPageLayerService, SidenavService]
  providers: [SidenavService]
})

export class MapComponent {

    //@Output() geoData: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();

    //Token and current user, Working on changing the token format to JWT once hashing is operational
    public token: string;
    public userID: number;
    public headers: Headers;

    //In tandem with or independent of MarkerData below.
    @Output() MarkerDataOutput = new EventEmitter<string>();
        
    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    //Constructor, elementref is for use in ngAfterViewInit to test the geoJSON file. the rest are necessary for map component to work.
    constructor(private _http: Http, private elementRef: ElementRef, private mapService: MapService, private wfsservice: WFSService, private geocoder: GeocodingService, private layerPermissionService: LayerPermissionService, private layerAdminService: LayerAdminService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private http:Http, private sidenavService: SidenavService) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 

        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }

    //Class variables
    public _map: L.Map;
    

    //GeoJSON testing variables
    public geoFlag = false;
    public geoURL = "http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/ows?service=WFS&version=1.1.0&request=GetFeature&styles=Kokomo:point&typeName=Kokomo:Bench_Marks&srsName=EPSG:4326&maxFeatures=150&outputFormat=application%2Fjson";
    public geoURL2 = 'http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/ows?service=WFS&version=1.1.0&request=GetFeature&styles=Kokomo:point&typeName=Kokomo:Cabinets&srsName=EPSG:4326&maxFeatures=50&outputFormat=application%2Fjson'
    public geoTest: any;
    public geoLayerGroup: any;
    public geoArray: Array<L.Layer>
    public geoProp: Array<any>;
    public curMarker: any;
    public markerArr: Array<L.Marker>;
    public wfsmarker: Array<WFSMarker>;

    //6/26/17 - Used to store the popup content of a marker upon a click event, to be sent to sideNav.
    public MarkerData: string;

    public kmlFlag = false;
    public kmlURL = "http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/wms?service=wms&request=GetMap&version=1.1.1&format=application/vnd.google-earth.kml+xml&layers=Kokomo:Bench_Marks&styles=point&height=2048&width=2048&transparent=false&srs=EPSG:4326&format_options=AUTOFIT:true;KMATTR:true;KMPLACEMARK:false;KMSCORE:60;MODE:refresh;SUPEROVERLAY:false&BBOX=-87,40,-86,41"
    

    //Database information
    public layers: MapService;
    public layerpermissions: any;
    public layeradmin = new LayerAdmin;
    public layeradmins: Array<LayerAdmin>;
    public userpagelayers: Array<UserPageLayer>; 
    public userpages: any; 

    public defaultpage: any; 
    public currentlayer: L.Layer;
    public overlays: any;

    //objects is used in the openjson() method
    public objects: any
    public currPage: any
    public wfsFeed: any


    
    ngOnChanges() {
        console.log('on changes');
    }

    ngDoCheck() {
        //console.log('do check'); //this is the one to use if doing it this way

    }

    //Angular component initialization
    ngOnInit() {
        //this.MarkerData = "Marker data placeholder"
        this.setPage();
       
       
    }

    ngAfterContentChecked() {
        //console.log('after content check')
    }

    ngAfterViewInit() {
        //this.markerComponent.Initialize();
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = "../../assets/stations.js";
        this.elementRef.nativeElement.appendChild(s);
        console.log('ngAfterViewInit');
    };

    ngOnDestroy() {
        console.log('ngOnDestroy')
    };
    
    //Takes results from getDefaultPage and sets the page based on result
    public setPage(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data:UserPage[]) => this.userpages = data,
            error => console.log(error),
            () => this.getDefaultPage()
            );
    }

    //Currently this logic seems flawed. Whatever the last page that is set as default will be selected, consider a break statement within the if block
    public getDefaultPage() {
        //console.log(this.userpages)
        for (let userpage of this.userpages) {
            if (userpage.default == true) {
                this.defaultpage = userpage
            }
        }
        //console.log (this.defaultpage)
        this.getUserPageLayers(this.defaultpage)
    } 

    //Gets data from the userpagelayers table based on the user that is accessing, and calls init_map() to intitialize the map
    public getUserPageLayers(page): void {
        //console.log("get pageID = " + page.ID)
        this.userPageLayerService
            .GetPageLayers(page.ID)
            .subscribe((data:UserPageLayer[]) => this.userpagelayers = data,
                error => console.log(error),
                () =>  this.init_map()
            );
        //this.addLayers()      
    }

    public init_map() {
        //this.typeTest()
        this.currPage = this.defaultpage.page
        //console.log("map init started")
        //console.log(this.userpagelayers)
        //this.currPage = "Pages in Map"

        this.setFlags()
        //console.log('Flags array: ' + this.userpagelayers[0].layerShown)

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
        console.log(this._map)

        //var url = 'http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/ows?service=WFS&version=1.1.0&request=GetMap&typeName=Kokomo:point&srsName=ESPG:4326&outputFormat=application%2Fjson'

        //this.opengeo(this.geoURL)
        //this.openkml(this.geoURL)

        /*this.wfsservice.loadKML("http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/ows?service=WFS&version=1.1.0&request=GetFeature&styles=Kokomo:point&typeName=Kokomo:Bench_Marks&srsName=EPSG:4326&maxFeatures=150&outputFormat=application%2Fjson")
        .subscribe(observerK)*/
        console.log(this.wfsFeed)                                                                                                                                                               
        //this.openkml();

        this.mapService.map = this._map
        this.markerComponent.Initialize()
        this.mapService.map.on("click", (e: MouseEvent) => {
           console.log("Fired")
           
        });
    }   

    //This method sets flags for use with the "Layers in Map Component" map.component.html control in order to determine
    //Which layers are currently active, so they can be turned on or off at will with the corresponding dropdown selection.
    public setFlags() {
        for (let x of this.userpagelayers) {
            x.layerShown = x.layerON
        }
    }   
        
    //Gets userpagelayers by page.ID, changes pages
    public setUserPageLayers(page): void {
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
        
    public changePages(): void {
        console.log('Flags array: ' + this.userpagelayers[0].layerShown)
        this.setFlags();
        this.mapService.map.eachLayer(function (removelayer) {removelayer.remove()})
        console.log(this.mapService.baseMaps)
        this.mapService.map.addLayer(L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
        }))
    }

    //loadLayers will load during map init and load the layers that should come on by themselves with the "layerON" property set (in userpagelayers)
    public loadLayers() {
        
    }

    /*public typeTest() {
        let x: omnivore.SomeType = omnivore.someVar.a;
        console.log(x.count)
    }*/

    //Reads index of layer in dropdown, layeradmin, and if it is shown or not. Needs to remove a layer if a new one is selected
    public toggleLayers(index, layers, checked) {
        console.log(layers)
        this.layeradmin = layers
        //console.log (this.layeradmin)
        //console.log (checked)
        //console.log (index)
    
        if (checked == true) {
            //It may make sense to implement this using 'LayerGroup'
            this.currentlayer = (L.tileLayer.wms(this.layeradmin.layerURL, {
            layers: this.layeradmin.layerIdent,
            format: this.layeradmin.layerFormat,
            transparent: true,
            })).addTo(this._map)
            console.log(L.tileLayer.wms(this.layeradmin.layerURL, {layers: this.layeradmin.layerIdent,
            format: this.layeradmin.layerFormat,
            transparent: true,}))
            this.userpagelayers[index].layerShown = false
            
        }

        else { 
            console.log (checked)
            this._map.removeLayer(this.currentlayer)
            //console.log(this.currentlayer)
            this.userpagelayers[index].layerShown = true
        }
    }

    public openjson (URL) {
        console.log("openjson started")
        this.http.get(URL)
            .map((response) => <any>response.json())
            .subscribe(data => this.objects = data, 
            () => (console.log(this.objects), this.loadjson())) //This is getting nothing
    }

    public openpopup() {
        console.log ("openpopup")
    }

    public openWFS(flag, URL) {
        console.log("openWFS Started")
        this.wfsservice.getWFSLayers(URL)
            .subscribe(res => {console.log (res), res.addTo(this.mapService.map), console.log("layer created")})
            //6/30/2017 Do something right here with assigning things to onClick of featureGroup

        
    }
    
    //6/26/17 - Once operational, move to marker.component
    public opengeo (flag, URL) {
        let geoMap = this._map;
        let featureGroup: any; 
        let markerList: any;
        let props: Array<any> = [];
        let len: any;

        //Binds popup information to each marker
        function onEach (feature, layer) {
            let exec: any;
            let data = '<p>';

            //First iteration exclusive, cleanup property names array values (Column names, if you will) to simple plain-text string values
            if(props[0] == null) {
                props = JSON.stringify(feature.properties).split(',')
                len = props.length
                props[0] = props[0].substr(1)
                props[len-1] = props[len-1].substring(0,props[len-1].indexOf('}'))
                for(var i=0; i<len; i++) {
                    props[i]=props[i].substring(1,props[i].indexOf('"', 1))
                }
            }
            for(var i=0; i<len; i++) {
                exec = eval("feature.properties." + props[i])
                data = data + props[i] + ": " + exec + "<br>"
            }
            data = data + "</p>"
            layer.bindPopup(data)
        }
        
        //6/30/17 This is probably what needs the most work to continue
        let observer = {
            next: function(value) {
                value.addTo(geoMap)
            }
        }

        //Add geoJSON if it isn't already on the map
        if(!flag) {      
            /*console.log(this.wfsservice.getWFS(URL).subscribe(observer))
            featureGroup = this.wfsservice.getWFS(URL).subscribe(observer)*/
            console.log(this.wfsservice.getWFSLayers(URL))
            featureGroup = this.wfsservice.getWFSLayers(URL).subscribe(observer)
            this.geoFlag = true
        }
        //remove geoJSON layer from map if it exists on map
        else {
            //geoMap.removeLayer(getLayerId(featureGroup))
            this.setUserPageLayers(this.defaultpage)
            this.geoFlag = false
        }
    }

    public openkml (flag, URL) {
        console.log(flag)

        let kmlMap = this._map
        let polyTest: any;
        let runLayer: any;
        let maxZoom = 10;

        var observer = {
                next: function(value) {
                console.log(value)
            }
        }

        if(!flag) {
            console.log("if")   
            
            //Uses defined variable "observer" to subscribe to the wfsservice loadWFS observable, which finds the given URL below on Geoserver
            this.wfsservice.loadKML(URL)
                .subscribe(observer)

            //6/9/17
            runLayer = omnivore.kml(URL).on('ready', function() {
                kmlMap.fitBounds(runLayer.getBounds());
            })

            //6/19/17
            /*.bindPopup(function (layer) {
                return layer
                //return layer.Document.Folder.Placemark.ExtendedData
            })*/
            .bindPopup("I am useless!")
            .addTo(kmlMap);

            console.log(omnivore.kml(URL))

            this.kmlFlag = true
        }

        //remove geoJSON layer from map if it exists on map
        else {
            //this._map.removeLayer(thisLayer)
            this.setUserPageLayers(this.defaultpage)
            this.kmlFlag = false
        }
    }

    public loadjson() {
        console.log(this.objects) //Undefined here as well as in openjson
    }
}
