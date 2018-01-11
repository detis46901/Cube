import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards/auth.guard';
import { AdminGuard } from '../_guards/admin.guard';

import { LoginComponent } from './user/login.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { OrganizationComponent } from './admin/organization/organization.component';
import { LayerAdminComponent } from './admin/layerAdmin/layerAdmin.component';
import { UserComponent } from './admin/user/user.component';
import { ModuleComponent } from './admin/module/module.component';
import { DefaultsComponent } from './admin/default/default.component';
import { BoundaryComponent } from './admin/boundary/boundary.component';
import { NotificationComponent } from './admin/notification/notification.component';
import { ServerComponent } from './admin/server/server.component';
import { AdminPageComponent } from './admin/adminPage/adminPage.component';
import { SettingsComponent } from './settings/settings.component';
import { UserPageComponent } from './settings/user-pages/user-pages.component';
import { PasswordComponent } from './settings/password/password.component';
import { ApiKeyComponent } from './settings/apiKey/apiKey.component';


const appRoutes: Routes = [
    //Login/Map
    {path: 'login', component: LoginComponent},
    {path: 'logout', redirectTo: 'login'},
    {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
    {path: '', component: HomeComponent, canActivate: [AuthGuard]},

    //Non-admin Settings
    {path: 'settings', component: SettingsComponent, children: [
        {path: 'userpages', component: UserPageComponent, outlet: 'settings'},
        {path: 'password', component: PasswordComponent, outlet: 'settings'},
        {path: 'apikey', component: ApiKeyComponent, outlet: 'settings'}
    ]},

    //Admin Settings
    {path: 'admin', component: AdminComponent, canActivate: [AdminGuard], children: [
        {path: 'user', component: UserComponent, outlet: 'admin'},
        {path: 'organization', component: OrganizationComponent, outlet: 'admin'},
        {path: 'module', component: ModuleComponent, outlet: 'admin'},
        {path: 'layer', component: LayerAdminComponent, outlet: 'admin'},
        {path: 'page', component: AdminPageComponent, outlet: 'admin'},
        {path: 'default', component: DefaultsComponent, outlet: 'admin'},
        {path: 'boundary', component: BoundaryComponent, outlet: 'admin'},
        {path: 'notification', component: NotificationComponent, outlet: 'admin'},
        {path: 'server', component: ServerComponent, outlet: 'admin'}
    ]},
    
    // otherwise redirect to home
    {path: '**', redirectTo: ''}
];
 
export const Routing = RouterModule.forRoot(appRoutes);