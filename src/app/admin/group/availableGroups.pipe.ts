import { Pipe, PipeTransform } from '@angular/core';
import { Group } from '../../../_models/group.model';
import { GroupMember } from '../../../_models/groupMember.model';
import { GroupMemberService } from '../../../_services/_groupMember.service';

@Pipe({ name: 'availGroups' })
export class AvailableGroupsPipe implements PipeTransform {
    
    transform(allGroups: Group[]) {
        //return allGroups.filter(group => group.description);
        return allGroups[0]
    }
}

/////// Identical except for the pure flag
@Pipe({
    name: 'availableGroupsImpure',
    pure: false
})
export class FlyingHeroesImpurePipe extends AvailableGroupsPipe {}