import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ValidatorService, DefaultValidatorService } from 'angular4-material-table';

@Injectable()
export class UserValidatorService implements ValidatorService {
    getRowValidator(): FormGroup {
        return new FormGroup({
            'ID': new FormControl(null, Validators.required),
            'firstName': new FormControl(null, Validators.required),
            'lastName': new FormControl(null, Validators.required),
            'roleID': new FormControl({value:null, disabled:true}, Validators.required),
            'email': new FormControl(null, Validators.required),
            'active': new FormControl({value:null, disabled:true}, Validators.required),
            'administrator': new FormControl({value:null, disabled:true}, Validators.required)
        });
    }
}