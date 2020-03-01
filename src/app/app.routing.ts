import { Routes, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthGuard } from '../_guards/auth.guard';
import { AdminGuard } from '../_guards/admin.guard';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
// import { AdminComponent } from './admin/admin.component';
import { GroupComponent } from './admin/group/group.component';
import { LayerComponent } from './admin/layer/layer.component';
import { InstanceComponent } from './admin/module/instance.component';
import { UserComponent } from './admin/user/user.component';
import { DefaultsComponent } from './admin/default/default.component';
import { ServerComponent } from './admin/server/server.component';
import { SettingsComponent } from './settings/settings.component';
import { PasswordComponent } from './settings/password/password.component';
import { ApiKeyComponent } from './settings/apiKey/apiKey.component';
import { ProfileComponent } from './settings/profile/profile.component';

// import { LayerPermissionComponent } from './admin/layer/layerPermission/layerPermission.component'
// import { ModulePermissionComponent } from './admin/module/modulePermission/modulePermission.component'

//consider setting up different routes for desktop and mobile
const appRoutes: Routes = [
    // Login/Map
    { path: 'public/:publicName', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'logout', redirectTo: 'login' },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    
    // Non-admin Settings
    {
        path: 'settings', component: SettingsComponent, children: [
            { path: 'profile', component: ProfileComponent, outlet: 'settings' },
            { path: 'password', component: PasswordComponent, outlet: 'settings' },
            { path: 'apikey', component: ApiKeyComponent, outlet: 'settings' }
        ]
    },

    // Admin Settings
    {
        path: 'admin', canActivate: [AdminGuard], loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
      },

    // {
    //     path: 'admin', component: AdminComponent, canActivate: [AdminGuard], children: [
    //         { path: 'user', component: UserComponent, outlet: 'admin' },
    //         { path: 'group', component: GroupComponent, outlet: 'admin' },
    //         { path: 'layer', component: LayerComponent, outlet: 'admin' },
    //         { path: 'module', component: InstanceComponent, outlet: 'admin' },
    //         { path: 'default', component: DefaultsComponent, outlet: 'admin' },
    //         { path: 'server', component: ServerComponent, outlet: 'admin' }
    //     ]    
    // },

    // new Layer Modal Settings
    // { path: 'layerNew', component: LayerPermissionComponent },
    // { path: 'moduleNew', component: ModulePermissionComponent },
   
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];
export const Routing = RouterModule.forRoot(appRoutes);
