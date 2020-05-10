import {Fill, Stroke, Circle, Style} from 'ol/style';
import { UserPageLayer, MyCubeField, MyCubeComment } from '_models/layer.model';
import Feature from 'ol/Feature';
import VectorLayer from "ol/layer/Vector";
import VectorSource from 'ol/source/Vector';
import { defaults as defaultInteractions, Modify, Draw } from 'ol/interaction';
import { DataFormConfig, LogFormConfig, LogField } from '../../../shared.components/data-component/data-form.model'
import { DataFormService } from '../../../shared.components/data-component/data-form.service'

export class WOConfig {
    moduleInstanceID: number
    layer: UserPageLayer
    layerState: string
    expanded: boolean
    moduleName: string
    moduleSettings: JSON
    filter: string = `"completed" IS Null`
    label: string;
    list = new Array<WorkOrder>()
    tab: string
    selectedWO: WorkOrder
    editWO = new WorkOrder
    selectedWOComments: MyCubeComment[]
    autoShow: boolean = true
    //selectedItemLog = new LogFormConfig
    linkedField: string
    editRecordDisabled: boolean = true
    showLog: boolean = false
    Mode: string = "None" //Add, Edit, None
    vectorSource = new VectorSource()
    vectorLayer = new VectorLayer()
    modify: Modify
    modkey: any
    WOTypes: WOType[]
    assignedTo: assignedTo[]
    sortType = new SortType
    itemDataForm = new DataFormConfig
}

export class WorkOrder {
    id: number = 0
    geom: string = ""
    WONumber: string
    created: Date
    createdBy: number
    description: number
    feature: Feature
    assignedTo: string
    address: string = ""
    WOTypeID: number
    assignNote: string
    priority: string = "Normal"
    completed: Date
    WOLog = new LogFormConfig
}

export class WOType {
    id: number
    name: string
    defaultAssignedTo: string
}

export class assignedTo {
  id: number
  name: string
  fullName: string
}

export class SortType {
  name: string = 'Address'
  field: string = 'address'
}

// export class WOStyles {
//     public load = new Style({
//         image: new Circle({
//             radius: 10,
//             stroke: new Stroke({
//                 color: '#fff'
//             }),
//             fill: new Fill({
//                 color: '#3399CC'
//             })
//         }),
//         // text: new ol.style.Text({
//         //   text: '1',
//         //   fill: new ol.style.Fill({
//         //     color: '#fff'
//         //   })
//         // })
//     });

//     public current = new Style({
//         image: new Circle({
//             radius: 10,
//             stroke: new Stroke({
//                 color: '#fff'
//             }),
//             fill: new Fill({
//                 color: '#0000FF'
//             })
//         }),
//         // text: new ol.style.Text({
//         //   text: '1',
//         //   fill: new ol.style.Fill({
//         //     color: '#fff'
//         //   })
//         // })
//     });

//     public selected = new Style({
//         image: new Circle({
//             radius: 10,
//             stroke: new Stroke({
//                 color: '#fff'
//             }),
//             fill: new Fill({
//                 color: '#FF0000'
//             })
//         }),
//         zIndex: 100
//         // text: new ol.style.Text({
//         //   text: '1',
//         //   fill: new ol.style.Fill({
//         //     color: '#fff'
//         //   })
//         // })
//     });

//}
