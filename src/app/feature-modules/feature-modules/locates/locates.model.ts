import {Fill, Stroke, Circle, Style} from 'ol/style';
import { Injectable } from "@angular/core";

export class locateConfig {
    visible: boolean
    expanded: boolean
    moduleSettings: JSON
}

export class Locate {
    id: number = 0;
    ticket: string = "";
    cancel: boolean = false;
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
    disposition: string = "";
}

export class disItem {
    value: string;
    shortDescription: string;
    longDescription: string;
    completesTicket: boolean;
    emailBody: string;
}

//filter classes
export class disposition {
    disposition = [
        { value: '1', shortDescription: 'Marked', longDescription: 'Does conflict, underground facilities have been marked.', completesTicket: true, emailBody: 'We have found potential conflicts with the utility.  These potential conflicts have been marked.'},
        { value: '1A',shortDescription: 'Marked - Will Contact',  longDescription: 'High profile utility in conflict, utility owner will attempt to contact you to schedule surveillance.', completesTicket: true, emailBody: 'There is a high profile conflict.  We will attempt to make contact to provide further details.'},
        { value: '1B', shortDescription: 'Marked - Must Contact', longDescription: 'High-priority subsurface installation in conflict. Excavator MUST notify the member of the excavation or demolition start date and time.', completesTicket: true, emailBody: 'THERE IS A SIGNIFICANT HIGH PROFILE UTILITY CONFLICT.  PLEASE RESPOND IMMEDIATELY.'},
        { value: '2', shortDescription: 'Clear', longDescription: 'No underground facilities are in the area where the excavation will take place.', completesTicket: true, emailBody: 'No underground City of Kokomo owned sanitary, storm, or power are in the area where the excavation will take place.'},
        { value: '3A', shortDescription: 'Blocked Access', longDescription: '3A : Locate technician could not gain access to property; call IN 811 to schedule access.', completesTicket: true, emailBody: 'Locate technician could not gain access to property; call IN 811 to schedule access.'},
        { value: '3B', shortDescription: 'Incorrect Address', longDescription: 'Incorrect address information. Call IN 811 to verify the information on the ticket.', completesTicket: true, emailBody: 'Incorrect address information. Call IN 811 to verify the information on the ticket.'},
        { value: '3C', shortDescription: 'Delay Requested', longDescription: 'Marking delay requested by locate technician and agreed to by excavator per agreement. Excavation site is unmarked. The locate technician cannot mark within two full working days. The excavator was contacted and a new deadline was scheduled.', completesTicket: false, emailBody: 'The locate cannot be marked with two full working days. We will make contact to request a new deadline.'},
        { value: '3D', shortDescription: 'Unclear Description', longDescription: 'Locate instructions are unclear. Call IN 811 to clarify where on the property you will be excavating and need the underground facilities located.', completesTicket: true, emailBody: 'Locate instructions are unclear. Call IN 811 to clarify where on the property you will be excavating and need the underground facilities located.'},
        { value: '3E', shortDescription: 'Work Already Completed', longDescription: 'The excavator has performed the excavation prior to the locator’s arrival.', completesTicket: true, emailBody: 'The excavator has performed the excavation prior to the locator’s arrival.'},
        { value: '4', shortDescription: 'Private Line', longDescription: 'Private Line - This is a private line and it is not the responsibility of the members of Indiana 811 to locate private facilities.', completesTicket: true, emailBody: 'Private Line - This is a private line and it is not the responsibility of the members of Indiana 811 to locate private facilities.'}
    ]
}

@Injectable()
export class locateStyles {
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
        zIndex: 100
        // text: new ol.style.Text({
        //   text: '1',
        //   fill: new ol.style.Fill({
        //     color: '#fff'
        //   })
        // })
    });

}
