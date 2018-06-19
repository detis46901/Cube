import { Component, OnInit, Input, HostBinding, NgModule, ModuleWithProviders, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleChange } from '@angular/material';
import { MapConfig } from '../models/map.model'
import { NULL_INJECTOR } from '@angular/core/src/render3/component';
import { MapService } from '../services/map.service';
import { SQLService } from '../../../_services/sql.service'
import { MyCubeField } from '_models/layer.model';
import { UserPageLayerService } from '../../../_services/_userPageLayer.service';
import { StyleService } from '../services/style.service'
import { LayerService } from '../../../_services/_layer.service';



//import { MangolMap } from './../../core/_index';

declare var ol: any;
//import { MangolConfigFilterItem } from '../../interfaces/mangol-config-toolbar.interface';


@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {
  @Input() mapConfig: MapConfig;
  //filter stuff
  private layer: ol.layer.Vector = null;
  public value: number
  public filterType: string
  public filterLabel: string
  public filterColumn = new MyCubeField
  public filterOperator: string
  public filterValue: string | boolean
  public columns: MyCubeField[]
  public operators: { value: string; viewValue: string; }[]
  booleanoperators = [
    { value: 'isEqual', viewValue: 'Equal' },
    { value: 'isNotEqual', viewValue: 'Not Equal' },
    { value: 'isGreaterThan', viewValue: 'Greater Than'},
    { value: 'isLessThan', viewValue: 'Less Than'},
    { value: 'contains', viewValue: 'Contains'}
  ];

  constructor(private mapService: MapService, private styleService: StyleService,private sqlSerivce: SQLService, private userPageLayerService: UserPageLayerService, private layerService: LayerService) {
  }

  ngOnInit() {
   try {
      if (this.mapConfig.currentLayer.style['filter']['column'] != "") {
        this.filterColumn['field'] = this.mapConfig.currentLayer.style['filter']['column']
        this.filterOperator = this.mapConfig.currentLayer.style['filter']['operator']
        this.filterColumn['value'] = this.mapConfig.currentLayer.style['filter']['value']
      }
    }
    catch(e) {
      console.log('No UserPageLayer Filter');
    }

    this.sqlSerivce.GetSchema(this.mapConfig.currentLayer.layerID)
      .subscribe((data) => {
        this.columns = data.slice(2, data.length)
        console.log(this.columns)
        
          //this.filterColumn.type = "boolean" //needs to be dynamic
          this.updateColumn()
        }
      )
  
      
  }

  ngOnDestroy() {
  }

  private updateColumn() {
    this.filterValue = ""
    if (this.filterColumn['field']) {
      this.columns.forEach(x => {
        if (this.filterColumn['field'] == x.field) {
          this.filterColumn.type = x.type
        } 
      })}
    this.operators = this.getoperator(this.filterColumn.type)
  }

  private clearFilter() {
    this.mapConfig.filterOn = false
    this.mapConfig.currentLayer.layer.defaultStyle['filter']['column'] = null
    this.mapConfig.currentLayer.layer.defaultStyle['filter']['operator'] = null
    this.mapConfig.currentLayer.layer.defaultStyle['filter']['value'] = null
    this.mapConfig.currentLayer.style['filter']['column'] = null
    this.mapConfig.currentLayer.style['filter']['operator'] = null
    this.mapConfig.currentLayer.style['filter']['value'] = null
    
    this.mapService.runInterval(this.mapConfig.currentLayer, this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder - 1])
  }

  private close() {
    this.mapConfig.filterShow = false
  }

  private applyFilter(mtype: string) {
    console.log(this.filterOperator['value'])
    this.mapConfig.filterOn = true
    console.log(this.mapConfig.currentLayer.layer.defaultStyle)
    this.mapConfig.currentLayer.layer.defaultStyle['filter']['column'] = this.filterColumn['field']
    this.mapConfig.currentLayer.layer.defaultStyle['filter']['operator'] = this.filterOperator['value']
    this.mapConfig.currentLayer.layer.defaultStyle['filter']['value'] = this.filterValue
    if (this.filterValue == "true") { this.mapConfig.currentLayer.layer.defaultStyle['filter']['value'] = true }
    if (this.filterValue == "false") { this.mapConfig.currentLayer.layer.defaultStyle['filter']['value'] = false }
    this.mapService.runInterval(this.mapConfig.currentLayer, this.mapConfig.sources[this.mapConfig.currentLayer.loadOrder - 1])
  }

  private saveToPage():void {
    console.log("Saving to Page")
    if (!this.mapConfig.currentLayer.style) {
      this.mapConfig.currentLayer.style = this.mapConfig.currentLayer.layer.defaultStyle
    }
    this.mapConfig.currentLayer.style['filter']['column'] = this.filterColumn['field']
    this.mapConfig.currentLayer.style['filter']['operator'] = this.filterOperator['value']
    this.mapConfig.currentLayer.style['filter']['value'] = this.filterValue 
    console.log(this.mapConfig.currentLayer)
    this.userPageLayerService
    .Update(this.mapConfig.currentLayer)
    .subscribe((data) => {
      console.log(data)
    })
  }

  private saveToLayer(): void {
    console.log("saving to layer")
    this.mapConfig.currentLayer.layer.defaultStyle = this.mapConfig.currentLayer.style;
    this.mapConfig.currentLayer.layer.defaultStyle['filter']['column'] = this.filterColumn['field'];
    this.mapConfig.currentLayer.layer.defaultStyle['filter']['operator'] = this.filterOperator['value'];
    this.mapConfig.currentLayer.layer.defaultStyle['filter']['value'] = this.filterValue;
    console.log(this.mapConfig.currentLayer)
    this.layerService
    .Update(this.mapConfig.currentLayer.layer)
    .subscribe((data) => {
      console.log(data)
    })
  }
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
