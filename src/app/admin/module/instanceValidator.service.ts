import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ValidatorService, DefaultValidatorService } from 'angular4-material-table';

@Injectable()
export class InstanceValidatorService implements ValidatorService {
    getRowValidator(): FormGroup {
        return new FormGroup({
            'ID': new FormControl(null, Validators.required),
            'name': new FormControl(null, Validators.required),
            'description': new FormControl(null, Validators.required),
            'moduleID': new FormControl({ value: null, disabled: true }, Validators.required)
        });
    }
}