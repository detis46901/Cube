/// <reference path="../../../typings/leaflet/leaflet.d.ts" />

import { Component, ViewChild } from '@angular/core';
import { MapService } from "./services/map.service";
import { Location } from "./core/location.class";
import { GeocodingService } from "./services/geocoding.service";
import { NavigatorComponent } from "./navigator/navigator.component";
import { MarkerComponent } from "./marker/marker.component";
import { LayerPermissionService } from "../../_services/layerpermission.service"
import { LayerAdminService } from "../../_services/layeradmin.service"
import { UserPageService } from '../../_services/user-page.service'
import { LayerPermission, LayerAdmin } from "../../_models/layer.model"
import { UserPageLayer, ControlLayers } from '_models/layer.model';
import { UserPage } from '../../_models/user-model';
import { UserPageLayerService } from '../../_services/user-page-layer.service'
import { Http } from '@angular/http'



@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent {
    public token: string;
    public userID: number;
    
    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    constructor(private mapService: MapService, private geocoder: GeocodingService, private layerPermissionService: LayerPermissionService, private layerAdminService: LayerAdminService, private userPageService: UserPageService, private userPageLayerService: UserPageLayerService, private http:Http) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
        this.userID = currentUser && currentUser.userid; 
    }

    public _map: any;
    public layers: MapService;
    public layerpermissions: any;
    public layeradmin = new LayerAdmin;
    public layeradmins: Array<LayerAdmin>;
    public userpagelayers: Array<UserPageLayer>; //***
    public userpages: any; //***
    public defaultpage: any; //***
    public currentlayer: L.Layer;
    public overlays: any;
    public q: number;
    public j: any[];
    public layercontrol: L.Control;
    public layerActive: Array<Boolean> = [];
    model = {
    left: true,
    middle: false,
    right: false
    };
    public cls: ControlLayers[] = []
    public cl = new ControlLayers
    public objects: any


    ngOnChanges() {
        console.log('map changed');
    }

    ngOnInit() {
        //console.log("oninit")
        //console.log(document.getElementById("mapid").innerHTML)
        //if (document.getElementById("mapid").innerHTML != "") {document.getElementById("mapid").innerHTML = ""}
        //console.log(document.getElementById("mapid").innerHTML)
        //console.log (L.)
        this.setPage();
    }
    
    public setPage(): void {
        this.userPageService
            .GetSome(this.userID)
            .subscribe((data:UserPage[]) => this.userpages = data,
            error => console.log(error),
            () => this.getDefaultPage()
            );
    }

    public getDefaultPage() {
        console.log(this.userpages)
        for (let userpage of this.userpages) {
            if (userpage.default == true) {
                this.defaultpage = userpage
            }
        }
        console.log (this.defaultpage)
        this.getUserPageLayers(this.defaultpage)
    } 

    public getUserPageLayers(page): void {
        console.log("get pageID = " + page.ID)
        this.userPageLayerService
            .GetPageLayers(page.ID)
            .subscribe((data:UserPageLayer[]) => this.userpagelayers = data,
                error => console.log(error),
                () =>  this.init_map()
            );
        //this.addLayers()      
    }

    public init_map() {
        console.log("map init started")

        this.setFlags()
        console.log('Flags array: ' + this.userpagelayers[0].layerShown)

        this.addLayers()

        this._map = L.map("mapid", {
            zoomControl: false,
            center: L.latLng(40.4864, -86.1336),
            zoom: 12,
            minZoom: 4,
            maxZoom: 18,
            layers: [this.mapService.baseMaps.OpenStreetMap]
        });       
        
        L.control.zoom({ position: "bottomright" }).addTo(this._map);
        this.layercontrol = L.control.layers(this.mapService.baseMaps, this.overlays, {position: 'bottomright'})
        this.layercontrol.addTo(this._map); //Commenting this out throws an extra error when clicking username to go to homepage for some reason
        L.control.scale().addTo(this._map);
        this.mapService.map = this._map;
        //this.geocoder.getCurrentLocation()
        //    .subscribe(
        //        location => map.panTo([location.latitude, location.longitude]),
        //        err => console.error(err)
        //    );  
        //this.openjson('http://foster2.cityofkokomo.org:8080/geoserver/sf/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=sf:archsites&maxFeatures=50&outputFormat=application/json') //Can't be opened currently: "No 'Access-Control-Allow-Origin" header

        //this.openkml('http://foster2.cityofkokomo.org:8080/geoserver/sf/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=sf:archsites&maxFeatures=50&outputFormat=application/json')
    }   

    //This method sets flags for use with the "Layers in Map Component" map.component.html control in order to determine
    //Which layers are currently active, so they can be turned on or off at will with the corresponding dropdown selection.
    public setFlags() {
        for (let x of this.userpagelayers) {
            this.layerActive.push(x.layerON)
            x.layerShown = x.layerON
        }
    }

    public addLayers() {
        console.log("addLayers Started")
        //console.log(this.layeradmin);
        //console.log (this.mapService.map.addLayer)
        //this.mapService.openjson('http://foster2.cityofkokomo.org:8080/geoserver/sf/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=sf:archsites&maxFeatures=50&outputFormat=application/json')
        this.q=0

        console.log('Flags array: ' + this.userpagelayers[0].layerShown)
        console.log(this.userpagelayers)

        //let n = this.userpagelayers[0].layer_admin
        //let l = n.layerName
        //this.overlays = { [l] : L.tileLayer.wms(n.layerURL, { layers: n.layerIdent, format: n.layerFormat, transparent: true})}

        console.log (this.overlays)
        console.log (this.userpagelayers.length)

        switch(this.userpagelayers.length) {
            case 1:
                this.overlays = { [this.userpagelayers[0].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[0].layer_admin.layerURL, { layers: this.userpagelayers[0].layer_admin.layerIdent, format: this.userpagelayers[0].layer_admin.layerFormat, transparent: true})}
                break
            case 2:
                this.overlays = { [this.userpagelayers[0].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[0].layer_admin.layerURL, { layers: this.userpagelayers[0].layer_admin.layerIdent, format: this.userpagelayers[0].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[1].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[1].layer_admin.layerURL, { layers: this.userpagelayers[1].layer_admin.layerIdent, format: this.userpagelayers[1].layer_admin.layerFormat, transparent: true})}
                break
            case 3:
                this.overlays = { [this.userpagelayers[0].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[0].layer_admin.layerURL, { layers: this.userpagelayers[0].layer_admin.layerIdent, format: this.userpagelayers[0].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[1].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[1].layer_admin.layerURL, { layers: this.userpagelayers[1].layer_admin.layerIdent, format: this.userpagelayers[1].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[2].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[2].layer_admin.layerURL, { layers: this.userpagelayers[2].layer_admin.layerIdent, format: this.userpagelayers[2].layer_admin.layerFormat, transparent: true})}
                break
            case 4:
                this.overlays = { [this.userpagelayers[0].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[0].layer_admin.layerURL, { layers: this.userpagelayers[0].layer_admin.layerIdent, format: this.userpagelayers[0].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[1].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[1].layer_admin.layerURL, { layers: this.userpagelayers[1].layer_admin.layerIdent, format: this.userpagelayers[1].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[2].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[2].layer_admin.layerURL, { layers: this.userpagelayers[2].layer_admin.layerIdent, format: this.userpagelayers[2].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[3].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[3].layer_admin.layerURL, { layers: this.userpagelayers[3].layer_admin.layerIdent, format: this.userpagelayers[3].layer_admin.layerFormat, transparent: true})}
                break
            case 5:
                this.overlays = { [this.userpagelayers[0].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[0].layer_admin.layerURL, { layers: this.userpagelayers[0].layer_admin.layerIdent, format: this.userpagelayers[0].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[1].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[1].layer_admin.layerURL, { layers: this.userpagelayers[1].layer_admin.layerIdent, format: this.userpagelayers[1].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[2].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[2].layer_admin.layerURL, { layers: this.userpagelayers[2].layer_admin.layerIdent, format: this.userpagelayers[2].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[3].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[3].layer_admin.layerURL, { layers: this.userpagelayers[3].layer_admin.layerIdent, format: this.userpagelayers[3].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[4].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[4].layer_admin.layerURL, { layers: this.userpagelayers[4].layer_admin.layerIdent, format: this.userpagelayers[4].layer_admin.layerFormat, transparent: true})}
                break
            case 6:
                this.overlays = { [this.userpagelayers[0].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[0].layer_admin.layerURL, { layers: this.userpagelayers[0].layer_admin.layerIdent, format: this.userpagelayers[0].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[1].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[1].layer_admin.layerURL, { layers: this.userpagelayers[1].layer_admin.layerIdent, format: this.userpagelayers[1].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[2].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[2].layer_admin.layerURL, { layers: this.userpagelayers[2].layer_admin.layerIdent, format: this.userpagelayers[2].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[3].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[3].layer_admin.layerURL, { layers: this.userpagelayers[3].layer_admin.layerIdent, format: this.userpagelayers[3].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[4].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[4].layer_admin.layerURL, { layers: this.userpagelayers[4].layer_admin.layerIdent, format: this.userpagelayers[4].layer_admin.layerFormat, transparent: true}),
                                [this.userpagelayers[5].layer_admin.layerName] : L.tileLayer.wms(this.userpagelayers[5].layer_admin.layerURL, { layers: this.userpagelayers[5].layer_admin.layerIdent, format: this.userpagelayers[5].layer_admin.layerFormat, transparent: true})}
                break
        }

        console.log(this.overlays)
        let n49 = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
            layers: 'nexrad-n0r-900913',
            format: 'image/png',
            transparent: true,
            attribution: "Weather data © 2012 IEM Nexrad"
        });
        
        n49.setOpacity(.5);
            //this.overlays = { nexrad: n49}
            //this.init_map()
        /* for (let i of this.userpagelayers) {
                n = i.layer_admin
                console.log(n.layerName)
                this.cl.name = n.layerName
                this.cl.URL = L.tileLayer.wms(n.layerURL, {layers: n.layerIdent, format: n.layerFormat, transparent: true})
            this.cls.push(this.cl)
            console.log(this.cl)
            console.log (this.cls)
            this.userpagelayers.length
            }
            console.log(this.userpagelayers.length)
            switch (this.userpagelayers.length) {
                case 1:
                    this.overlays = {[this.cls[0].name]: this.cls[0].URL}
                    break
                case 2:
                    this.overlays = {[this.cls[0].name]: this.cls[0].URL, [this.cls[1].name]: this.cls[1].URL}
                    break
                case 3:
                    this.overlays = {[this.cls[0].name]: this.cls[0].URL, [this.cls[1].name]: this.cls[1].URL, [this.cls[2].name]: this.cls[2].URL}
                    break
                case 4:
                    this.overlays = {[this.cls[0].name]: this.cls[0].URL, [this.cls[1].name]: this.cls[1].URL, [this.cls[2].name]: this.cls[2].URL, [this.cls[3].name]: this.cls[3].URL}
                    break
                case 5:
                    this.overlays = {[this.cls[0].name]: this.cls[0].URL, [this.cls[1].name]: this.cls[1].URL, [this.cls[2].name]: this.cls[2].URL, [this.cls[3].name]: this.cls[3].URL, [this.cls[4].name]: this.cls[4].URL}
            }*/
            //console.log (this.cls)
            //this.overlays = { [this.cls[0].name]: this.cls[1], [this.cls[2].name]: this.cls[3]}
            //console.log (this.overlays)
        
            //this.init_map()
                //this.cls.push(n)
            //    this.q += 1;
            //    console.log(this.q)
            //    let n = i.layer_admin
            //    let p = n.layerName
            //    console.log (p)
            //    this.layeron[this.q-1] = n.layerName
            //    //this.j[this.q] = L.tileLayer.wms(n.layerURL, { layers: n.layerIdent, format: n.layerFormat, transparent: true})
            //    this.overlays = { [p] : this.j}
            //    console.log (this.overlays)
            //    console.log (this.overlays[p])
            //    console.log (p)
            //}
    }
        
    public setUserPageLayers(page): void {
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
        this.addLayers();
        this.mapService.map.eachLayer(function (removelayer) {removelayer.remove()})
        console.log(this.mapService.baseMaps)
        this.mapService.map.addLayer(L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
        }))

        // Need to add the base layer back in.
        //this.mapService.map.removeControl(this.overlays);
        this.layercontrol.remove()

        //Not really necessary anymore
        this.layercontrol = L.control.layers(this.mapService.baseMaps, this.overlays, {position: 'bottomright'})
        this.layercontrol.addTo(this.mapService.map)
    }

        

    //Reads index of layer in dropdown, layeradmin, and if it is shown or not
    public toggleLayers(index, layers, checked) {
        console.log('Flags array: ' + this.userpagelayers[0].layerShown)
        this.layeradmin = layers
        //console.log ("Toggle Layers")
        //console.log (this.layeradmin)
        console.log (checked)
        console.log(index)
        if (checked == true) {
            //It may make sense to implement this using 'LayerGroup'
            this.currentlayer = (L.tileLayer.wms(this.layeradmin.layerURL, {
            layers: this.layeradmin.layerIdent,
            format: this.layeradmin.layerFormat,
            transparent: true,
            })).addTo(this._map)
            /*this.currentlayer = this.mapService.map.addLayer(L.tileLayer.wms(this.layeradmin.layerURL, {
            layers: this.layeradmin.layerIdent,
            format: this.layeradmin.layerFormat,
            transparent: true,
            }))*/ //this.currentlayer is 'Map' type, but to remove it must be 'Layer' type
            //this.layercontrol.remove()
            this.userpagelayers[index].layerShown = false
            //this.layercontrol.layers(this.mapService.baseMaps, this.mapService.overlays, {position: 'bottomright'})
        }

        else {
            console.log (checked)
            this._map.removeLayer(this.currentlayer)
            //console.log(this.currentlayer)
            this.userpagelayers[index].layerShown = true
        }

        //let layercontrol = L.control.layers(this.mapService.baseMaps, this.overlays, {position: 'bottomright'})
        //layercontrol.addTo(this.mapService.map);

        //this.mapService.map.addLayer(this.j)
        
    //this.mapService.map.eachLayer(function (layer) {
    //     console.log(layer)

    //});
    }

    public openjson (URL) {
        console.log("openjson started")
        this.http.get(URL)
            .map((response) => <any>response.json())
            .subscribe(data => this.objects = data, 
            () => (console.log(this.objects), this.loadjson())) //This is getting nothing
    }

    //Can't seem to find the import file in index
    /*public openkml (URL) {
          var _tile = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
          var k = new L.KML('http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/wms?service=wms&request=GetMap&version=1.1.1&format=application/vnd.google-earth.kml+xml&layers=Kokomo:Pipes&styles=Pipes&height=2048&width=2048&transparent=false&srs=EPSG:4326&format_options=AUTOFIT:true;KMATTR:true;KMPLACEMARK:false;KMSCORE:60;MODE:refresh;SUPEROVERLAY:false', {async: true})
          k.on("loaded", function(e) {
              //this._map.fitBounds(e.target.getBounds())
          })
          this._map.addLayer(k);
          this._map.addLayer(_tile)
          this._map.addControl(new L.Control.Layers({}, {'Track':_tile }))
    }*/

    public loadjson() {
        console.log(this.objects) //Undefined here as well as in openjson
    }

    ngAfterViewInit() {
        //this.markerComponent.Initialize();
        console.log('ngAfterViewInit');
    };
    ngOnDestroy() {
        console.log('ngOnDestroy')
    };
}
