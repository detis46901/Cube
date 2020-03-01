import { Component, OnInit, Input } from '@angular/core';
import { MapConfig } from '../models/map.model';
import { MapService } from '../services/map.service';
//import { SQLService } from '../../../_services/sql.service';
import { MyCubeService } from '../../map/services/mycube.service'
import { MyCubeField, UserPageLayer, MyCubeConstraint } from '_models/layer.model';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { StyleService } from '../services/style.service';
import { LayerService } from '../../../_services/_layer.service';
import { filterOperators, MyCubeFilterFields } from '../../../_models/style.model';

@Component({
    selector: 'filtertoolbar',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss'],
})


export class FilterComponent implements OnInit {
    @Input() mapConfig: MapConfig;
    public value: number
    public filterType: string
    public filterLabel: string
    public filterColumn = new MyCubeField
    public filterOperator: string
    public filterValue: string | boolean
    public columns: MyCubeField[]
    public operators: { value: string; viewValue: string; }[]
    public modelOperator = new filterOperators
    public admin: boolean = false
    public options: string[] = ['One', 'Two', 'Three'];


    constructor(private mapService: MapService, private myCubeSerivce: MyCubeService, private userPageLayerService: UserPageLayerService,
        private layerService: LayerService) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.admin = currentUser && currentUser.admin;

    }

    ngOnInit() {
        try {
            if (this.mapConfig.currentLayer.style.filter.column != "") {
                this.filterColumn.field = this.mapConfig.currentLayer.style.filter.column
                this.filterOperator = this.mapConfig.currentLayer.style.filter.operator
            }
        }
        catch (e) {
            this.mapConfig.currentLayer.style.filter = new MyCubeFilterFields
            this.mapConfig.currentLayer.style.filter.column = ""
            this.mapConfig.currentLayer.style.filter.operator = ""
            this.mapConfig.currentLayer.style.filter.value = ""
        }
        this.myCubeSerivce.GetSchema('mycube', 't' + this.mapConfig.currentLayer.layerID)
            .subscribe((data) => {
                this.columns = data[0].slice(2, data[0].length)
                this.myCubeSerivce.getConstraints('mycube', 't' + this.mapConfig.currentLayer.layerID)
                    .subscribe((constraints) => {
                            this.columns = this.myCubeSerivce.setConstraints(this.columns, constraints)
                        this.updateColumn()
                        this.filterColumn.value = this.mapConfig.currentLayer.style.filter.value
                })
            })
    }

    public disableCheck(): boolean {
        if ((this.filterColumn.field == "" || this.filterColumn.field == null) && (this.filterOperator == "" || this.filterOperator == null) && (this.filterColumn.value == "" || this.filterColumn.value == null)) {
            return true;
        }
        else if ((this.filterColumn.field != "" || this.filterColumn.field != null) && (this.filterOperator != "" || this.filterOperator != null) && (this.filterColumn.value != "" || this.filterColumn.value != null)) {
            return true;
        }
        else {
            return false;
        }
    }

    public updateColumn() {
        this.filterValue = ""
        if (this.filterColumn.field) {
            this.columns.forEach(x => {
                if (this.filterColumn.field == x.field) {
                    this.filterColumn.type = x.type
                    this.filterColumn.constraints = x.constraints
                    this.filterColumn.value = null
                }
            })
        }
        this.operators = this.getoperator(this.filterColumn.type)
    }

    // closes the filter menu
    public close() {
        this.mapConfig.filterShow = false
    }

    // applies the filter to the map and only shows the appllicable items //not fully working
    public applyFilter() {
        if (this.filterColumn.field == "" || this.filterColumn.field == null) {
            this.mapConfig.filterOn = false;
        }
        else {
            this.mapConfig.filterOn = true
        }
        if (this.mapConfig.currentLayer.style.filter == undefined) {
            this.mapConfig.currentLayer.style.filter.column = ""
            this.mapConfig.currentLayer.style.filter.operator = ""
            this.mapConfig.currentLayer.style.filter.value = ""
        }

        this.mapConfig.currentLayer.style.filter.column = this.filterColumn.field
        this.mapConfig.currentLayer.style.filter.operator = this.filterOperator
        this.mapConfig.currentLayer.style.filter.value = this.filterColumn.value
        if (this.filterValue == "true") {
            this.mapConfig.currentLayer.style.filter.value = true
        }
        if (this.filterValue == "false") {
            this.mapConfig.currentLayer.style.filter.value = false
        }
        this.mapService.runInterval(this.mapConfig.currentLayer)
    }

    // Saves the current styles to the current user page
    public saveToPage(): void {
        if (!this.mapConfig.currentLayer.style) {
            this.mapConfig.currentLayer.style = this.mapConfig.currentLayer.layer.defaultStyle
        }
        let updateUPL = new UserPageLayer
        updateUPL.ID = this.mapConfig.currentLayer.ID
        updateUPL.style = this.mapConfig.currentLayer.style
        updateUPL.style.filter.column = this.filterColumn.field;
        updateUPL.style.filter.operator = this.filterOperator;
        updateUPL.style.filter.value = this.filterColumn.value;

        this.userPageLayerService
            .Update(updateUPL)
            .subscribe((data) => {
                console.log(data)
            })
    }

    // saves the current filter to the layer for everyone to view and edit
    public saveToLayer(): void {
        this.mapConfig.currentLayer.layer.defaultStyle = this.mapConfig.currentLayer.style;
        this.mapConfig.currentLayer.layer.defaultStyle.filter.column = this.filterColumn.field;
        this.mapConfig.currentLayer.layer.defaultStyle.filter.operator = this.filterOperator;
        this.mapConfig.currentLayer.layer.defaultStyle.filter.value = this.filterColumn.value;
        this.mapConfig.currentLayer.layer.defaultStyle.filter.value = this.filterColumn.value;
        this.layerService
            .Update(this.mapConfig.currentLayer.layer)
            .subscribe((data) => {
                console.log(data)
            })
    }

    // clears the entry fields and sets them to bank strings
    public clear(): void {
        this.filterColumn.field = "";
        this.filterOperator = "";
        this.filterColumn.value = "";
        this.filterValue = "";
        this.applyFilter()
    }

    getoperator(tp: string) {
        switch (tp) {
            case "boolean": {
                return (this.modelOperator.booleanOperators)
            }
            case "text": {
                return (this.modelOperator.textOperators)
            }
            case "date": {
                return (this.modelOperator.dateOperators)
            }
            case "double precision": {
                return (this.modelOperator.doublePrecisionOperators)
            }
            case "integer": {
                return (this.modelOperator.integerOperators)
            }
        }
    }
}
