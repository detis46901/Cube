import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { MapService } from './map/services/map.service'
import { GeocodingService } from './map/services/geocoding.service'
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { MarkerComponent } from '../app/map/marker/marker.component'
import { NavigatorComponent } from '../app/map/navigator/navigator.component';
import { PagesComponent } from './pages/pages.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './header/header.component';
import { SideNavComponent } from './sidenav/sidenav.component';
import { Routes, RouterModule } from '@angular/router';
import { routing } from './app.routing'
//import { routes } from './app.routes';

// used to create fake backend
//import { fakeBackendProvider } from '../_helpers/fake-backend';
//import { MockBackend, MockConnection } from '@angular/http/testing';
import { BaseRequestOptions } from '@angular/http';
import { Api2Service } from './api2.service'
import { AuthGuard } from '../_guards/auth.guard';
import { AdminGuard } from '../_guards/admin.guard';
import { AuthenticationService} from '../_services/authentication.service';
import { UserService } from '../_services/user.service';
import { LoginComponent } from './user/login.component';
import { HomeComponent } from './home.component';
//admin components
import { AdminComponent } from './admin/admin.component';
import { AdminNavComponent } from './admin/adminnav/adminnav.component'
import { OrganizationComponent } from './admin/organization/organization.component';
import { LayerAdminComponent} from './admin/layeradmin/layeradmin.component';
import { LayerPermissionComponent} from './admin/layeradmin/layerpermission.component';
import { PageComponent} from './admin/page/page.component';
import { PageConfigComponent} from './admin/page/pageconfig.component';
import { LayerNewComponent } from './admin/layeradmin/layernew.component';
import { UserComponent } from './admin/user/user.component';
import { DepartmentService } from '../_services/department.service';
import { GroupService } from '../_services/group.service';
import { RoleService } from '../_services/role.service';
import { LayerAdminService } from '../_services/layeradmin.service';
import { LayerPermissionService } from '../_services/layerpermission.service';
import { UserPageLayerService } from '../_services/user-page-layer.service';
import { UserPageService } from '../_services/user-page.service';
import { Configuration } from '../_api/api.constants';
import { FilterPipe } from '../_pipes/rowfilter.pipe';
import { PagePipe } from '../_pipes/rowfilter2.pipe';
import { NumFilterPipe } from '../_pipes/numfilter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MarkerComponent,
    NavigatorComponent,
    PagesComponent,
    HeaderComponent,
    SideNavComponent,
    HomeComponent,
    LoginComponent,
    AdminComponent,
    AdminNavComponent,
    OrganizationComponent,
    LayerAdminComponent,
    UserComponent,
    FilterPipe,
    NumFilterPipe,
    PagePipe,
    LayerPermissionComponent,
    PageComponent,
    PageConfigComponent,
    LayerNewComponent
  ],

  entryComponents: [LayerNewComponent, LayerPermissionComponent, PageComponent, PageConfigComponent],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    NgbModule.forRoot(),
    routing,
    RouterModule.forRoot([
      {
        path: 'home',
        component: HomeComponent
      }
    ])
    //routes
  ],
  providers: [
    Api2Service, 
    MapService, 
    GeocodingService, 
    AuthGuard, 
    AdminGuard, 
    AuthenticationService, 
    UserService, 
    DepartmentService, 
    GroupService, 
    RoleService, 
    LayerAdminService, 
    LayerPermissionService,
    UserPageLayerService,
    UserPageService,
    Configuration, 
    BaseRequestOptions], 
  bootstrap: [AppComponent]
})
export class AppModule { }
