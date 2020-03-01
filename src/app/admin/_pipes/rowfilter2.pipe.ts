import { Pipe, PipeTransform } from '@angular/core';
import { UserPage, User } from '../../../_models/user.model';

@Pipe({ name: 'pagefilter' })

export class PagePipe implements PipeTransform {
    transform(items: UserPage[], userID: number): any {
        if (items !== undefined) {
            return items.filter(item =>
                item.userID === userID
            );
        }
    }
}

@Pipe({ name: 'layerfilter' })

export class LayerFilterPipe implements PipeTransform {
    transform(items: any, filter: any): any { }
}

@Pipe({ name: 'userfilter'})

export class UserPipe implements PipeTransform {
    transform(items: User[], bool: boolean): any {
        if (bool == true) {
            try {
                return items.filter(item => item.public == true)
            }
            catch {
                console.log("Not Loaded Yet")
            }

        }
        else {
        try {
            return items.filter(item => item.public != true)
        }
        catch {
            console.log("Not Loaded Yet")
        }
    }

    }
}
