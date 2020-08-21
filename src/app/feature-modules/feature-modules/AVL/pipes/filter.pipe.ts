import { Pipe, PipeTransform } from '@angular/core';
import { GpsMessage } from '../AVL.model';

@Pipe({name: 'gpsMessagefilter'})

export class GpsMessagePipe implements PipeTransform {
    transform(items: GpsMessage[]): any {
        if (items !== undefined) { 
            return items.filter(item => 
                item.hide != true
            );
        }
    }
}