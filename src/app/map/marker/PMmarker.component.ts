import {Component} from "@angular/core";
import {MapService} from "../services/map.service";
import * as L from "leaflet";


@Component({
    selector: "pmmarker",
    templateUrl: "./pmmarker.component.html",
    styleUrls: ["./pmmarker.component.less", "../../styles/main.less"],
    providers: []
})
export class PMMarkerComponent {
    editing: boolean;
    removing: boolean;
    markerCount: number;
    map: L.Map;

    geoFlag: boolean;
    geoArray: Array<any>;
    markerList: Array<L.Marker>;

    constructor(private mapService: MapService) {
        this.editing = false;
        this.removing = false;
        this.markerCount = 0;
    }

    ngOnInit() {
        //this.mapService.disableLeafletMouseEvent("add-marker");
        //this.mapService.disableLeafletMouseEvent("remove-marker");
    }

    Initialize() {
      // define toolbar options
var options = {
    position: 'topleft', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
    drawMarker: true,  // adds button to draw markers
    drawPolyline: true,  // adds button to draw a polyline
    drawRectangle: true,  // adds button to draw a rectangle
    drawPolygon: true,  // adds button to draw a polygon
    drawCircle: true,  // adds button to draw a cricle
    cutPolygon: true,  // adds button to cut a hole in a polygon
    editMode: true,  // adds button to toggle edit mode for all layers
    removalMode: true   // adds a button to remove layers
};

// add leaflet.pm controls to the map

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
