import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards/auth.guard';
import { AdminGuard } from '../_guards/admin.guard';

import { LoginComponent } from './user/login.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { OrganizationComponent } from './admin/organization/organization.component';
import { LayerAdminComponent } from './admin/layeradmin/layeradmin.component';
import { UserComponent } from './admin/user/user.component';
import { ModulesComponent } from './admin/modules/modules.component';
import { DefaultsComponent } from './admin/defaults/defaults.component';
import { BoundariesComponent } from './admin/boundaries/boundaries.component';
import { NotificationsComponent } from './admin/notifications/notifications.component';
import { ServerComponent } from './admin/servers/server.component';
import { adminPagesComponent } from './admin/adminpages/adminpages.component';
import { SettingsComponent } from './settings/settings.component';
import { UserPagesComponent } from './settings/user-pages/user-pages.component';
import { PasswordComponent } from './settings/password/password.component';


const appRoutes: Routes = [
    //Login/Map
    {path: 'login', component: LoginComponent},
    {path: 'logout', redirectTo: 'login'},
    {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
    {path: '', component: HomeComponent, canActivate: [AuthGuard]},

    //Non-admin Settings
    {path: 'settings', component: SettingsComponent, children: [
        {path: 'userpages', component: UserPagesComponent, outlet: 'settings'},
        {path: 'password', component: PasswordComponent, outlet: 'settings'}
    ]},

    //Admin Settings
    {path: 'admin', component: AdminComponent, canActivate: [AdminGuard], children: [
        {path: 'user', component: UserComponent, outlet: 'admin'},
        {path: 'organization', component: OrganizationComponent, outlet: 'admin'},
        {path: 'module', component: ModulesComponent, outlet: 'admin'},
        {path: 'layer', component: LayerAdminComponent, outlet: 'admin'},
        {path: 'pages', component: adminPagesComponent, outlet: 'admin'},
        {path: 'default', component: DefaultsComponent, outlet: 'admin'},
        {path: 'boundary', component: BoundariesComponent, outlet: 'admin'},
        {path: 'notification', component: NotificationsComponent, outlet: 'admin'},
        {path: 'server', component: ServerComponent, outlet: 'admin'}
    ]},
    
    // otherwise redirect to home
    {path: '**', redirectTo: ''}
];
 
export const Routing = RouterModule.forRoot(appRoutes);