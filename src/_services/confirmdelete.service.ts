import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';

@Injectable()

//This is currently not being used for anything as a file.
export class ConfirmdeleteService {
    objectCode: number;
    objectID: number;
    code_ID: number[];
}