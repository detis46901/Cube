import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ValidatorService, DefaultValidatorService } from 'angular4-material-table';

@Injectable()
export class ServerValidatorService implements ValidatorService {
    getRowValidator(): FormGroup {
        return new FormGroup({
            'ID': new FormControl(null, Validators.required),
            'serverName': new FormControl(null, Validators.required),
            'serverType': new FormControl({ value: null, disabled: true }, Validators.required),
            'serverURL': new FormControl(null, Validators.required)
        });
    }
}