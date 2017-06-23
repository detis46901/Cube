import {Component} from "@angular/core";
import {MapService} from "../services/map.service";
import {Map, MouseEvent, Marker} from "leaflet";


@Component({
    selector: "marker",
    templateUrl: "./marker.component.html",
    styleUrls: ["./marker.component.less", "../../styles/main.less"],
    providers: []
})
export class MarkerComponent {
    editing: boolean;
    removing: boolean;
    markerCount: number;
    map: Map;

    geoFlag: boolean;
    geoArray: Array<any>;
    markerList: Array<L.Marker>;

    constructor(private mapService: MapService) {
        this.editing = false;
        this.removing = false;
        this.markerCount = 0;
    }

    ngOnInit() {
        //this.mapService.disableMouseEvent("add-marker");
        //this.mapService.disableMouseEvent("remove-marker");
    }

    Initialize() {
        this.mapService.map.on("click", (e: MouseEvent) => {
            if (this.editing) {
                let marker = L.marker(e.latlng, {
                   /* icon: L.icon({
                        //className: 'fa fa-map-marker fa'
                        iconUrl: "../images/marker-icon.png",
                        shadowUrl: "../../images/marker-shadow.png"
                    }),*/
                    draggable: true
                })
                .bindPopup("Marker #" + (this.markerCount + 1).toString(), {
                    offset: L.point(12, 6)
                })
                .addTo(this.mapService.map)
                .openPopup();

                this.markerCount += 1;

                marker.on("click", (event: MouseEvent) => {
                    if (this.removing) {
                        this.mapService.map.removeLayer(marker);
                        this.markerCount -= 1;
                    }
                });
            }
        });
    }

    toggleEditing() {
        this.editing = !this.editing;

        if (this.editing && this.removing) {
            this.removing = false;
        }
    }

    toggleRemoving() {
        this.removing = !this.removing;

        if (this.editing && this.removing) {
            this.editing = false;
        }
    }

    //6/23/17 parse this out and take what can be taken out of this from the map component
    renderGeoJSON (flag, URL) {

        let props = Array();
        let len: number;
        let array = Array();
        let j: JSON;

        //Function that maps GeoJSON data to corresponding marker click events, and extrapolates feature's property names from JSON
        function onEach (feature, layer) {
            let exec: any;
            let data = '<p>';
            
            //First iteration exclusive
            if(props[0] == null) {
                props = JSON.stringify(feature.properties).split(',')
                len = props.length
                props[0] = props[0].substr(1)
                props[len-1] = props[len-1].substring(0,props[len-1].indexOf('}'))

                //Cleanup property names array values to simple plain-text string values
                for(var i=0; i<len; i++) {
                    props[i]=props[i].substring(1,props[i].indexOf('"', 1))
                }
            }

            for(var i=0; i<len; i++) {
                exec = eval("feature.properties." + props[i])
                data = data + props[i] + ": " + exec + "<br>"
            }
            data = data + "</p>"

            array.push(feature['properties'])
            layer.bindPopup(data)
            this.geoProp = props;            
        }

        for (let i=0; i<this.geoArray.length; i++) {
            let curMark = L.marker(this.geoArray[i]._latlng)
            this.markerList.push(curMark)
        }

        var geoMap = this.mapService.map;
        var foo = Array();
        
        //observer variable used in GeoJSON subscription, function parameter after value in L.geoJSON uses onEachFeature to allow clicking of features
        var observer = {
            next: function(value) {
                this.geoLayerGroup = L.geoJSON(value, {
                    onEachFeature: onEach
                })
                .addTo(geoMap)
                this.geoArray = this.geoLayerGroup.getLayers()
                let len = this.geoArray.length

                this.geoLayerGroup.on('click', this.onGeoMarkerClick(this.geoArray))                
            }
        
        }
        console.log(observer)

        //6/23/17 this probably belongs in the map component
        //Add geoJSON if none exists yet
        /*if(!flag) {
            console.log("if")         
            
            //Uses defined variable "observer" to subscribe to the wfsservice loadWFS observable, which finds the given URL below on Geoserver
            this.wfsservice.loadWFS(URL)
                .subscribe(observer)

            this.geoFlag = true
        }

        //remove geoJSON layer from map if it exists on map
        else {
            this.setUserPageLayers(this.defaultpage)
            this.geoFlag = false
        }*/

        this.geoArray = array
    }

    public onGeoMarkerClick(arr) {
        
    }
}
