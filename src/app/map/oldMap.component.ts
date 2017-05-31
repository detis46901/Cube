//This file holds a large amount of code from original write-ups of the map.component.ts file, which is now unused.
//There were other class variables etc. here that were removed on git commit SHA: 6a68ecc6006a64c59b2ac0153c6891a58f31f670. Title: "Added leaflet-plugins folder..."
/*
    public cls: ControlLayers[] = []
    public cl = new ControlLayers

    this.layercontrol = L.control.layers(this.mapService.baseMaps, this.overlays, {position: 'bottomright'})
    this.layercontrol.addTo(this._map);

    //Under init_map()
    this.geocoder.getCurrentLocation()
        .subscribe(
            location => map.panTo([location.latitude, location.longitude]),
            err => console.error(err)
        ); 

     public addLayers() {
        console.log("addLayers Started")
        //console.log(this.layeradmin);
        //console.log (this.mapService.map.addLayer)
        //this.mapService.openjson('http://foster2.cityofkokomo.org:8080/geoserver/sf/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=sf:archsites&maxFeatures=50&outputFormat=application/json')

        

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


        //Has not been used for a long time, leaving here just in case for whatever reason
        /*let n49 = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
            layers: 'nexrad-n0r-900913',
            format: 'image/png',
            transparent: true,
            attribution: "Weather data © 2012 IEM Nexrad"
        });
        L.tileLayer('http://foster2.cityofkokomo.org:8080/geoserver/Kokomo/wms?service=wms&request=GetMap&version=1.1.1&format=application/vnd.google-earth.kml+xml&layers=Kokomo:Pipes&styles=Pipes&height=2048&width=2048&transparent=false&srs=EPSG:4326&format_options=AUTOFIT:true;KMATTR:true;KMPLACEMARK:false;KMSCORE:60;MODE:refresh;SUPEROVERLAY:false').addTo(this._map);       
        n49.setOpacity(.5);
        this.overlays = { nexrad: n49}
        this.init_map()
        for (let i of this.userpagelayers) {
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
        }
        console.log (this.cls)
        this.overlays = { [this.cls[0].name]: this.cls[1], [this.cls[2].name]: this.cls[3]}
        console.log (this.overlays)
        this.init_map()
        this.cls.push(n)
        this.q += 1;
        console.log(this.q)
        let n = i.layer_admin
        let p = n.layerName
        console.log (p)
        this.layeron[this.q-1] = n.layerName
        this.j[this.q] = L.tileLayer.wms(n.layerURL, { layers: n.layerIdent, format: n.layerFormat, transparent: true})
        this.overlays = { [p] : this.j}
        console.log (this.overlays)
        console.log (this.overlays[p])
        console.log (p)
        }
    }

    //under changePages()
    this.mapService.map.removeControl(this.overlays);
    this.layercontrol.remove()
    this.layercontrol = L.control.layers(this.mapService.baseMaps, this.overlays, {position: 'bottomright'})
    this.layercontrol.addTo(this.mapService.map)

    //under toggleLayers() if block
    this.currentlayer = this.mapService.map.addLayer(L.tileLayer.wms(this.layeradmin.layerURL, {
        layers: this.layeradmin.layerIdent,
        format: this.layeradmin.layerFormat,
        transparent: true,
    }))

    //Under toggleLayers()
    //let layercontrol = L.control.layers(this.mapService.baseMaps, this.overlays, {position: 'bottomright'})
        //layercontrol.addTo(this.mapService.map);

        //this.mapService.map.addLayer(this.j)
        
    //this.mapService.map.eachLayer(function (layer) {
    //     console.log(layer)

    //});
*/