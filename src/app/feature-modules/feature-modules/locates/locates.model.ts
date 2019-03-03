import * as ol from 'openlayers';

export class Locate {
    ticket: string;
    id: number;
    geom: string;
    tdate: string;
    ttime: string;
    subdivision: string;
    address: string;
    street: string;
    crossst: string;
    location: string;
    wtype: string;
    dfor: string;
    sdate: string;
    stime: string;
    priority: string;
    blasting: string;
    boring: string;
    railroad: string;
    emergency: string;
    duration: string;
    depth: string;
    company: string;
    ctype: string;
    coaddr: string;
    cocity: string;
    cozip: string;
    caller: string;
    callphone: string;
    contact: string;
    mobile: string;
    fax: string;
    email: string;
    closed: string;
    note: string;
    completedby: string;
}

export class locateStyles {
    public load = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            stroke: new ol.style.Stroke({
                color: '#fff'
            }),
            fill: new ol.style.Fill({
                color: '#3399CC'
            })
        }),
        // text: new ol.style.Text({
        //   text: '1',
        //   fill: new ol.style.Fill({
        //     color: '#fff'
        //   })
        // })
    });

    public current = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            stroke: new ol.style.Stroke({
                color: '#fff'
            }),
            fill: new ol.style.Fill({
                color: '#0000FF'
            })
        }),
        // text: new ol.style.Text({
        //   text: '1',
        //   fill: new ol.style.Fill({
        //     color: '#fff'
        //   })
        // })
    });

    public selected = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            stroke: new ol.style.Stroke({
                color: '#fff'
            }),
            fill: new ol.style.Fill({
                color: '#FF0000'
            })
        }),
        // text: new ol.style.Text({
        //   text: '1',
        //   fill: new ol.style.Fill({
        //     color: '#fff'
        //   })
        // })
    });

}
