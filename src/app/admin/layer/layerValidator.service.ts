import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
//import { ValidatorService, DefaultValidatorService } from 'angular4-material-table';

//this is going to need some work
@Injectable()
export class LayerValidatorService {
    getRowValidator(): FormGroup {
        return new FormGroup({
            'ID': new FormControl(null, Validators.required),
            'layerName': new FormControl(null, Validators.required),
            'layerIdent': new FormControl(null, Validators.required),
            'layerService': new FormControl(null, Validators.required),
            'serverID': new FormControl({ value: null, disabled: true }, Validators.required),
            'layerDescription': new FormControl(null, Validators.required),
            'layerFormat': new FormControl({ value: null, disabled: true }, Validators.required),
            'layerType': new FormControl({ value: null, disabled: true }, Validators.required),
            'layerGeom': new FormControl({ value: null, disabled: true }, Validators.required)
        });
    }
}
