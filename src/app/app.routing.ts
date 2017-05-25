import { Routes, RouterModule } from '@angular/router';
 
import { LoginComponent } from './user/login.component';
import { HomeComponent } from './home.component';
import { AdminComponent } from './admin/admin.component';
import { OrganizationComponent } from './admin/organization/organization.component';
import { LayerAdminComponent } from './admin/layeradmin/layeradmin.component';
import { UserComponent } from './admin/user/user.component'
import { ModulesComponent } from './admin/modules/modules.component';
import { DefaultsComponent } from './admin/defaults/defaults.component';
import { BoundariesComponent } from './admin/boundaries/boundaries.component';
import { NotificationsComponent } from './admin/notifications/notifications.component';
import { adminPagesComponent } from './admin/adminpages/adminpages.component'
import { AuthGuard } from '../_guards/auth.guard';
import { AdminGuard } from '../_guards/admin.guard';

import { SettingsComponent } from './settings/settings.component'; //User Settings screen
import { UserPagesComponent } from './settings/user-pages/user-pages.component';
import { PasswordComponent } from './settings/password/password.component';
 
const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'logout', redirectTo: 'login'},
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'settings', component: SettingsComponent, children: [
        {path: 'userpages', component: UserPagesComponent, outlet: 'settings'},
        {path: 'password', component: PasswordComponent, outlet: 'settings'}
    ]},    //User Settings screen
    { path: 'admin', component: AdminComponent, canActivate: [AdminGuard], children: [
        { path: 'user', component: UserComponent, outlet: 'admin'},
        { path: 'organization', component: OrganizationComponent, outlet: 'admin'},
        { path: 'module', component: ModulesComponent, outlet: 'admin'},
        { path: 'layer', component: LayerAdminComponent, outlet: 'admin'},
        { path: 'pages', component: adminPagesComponent, outlet: 'admin'},
        { path: 'default', component: DefaultsComponent, outlet: 'admin'},
        { path: 'boundary', component: BoundariesComponent, outlet: 'admin'},
        { path: 'notification', component: NotificationsComponent, outlet: 'admin'},
    ]},    //Admin Settings screen
    
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];
 
export const routing = RouterModule.forRoot(appRoutes);