import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'layer-controls',
  templateUrl: './layer-controls.component.html',
  styleUrls: ['./layer-controls.component.less']
})
export class LayerControlsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  /*setUserPageLayers(page): void {
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
    }

    //this needs to be set up for every layer
    openFeatureInfo() {
        let ms_url="http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/wms";
        this._map.on('click', (event: MouseEvent) => {
            let BBOX = this._map.getBounds().toBBoxString();
            let WIDTH = this._map.getSize().x;
            let HEIGHT = this._map.getSize().y;
            let X = this._map.layerPointToContainerPoint(event.layerPoint).x;
            let Y = Math.trunc(this._map.layerPointToContainerPoint(event.layerPoint).y);
            let IDENT = this.currIdent
            var URL = ms_url + '?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetFeatureInfo&LAYERS='+IDENT+'&QUERY_LAYERS='+IDENT+'&BBOX='+BBOX+'&FEATURE_COUNT=1&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A4326&X='+X+'&Y='+Y;
            this.wfsservice.getfeatureinfo(URL)
                .subscribe((data: any) => console.log(data))
        })
        this._map.on('mousemove', (event: MouseEvent) => {
            //change cursor here?
        })
    }*/

}
