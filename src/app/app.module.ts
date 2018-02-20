//Angular/Miscellaneous
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { MapService } from './map/services/map.service';
import { GeocodingService } from './map/services/geocoding.service';
import { Routes, RouterModule } from '@angular/router';
import { Routing } from './app.routing';
import { BaseRequestOptions } from '@angular/http';
import { AuthGuard } from '../_guards/auth.guard';
import { AdminGuard } from '../_guards/admin.guard';
import { Configuration } from '../_api/api.constants';
import { FilterPipe } from '../_pipes/rowfilter.pipe';
import { PagePipe } from '../_pipes/rowfilter2.pipe';
import { NumFilterPipe } from '../_pipes/numfilter.pipe';

//Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu'
import { MatRadioModule, MatIconModule, MatCardModule, MatDialogModule, MatSelectModule, MatListModule, 
         MatSidenavModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatTableModule, 
         MatFormFieldModule, MatProgressSpinnerModule, MatToolbarModule, MatNativeDateModule } from '@angular/material';
import {MatChipsModule} from '@angular/material/chips';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatTooltipModule} from '@angular/material/tooltip'
import {MatSnackBarModule} from '@angular/material/snack-bar'

import 'hammerjs';

//Components
import { LoginComponent } from './user/login.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { AdminNavComponent } from './admin/adminNav/adminNav.component';
import { SettingsNavComponent } from './settings/settingsnav/settingsnav.component';
import { LayerComponent} from './admin/layerAdmin/layer.component';
import { LayerPermissionComponent} from './admin/layerAdmin/layerPermission/layerPermission.component';
import { PageComponent} from './admin/user/page/page.component';
import { PageConfigComponent} from './admin/user/pageConfig/pageConfig.component';
import { LayerNewComponent } from './admin/layerAdmin/layerNew/layerNew.component';
import { newMyCubeComponent } from './admin/layerAdmin/myCubeLayer/newMyCube.component';
import { UserComponent } from './admin/user/user.component';
import { AdminPageComponent } from './admin/adminPage/adminPage.component';
import { ModuleComponent } from './admin/module/module.component';
import { DefaultsComponent } from './admin/default/default.component';
import { BoundaryComponent } from './admin/boundary/boundary.component';
import { NotificationComponent } from './admin/notification/notification.component';
import { ServerComponent } from './admin/server/server.component';
import { ConfirmDeleteComponent } from './admin/confirmDelete/confirmDelete.component';
import { SettingsComponent } from './settings/settings.component';
import { UserPageComponent } from './settings/user-pages/user-pages.component';
import { PasswordComponent } from './settings/password/password.component';
import { MarkerDataComponent } from './marker_data/marker-data.component';
//import { LayerControlsComponent } from './map/layer-controls/layer-controls.component';
import { ServerNewComponent } from './admin/server/serverNew/serverNew.component';
import { ChangePasswordComponent } from './admin/user/changePassword/changePassword.component';
import { HeaderComponent } from './header/header.component';
import { SideNavComponent } from './sidenav/sidenav.component';
import { FeatureDataComponent } from './sidenav/featuredata.component'
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { MarkerComponent } from '../app/map/marker/marker.component';
import { PMMarkerComponent } from '../app/map/marker/PMmarker.component'
import { NavigatorComponent } from '../app/map/navigator/navigator.component';
import { PagesComponent } from './pages/pages.component';
import { GroupComponent } from './admin/group/group.component';
import { NewGroupComponent } from './admin/group/newGroup/newGroup.component';
import { NewUserComponent } from './admin/user/newUser/newUser.component';
import { ApiKeyComponent } from './settings/apiKey/apiKey.component';
import { ProfileComponent } from './settings/profile/profile.component';
import { ChangePictureComponent } from './settings/profile/change-picture/change-picture.component';

import { mapStyles } from '../app/map/models/map.model';

//Services
import { UserService } from '../_services/_user.service';
import { GroupService } from '../_services/_group.service';
import { GroupMemberService } from '../_services/_groupMember.service';
import { LayerService } from '../_services/_layer.service';
import { LayerPermissionService } from '../_services/_layerPermission.service';
import { UserPageLayerService } from '../_services/_userPageLayer.service';
import { UserPageService } from '../_services/_userPage.service';
import { AuthenticationService} from '../_services/authentication.service';
import { SQLService } from '../_services/sql.service'
import { ServerService } from '../_services/_server.service';
import { geoJSONService } from './map/services/geoJSON.service';
import { MyCubeService } from './/map/services/mycube.service';
import { WFSService } from './map/services/wfs.service';
import { SideNavService } from '../_services/sidenav.service';
import { MessageService } from '../_services/message.service';
import { ImageService } from '../_services/image.service';

@NgModule ({
    declarations: [
        AppComponent,
        MapComponent,
        MarkerComponent,
        PMMarkerComponent,
        NavigatorComponent,
        PageComponent,
        HeaderComponent,
        SideNavComponent,
        FeatureDataComponent,
        HomeComponent,
        LoginComponent,
        AdminComponent,
        AdminNavComponent,
        SettingsNavComponent,
        GroupComponent,
        LayerComponent,
        UserComponent,
        AdminPageComponent,
        SettingsComponent,
        UserPageComponent,
        PasswordComponent,
        FilterPipe,
        NumFilterPipe,
        PagePipe,
        LayerPermissionComponent,
        PageComponent,
        PageConfigComponent,
        LayerNewComponent,
        newMyCubeComponent,
        ConfirmDeleteComponent,
        ModuleComponent,
        DefaultsComponent,
        BoundaryComponent,
        NotificationComponent,
        ServerComponent,
        MarkerDataComponent,
        //LayerControlsComponent,
        ServerNewComponent,
        ChangePasswordComponent,
        NewUserComponent,
        ApiKeyComponent,
        NewGroupComponent,
        ProfileComponent,
        ChangePictureComponent
    ],

    entryComponents: [
        LayerNewComponent,
        newMyCubeComponent,
        ChangePasswordComponent, 
        LayerPermissionComponent, 
        PageComponent, 
        PageConfigComponent, 
        ConfirmDeleteComponent,
        ServerNewComponent,
        NewUserComponent,
        NewGroupComponent,
        ChangePictureComponent
    ],

    imports: [
        BrowserModule,
        FormsModule,
        CommonModule,
        HttpClientModule,
        HttpClientJsonpModule,
        //MNgbodule.forRoot(),
        Routing,
        RouterModule.forRoot([
            {
                path: 'home',
                component: HomeComponent
            }
        ]),
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatExpansionModule,
        MatRadioModule,
        MatMenuModule,
        MatIconModule,
        MatDialogModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatToolbarModule,
        MatChipsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatListModule,
        MatTooltipModule,
        MatSnackBarModule
    ],

    providers: [
        UserService, 
        MapService, 
        GeocodingService, 
        AuthGuard, 
        AdminGuard, 
        AuthenticationService, 
        UserService, 
        GroupService,
        GroupMemberService,
        LayerService, 
        LayerPermissionService,
        SQLService,
        UserPageLayerService,
        UserPageService,
        Configuration,
        BaseRequestOptions,
        ServerService,
        geoJSONService,
        MyCubeService,
        WFSService,
        SideNavService,
        MessageService,
        mapStyles,
        ImageService
    ], 

    bootstrap: [AppComponent]
})

export class AppModule {}