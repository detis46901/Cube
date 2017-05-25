import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ConfirmdeleteService {
    //private objCodeSoure = new Subject<number>();
    objectCode: number;
    objectID: number;
    code_ID: number[];
    delete_obj = false;

    //objCode$ = this.objCodeSoure.asObservable();

    setVars(code: number, id: number) {
        this.objectCode = code
        this.objectID = id
        console.log("service code: " + code + "   service id:" + id)
    }

    getVars() {
        //code = this.objectCode
        //id = this.objectID
        this.code_ID = []
        this.code_ID.push(this.objectCode)
        this.code_ID.push(this.objectID)
        return this.code_ID
        //return [this.objectCode, this.code_ID]
    }

    delete() {
        this.delete_obj = true;
        console.log(this.delete_obj)
    }

    resetDelete() {
        this.delete_obj = false;
    }
}