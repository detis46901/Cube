import {Fill, Stroke, Circle, Style} from 'ol/style';
import { Injectable } from "@angular/core";
import { InstanceSettings } from '_models/module.model';
import VectorLayer from 'ol/layer/Vector';

export class locateConfig {
    visible: boolean
    expanded: boolean
    moduleSettings: InstanceSettings
    layerState: string
    boundaryLayer: VectorLayer
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
        { value: '1', closes: true, shortDescription: 'Marked', longDescription: 'Underground facilities in the proposed excavation area have been marked.', completesTicket: true, emailBody: 'We have found potential conflicts with the utility.  These potential conflicts have been marked.'},
        { value: '1A', closes: true, shortDescription: 'Marked with Exceptions - Do Not Excavate, High-Profile Utility',  longDescription: 'Do not excavate. A high-profile utility is in the area of the proposed excavation; the utility owner WILL attempt to contact you to schedule surveillance.', completesTicket: true, emailBody: 'There is a high profile conflict.  We will attempt to make contact to provide further details.'},
        { value: '1B', closes: true, shortDescription: 'Marked with Exceptions - High-Profile Utility', longDescription: 'A high-profile utility is in the area of the proposed excavation; the utility owner MAY attempt to contact you to schedule surveillance.', completesTicket: true, emailBody: 'THERE IS A SIGNIFICANT HIGH PROFILE UTILITY CONFLICT.  PLEASE RESPOND IMMEDIATELY.'},
        { value: '1C', closes: true, shortDescription: 'Not Marking - Work Done by Facility Owner', longDescription: 'Work Being Done by Facility Owner or Facility Owners’ Master Contractor is responsible for locating facilities.', completesTicket: true, emailBody: 'THERE IS A SIGNIFICANT HIGH PROFILE UTILITY CONFLICT.  PLEASE RESPOND IMMEDIATELY.'},
        { value: '2', closes: true, shortDescription: 'Clear', longDescription: 'No underground facilities are in the proposed excavation or design area.', completesTicket: true, emailBody: 'No underground City of Kokomo owned sanitary, storm, or power are in the area where the excavation will take place.'},
        { value: '3A', closes: true, shortDescription: 'Blocked Access', longDescription: 'Do not excavate until resolved. The locate technician could not gain access to property; the excavator must provide access and submit a new ticket.', completesTicket: true, emailBody: 'Locate technician could not gain access to property; call IN 811 to schedule access.'},
        { value: '3B', closes: false, shortDescription: 'Incorrect Address', longDescription: 'Do not excavate until resolved. Incorrect address information.  Contact Indiana 811.', completesTicket: true, emailBody: 'Incorrect address information. Call IN 811 to verify the information on the ticket.'},
        { value: '3C', closes: false, shortDescription: 'Delay Requested', longDescription: 'Do not excavate until resolved. Excavation site is unmarked; markings are delayed. The locate technician cannot mark within two full working days or by the requested start date and time, whichever is later. Per Indiana Law, the operator shall notify the excavator responsible of their determination and shall provide additional information.', completesTicket: true, emailBody: 'The locate cannot be marked with two full working days. We will make contact to request a new deadline.'},
        { value: '3D', closes: false, shortDescription: 'Unclear Description', longDescription: 'Do not excavate until resolved. The locate instructions are unclear.  Contact Indiana 811.', completesTicket: true, emailBody: 'Locate instructions are unclear. Call IN 811 to clarify where on the property you will be excavating and need the underground facilities located.'},
        { value: '3E', closes: true, shortDescription: 'Excavation Already Performed', longDescription: 'The excavator has performed or canceled the excavation prior to the locators’ arrival.', completesTicket: true, emailBody: 'The excavator has performed the excavation prior to the locator’s arrival.'},
        { value: '3F', closes: false, shortDescription: 'Unmarked - Line is untonable', longDescription: 'Do not excavate until resolved. The line is untonable and the utility has been notified to resolve the issue. Per Indiana Law, the operator shall notify the excavator responsible of their determination and shall provide additional information.', completesTicket: true, emailBody: 'The excavator has performed the excavation prior to the locator’s arrival.'},
        { value: '3G', closes: false, shortDescription: 'Unmarked - Ongoing', longDescription: 'The locate technician has partially marked an area but cannot mark the entire proposed excavation area within two full working days or by the requested start date and time, whichever is later. Per Indiana Law, the operator shall notify the excavator responsible of the operator’s determination and shall provide additional information. Do not excavate the proposed excavation area that has not been located.', completesTicket: true, emailBody: 'The excavator has performed the excavation prior to the locator’s arrival.'},
        { value: '4', closes: true, shortDescription: 'Private Line', longDescription: 'This is a private line and it is not the responsibility of the members of Indiana 811 to locate private facilities.', completesTicket: true, emailBody: 'Private Line - This is a private line and it is not the responsibility of the members of Indiana 811 to locate private facilities.'},
        { value: '5A', closes: true, shortDescription: 'Design Notice - Documents Provided', longDescription: 'Design Notice – Installation records, maps, or other documents have been provided.', completesTicket: true, emailBody: 'The excavator has performed the excavation prior to the locator’s arrival.'},
        { value: '5B', closes: true, shortDescription: 'Design Notice - Marked', longDescription: 'Design Notice – Underground facilities have been marked.', completesTicket: true, emailBody: 'The excavator has performed the excavation prior to the locator’s arrival.'},
        { value: '6A', closes: false, shortDescription: 'Joint Meet Conflict', longDescription: 'Your proposed meeting is in conflict, and we are unable to meet on site; the utility owner may attempt to contact you.', completesTicket: true, emailBody: 'The excavator has performed the excavation prior to the locator’s arrival.'},
        { value: '6B', closes: false, shortDescription: 'Join Meet Accepted', longDescription: 'Request accepted at stated date and time.', completesTicket: true, emailBody: 'The excavator has performed the excavation prior to the locator’s arrival.'},
        { value: '6C', closes: true, shortDescription: 'Joint Meet Complete', longDescription: 'The meeting has taken place.', completesTicket: true, emailBody: 'The excavator has performed the excavation prior to the locator’s arrival.'},
        { value: '7', closes: true, shortDescription: 'Damage', longDescription: 'Damage notification acknowledged.', completesTicket: true, emailBody: 'The excavator has performed the excavation prior to the locator’s arrival.'},
       
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
