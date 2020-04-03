import { DataField } from '../../../_models/layer.model'

export class DataFormConfig {
    schema: string
    dataTable: string
    logTable: string
    dataForm: DataField[]
    editMode: boolean
}