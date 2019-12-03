import {Fill, Stroke, Circle, Style} from 'ol/style';
import Text from 'ol/style/Text';

export class Locate {
    ticket: string = "";
    id: number = 0;
    geom: string = "";
    tdate: string = "";
    ttime: string = "";
    subdivision: string = "";
    address: string = "";
    street: string = "";
    crossst: string = "";
    location: string = "";
    wtype: string = "";
    dfor: string = "";
    sdate: string = "";
    stime: string = "";
    priority: string = "";
    blasting: string = "";
    boring: string = "";
    railroad: string = "";
    emergency: string = "";
    duration: string = "";
    depth: string = "";
    company: string = "";
    ctype: string = "";
    coaddr: string = "";
    cocity: string = "";
    cozip: string = "";
    caller: string = "";
    callphone: string = "";
    contact: string = "";
    mobile: string = "";
    fax: string = "";
    email: string = "";
    closed: string = "";
    note: string = "";
    completedby: string = "";
}

export class SDSStyles {
    public load = new Style({
        image: new Circle({
            radius: 10,
            stroke: new Stroke({
                color: '#fff'
            }),
            fill: new Fill({
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

    public current = new Style({
        image: new Circle({
            radius: 10,
            stroke: new Stroke({
                color: '#fff'
            }),
            fill: new Fill({
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

    public selected = new Style({
        image: new Circle({
            radius: 10,
            stroke: new Stroke({
                color: '#fff'
            }),
            fill: new Fill({
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
