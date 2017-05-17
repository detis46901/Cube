import { Routes, RouterModule } from '@angular/router';
 
import { LoginComponent } from './user/login.component';
import { HomeComponent } from './home.component';
import { AdminComponent } from './admin/admin.component';
import { OrganizationComponent } from './admin/organization/organization.component';
import { LayerAdminComponent } from './admin/layeradmin/layeradmin.component';
import { UserComponent } from './admin/user/user.component'
import { AuthGuard } from '../_guards/auth.guard';
import { AdminGuard } from '../_guards/admin.guard';
//import { SettingsComponent } from './settings/settings.component'; User Settings
 
const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'logout', redirectTo: 'login'},
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    //{ path: 'settings', component: SettingsComponent},    User Settings 
    { path: 'admin', component: AdminComponent, canActivate: [AdminGuard], children: [
        { path: 'user', component: UserComponent, outlet: 'admin'},
        { path: 'organization', component: OrganizationComponent, outlet: 'admin'},
        { path: 'module', component: OrganizationComponent, outlet: 'admin'},
        { path: 'layer', component: LayerAdminComponent, outlet: 'admin'},
        { path: 'page', component: LayerAdminComponent, outlet: 'admin'},
        { path: 'default', component: OrganizationComponent, outlet: 'admin'},
        { path: 'boundary', component: OrganizationComponent, outlet: 'admin'},
        { path: 'notification', component: OrganizationComponent, outlet: 'admin'},
    ]},
    
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];
 
export const routing = RouterModule.forRoot(appRoutes);