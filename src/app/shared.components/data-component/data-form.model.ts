//import { DataField } from '../../../_models/layer.model'

export class DataFormConfig {
    schema: string
    dataTableTitle: string
    dataTable: string
    logTable: string
    rowID: string | number
    userID: number
    dataForm: DataField[]
    visible: boolean
    expanded: boolean = true
    editMode: boolean
}

export class DataField {
    field: string;
    type: string;
    description?: string;
    value?: any;
    visible: boolean = true;
    changed?: boolean;
    links?: any[]
    constraints? = new Array<DataFieldConstraint>()
}

export class DataFieldConstraint {
    name: string | number
    option: string
}

export class LogFormConfig {
    schema: string
    logTableTitle: string
    logTable: string
    logForm = new Array<LogField>()
    userID: number
    dataFormID: string
    visible: boolean
    showAuto: boolean
}
export class LogField {
    id: number;
    schema?: string;
    logTable?: string;
    userid: number;
    firstName: string;
    lastName: string;
    comment: string = "";
    geom: string;
    featureid: string | number;
    filename?: string;
    file?: File = null;
    auto: boolean;
    createdat: Date;
    canDelete: boolean;
}