import {Pipe, PipeTransform} from '@angular/core';
import { UserPage } from '../_models/user-model';

@Pipe({
    name: 'pagefilter'
})
export class PagePipe implements PipeTransform {
    transform(items: UserPage[], userID: number): any {
        console.log("Pipe Implement")
        console.log(userID)
        console.log(items)
        if (items !== undefined) { 
        return items.filter(item => item.userID === userID);
        }
    }
}

@Pipe({
    name: 'layerfilter'
})
export class LayerFilterPipe implements PipeTransform {
    transform(items: any, filter: any): any {
        
    }
}