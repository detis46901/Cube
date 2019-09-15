import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from './_guards/admin.guard';

import { AdminComponent } from './admin.component';
import { GroupComponent } from './group/group.component';
import { LayerComponent } from './layer/layer.component';
import { InstanceComponent } from './module/instance.component';
import { UserComponent } from './user/user.component';
import { DefaultsComponent } from './default/default.component';
import { ServerComponent } from './server/server.component';

import { LayerPermissionComponent } from './layer/layerPermission/layerPermission.component'
import { ModulePermissionComponent } from './module/modulePermission/modulePermission.component'
import { Group } from '_models/group.model';


const appRoutes: Routes = [

    {
        path: '', component: AdminComponent, children: [
            { path: '', component: LayerComponent, outlet: 'admin' },
        ]
    },
    {
        path: 'group', component: AdminComponent, children: [
            { path: '', component: GroupComponent, outlet: 'admin' }
        ]
    },
    {
        path: 'user', component: AdminComponent, children: [
            { path: '', component: UserComponent, outlet: 'admin' }]
    },
    {
        path: 'module', component: AdminComponent, children: [
            { path: '', component: InstanceComponent, outlet: 'admin' }]
    },
    {
        path: 'default', component: AdminComponent, children: [
            { path: '', component: DefaultsComponent, outlet: 'admin' }]
    },
    {
        path: 'server', component: AdminComponent, children: [
            { path: '', component: ServerComponent, outlet: 'admin' }]
    },
    // new Layer Modal Settings
    { path: '**', redirectTo: '' }
];
export const Routing = RouterModule.forChild(appRoutes);
