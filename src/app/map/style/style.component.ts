import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleChange } from '@angular/material';
import { MapConfig } from '../models/map.model';
import { NULL_INJECTOR } from '@angular/core/src/render3/component';
import { MapService } from '../services/map.service';
import { SQLService } from '../../../_services/sql.service';
import { MyCubeField } from '_models/layer.model';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { StyleService } from '../services/style.service';
import { LayerService } from '../../../_services/_layer.service';

@Component({
    selector: 'styletoolbar',
    templateUrl: './style.component.html',
    styleUrls: ['./style.component.scss']
})
export class StyleComponent implements OnInit {
    @Input() mapConfig: MapConfig;
    //style stuff
    private layer: ol.layer.Vector = null;
    public value: number
    public styleType: string
    public styleLabel: string
    public styleColumn = new MyCubeField
    public styleOperator: string
    public styleValue: string | boolean
    public columns: MyCubeField[]
    public operators: { value: string; viewValue: string; }[]
    colors = [
        { value: '#FF2D2D', viewValue: 'Red' },
        { value: '#FF7800', viewValue: 'Orange' },
        { value: '#F3FF00', viewValue: 'Yellow' },
        { value: '#4DFF00', viewValue: 'Green' },
        { value: '#0023FF', viewValue: 'Blue' },
        { value: '#8000FF', viewValue: 'Purple' },
        { value: '#F000FF', viewValue: 'Pink' },
        { value: '#000000', viewValue: 'Black' },
    ]
    booleanoperators = [
        { value: 'isEqual', viewValue: 'Equal' },
        { value: 'isNotEqual', viewValue: 'Not Equal' },
        { value: 'isGreaterThan', viewValue: 'Greater Than' },
        { value: 'isLessThan', viewValue: 'Less Than' },
        { value: 'contains', viewValue: 'Contains' }
    ];


    constructor(private mapService: MapService, private styleService: StyleService,
        private sqlSerivce: SQLService, private userPageLayerService: UserPageLayerService,
        private layerService: LayerService) { }

    ngOnInit() {
        try {
            if (this.mapConfig.currentLayer.style['filter']['column'] != "" || this.mapConfig.currentLayer.style['filter']['column'] != null) {
                this.styleColumn['field'] = this.mapConfig.currentLayer.style['filter']['column']
                this.styleOperator = this.mapConfig.currentLayer.style['filter']['operator']
                this.styleColumn['value'] = this.mapConfig.currentLayer.style['filter']['value']
            }
        }
        catch (e) {
            console.log('No UserPageLayer Style');
        }
        this.sqlSerivce.GetSchema(this.mapConfig.currentLayer.layerID)
            .subscribe((data) => {
                this.columns = data.slice(2, data.length)

                //this.styleColumn.type = "boolean" //needs to be dynamic
                this.updateColumn()
            })
    }

    private disableCheck(): boolean {
        if ((this.styleColumn.field == "" || this.styleColumn.field == null) && (this.styleOperator == "" || this.styleOperator == null) && (this.styleColumn.value == "" || this.styleColumn.value == null)) {
            return true;
        }
        else if ((this.styleColumn.field != "" || this.styleColumn.field != null) && (this.styleOperator != "" || this.styleOperator != null) && (this.styleColumn.value != "" || this.styleColumn.value != null)) {
            return true;
        }
        else {
            return false;
        }
    }

    private updateColumn() {
        this.styleValue = ""
        if (this.styleColumn['field']) {
            this.columns.forEach(x => {
                if (this.styleColumn['field'] == x.field) {
                    this.styleColumn.type = x.type
                }
            })
        }
        this.operators = this.getoperator(this.styleColumn.type)
    }

    // closes the style menu
    private close() {
        this.mapConfig.styleShow = false
    }

    // applies the style to the map and only shows the appllicable items //not fully working
    private applyStyle() {
        if (this.styleColumn['field'] == "" || this.styleColumn['field'] == null) {
            this.mapConfig.styleOn = false;
        }
        else {
            this.mapConfig.styleOn = true
        }
        this.mapConfig.currentLayer.style['filter']['column'] = this.styleColumn['field']
        this.mapConfig.currentLayer.style['filter']['operator'] = this.styleOperator
        this.mapConfig.currentLayer.style['filter']['value'] = this.styleColumn.value
        if (this.styleValue == "true") {
            this.mapConfig.currentLayer.style['filter']['value'] = true
        }
        if (this.styleValue == "false") {
            this.mapConfig.currentLayer.style['filter']['value'] = false
        }
        this.mapService.runInterval(this.mapConfig.currentLayer, this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder - 1])
    }

    // Saves the current styles to the current user page
    private saveToPage(): void {
        if (!this.mapConfig.currentLayer.style) {
            this.mapConfig.currentLayer.style = this.mapConfig.currentLayer.layer.defaultStyle
        }
        this.mapConfig.currentLayer.style['filter']['column'] = this.styleColumn['field'];
        this.mapConfig.currentLayer.style['filter']['operator'] = this.styleOperator;
        this.mapConfig.currentLayer.style['filter']['value'] = this.styleColumn.value;
        this.userPageLayerService
            .Update(this.mapConfig.currentLayer)
            .subscribe((data) => {
                console.log(data)
            })
    }

    // saves the current style to the layer for everyone to view and edit
    private saveToLayer(): void {
        this.mapConfig.currentLayer.layer.defaultStyle = this.mapConfig.currentLayer.style;
        this.mapConfig.currentLayer.layer.defaultStyle['filter']['column'] = this.styleColumn['field'];
        this.mapConfig.currentLayer.layer.defaultStyle['filter']['operator'] = this.styleOperator;
        this.mapConfig.currentLayer.layer.defaultStyle['filter']['value'] = this.styleColumn.value;
        this.mapConfig.currentLayer.layer.defaultStyle['filter']['value'] = this.styleColumn.value;
        this.layerService
            .Update(this.mapConfig.currentLayer.layer)
            .subscribe((data) => {
                console.log(data)
            })
    }

    // clears the entry fields and sets them to bank strings
    private clear(): void {
        this.styleColumn.field = "";
        this.styleOperator = "";
        this.styleColumn.value = "";
        this.styleValue = "";
        this.applyStyle()
    }

    // private clearStyle() {
    //   this.mapConfig.StyleOn = false
    //   this.mapConfig.currentLayer.layer.defaultStyle['filter']['column'] = null
    //   this.mapConfig.currentLayer.layer.defaultStyle['filter']['operator'] = null
    //   this.mapConfig.currentLayer.layer.defaultStyle['filter']['value'] = null
    //   this.mapConfig.currentLayer.style['filter']['column'] = null
    //   this.mapConfig.currentLayer.style['filter']['operator'] = null
    //   this.mapConfig.currentLayer.style['filter']['value'] = null

    //   this.mapService.runInterval(this.mapConfig.currentLayer, this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder - 1])
    // }

    getoperator(tp: string) {
        switch (tp) {
            case "boolean": {
                return ([
                    { value: 'isEqual', viewValue: 'Equal' },
                    { value: 'isNotEqual', viewValue: 'Not Equal' }
                ])
            }
            case "text": {
                return ([
                    { value: 'isEqual', viewValue: 'Equal' },
                    { value: 'isNotEqual', viewValue: 'Not Equal' },
                    { value: 'contains', viewValue: 'Contains' }
                ])
            }
            case "date": {
                return ([
                    { value: 'isEqual', viewValue: 'Equal' },
                    { value: 'isNotEqual', viewValue: 'Not Equal' },
                    { value: 'isGreaterThan', viewValue: 'After' },
                    { value: 'isLessThan', viewValue: 'Before' }
                ])
            }
            case "double precision": {
                return ([
                    { value: 'isEqual', viewValue: 'Equal' },
                    { value: 'isNotEqual', viewValue: 'Not Equal' },
                    { value: 'isGreaterThan', viewValue: 'Greater Than' },
                    { value: 'isLessThan', viewValue: 'Less Than' }
                ])
            }
        }
    }
}
