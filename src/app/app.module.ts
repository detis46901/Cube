//Angular/Miscellaneous
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { HttpModule, ConnectionBackend, Http } from '@angular/http';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { Routes, RouterModule } from '@angular/router';
import { LinkyModule } from 'ngx-linky';
import { FeatureModulesModule } from './feature-modules/feature-modules.module'
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
import {
    MatRadioModule, MatIconModule, MatCardModule, MatDialogModule, MatSelectModule, MatListModule,
    MatSidenavModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatTableModule, 
    MatFormFieldModule, MatProgressSpinnerModule, MatToolbarModule, MatNativeDateModule
} from '@angular/material';
import {MatDividerModule} from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

//pipes
import {LayerFilterPipe} from '../_pipes/rowfilter2.pipe'
import 'hammerjs';

//Services
import { UserService } from '../_services/_user.service';
import { GroupService } from '../_services/_group.service';
import { GroupMemberService } from '../_services/_groupMember.service';
import { LayerService } from '../_services/_layer.service';
import { LayerPermissionService } from '../_services/_layerPermission.service';
import { ModulePermissionService } from '../_services/_modulePermission.service';
import { ModuleService } from '../_services/_module.service'
import { UserPageLayerService } from '../_services/_userPageLayer.service';
import { UserPageInstanceService } from '../_services/_userPageInstance.service';
import { UserPageService } from '../_services/_userPage.service';
import { AuthenticationService } from '../_services/authentication.service';
import { SQLService } from '../_services/sql.service'
import { ServerService } from '../_services/_server.service';
import { geoJSONService } from './map/services/geoJSON.service';
import { MyCubeService } from './/map/services/mycube.service';
import { WMSService } from './map/services/wms.service';
import { SideNavService } from '../_services/sidenav.service';
import { MessageService } from '../_services/message.service';
import { ImageService } from '../_services/image.service';
import { UserValidatorService } from './admin/user/userValidator.service';
import { NotifService } from '../_services/notification.service';
import { FeatureModulesService } from '../app/feature-modules/feature-modules.service'
//import { MapService } from './map/services/map.service';
//import { FilterService } from './map/services/filter.service';
//import { GeocodingService } from './map/services/geocoding.service';

//Components
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { AdminNavComponent } from './admin/adminnav/adminnav.component';
import { LayerComponent } from './admin/layer/layer.component';
import { InstanceComponent } from './admin/module/instance.component';
import { InstanceNewComponent } from './admin/module/instanceNew/instanceNew.component'
import { LayerPermissionComponent } from './admin/layer/layerPermission/layerPermission.component';
import { ModulePermissionComponent } from './admin/module/modulePermission/modulePermission.component';
import { LayerStyleComponent } from './admin/layer/layerStyle/layerStyle.component'
import { PageComponent } from './admin/user/page/page.component';
import { PageConfigComponent } from './admin/user/pageconfig/pageconfig.component';
import { LayerNewComponent } from './admin/layer/layerNew/layerNew.component';
import { newMyCubeComponent } from './admin/layer/myCubeLayer/newMyCube.component';
import { UserComponent } from './admin/user/user.component';
import { DefaultsComponent } from './admin/default/default.component';
import { ServerComponent } from './admin/server/server.component';
import { ConfirmDeleteComponent } from './admin/confirmdelete/confirmdelete.component';
import { SettingsComponent } from './settings/settings.component';
import { PasswordComponent } from './settings/password/password.component';
import { ServerNewComponent } from './admin/server/serverNew/serverNew.component';
import { ChangePasswordComponent } from './admin/user/changepassword/changepassword.component';
import { HeaderComponent } from './header/header.component';
import { SideNavComponent } from './featuredata/sidenav.component';
import { FeatureDataComponent } from './featuredata/featuredata.component'
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { GroupComponent } from './admin/group/group.component';
import { NewGroupComponent } from './admin/group/newGroup/newGroup.component';
import { NewUserComponent } from './admin/user/newUser/newUser.component';
import { ApiKeyComponent } from './settings/apiKey/apiKey.component';
import { ProfileComponent } from './settings/profile/profile.component';
import { ChangePictureComponent } from './settings/profile/change-picture/change-picture.component';
import { NotifComponent } from '../app/notification/notification.component';
import { MeasureComponent } from './map/measure/measure.component';
import { FilterComponent } from './map/filter/filter.component';
import { mapStyles } from '../app/map/models/map.model';
import { LayerDetailsComponent } from './admin/details/layerDetails/layerDetails.component';
import { InstanceDetailsComponent } from './admin/details/instanceDetails/instanceDetails.component';
import { MapService } from './map/services/map.service';
import { StyleService } from './map/services/style.service';
import { GeocodingService } from './map/services/geocoding.service';
import { EditGroupComponent } from './admin/group/editGroup/editGroup.component'
import { UserDetailsComponent } from './admin/details/userDetails/userDetails.component';
import { ServerDetailsComponent } from './admin/details/serverDetails/serverDetails.component';
import { ServerLayersComponent } from './admin/server/serverLayers/serverLayers.component';
import { StyleComponent } from './map/style/style.component';
import { ModuleSettingsComponent } from './admin/module/moduleSettings/moduleSettings.component'


@NgModule({
    declarations: [
        AppComponent,
        MapComponent,
        PageComponent,
        HeaderComponent,
        SideNavComponent,
        FeatureDataComponent,
        HomeComponent,
        LoginComponent,
        AdminComponent,
        AdminNavComponent,
        GroupComponent,
        LayerComponent,
        InstanceComponent,
        UserComponent,
        SettingsComponent,
        PasswordComponent,
        FilterPipe,
        NumFilterPipe,
        PagePipe,
        LayerPermissionComponent,
        ModulePermissionComponent,
        LayerStyleComponent,
        PageComponent,
        PageConfigComponent,
        LayerNewComponent,
        newMyCubeComponent,
        ConfirmDeleteComponent,
        DefaultsComponent,
        NotifComponent,
        ServerComponent,
        ServerNewComponent,
        ChangePasswordComponent,
        NewUserComponent,
        ApiKeyComponent,
        NewGroupComponent,
        ProfileComponent,
        ChangePictureComponent,
        LayerDetailsComponent,
        InstanceDetailsComponent,
        NotifComponent,
        MeasureComponent,
        FilterComponent,
        EditGroupComponent,
        UserDetailsComponent,
        ServerDetailsComponent,
        ServerLayersComponent,
        StyleComponent,
        ModuleSettingsComponent,
        InstanceNewComponent,
        LayerFilterPipe,
    ],

    entryComponents: [
        LayerNewComponent,
        newMyCubeComponent,
        ChangePasswordComponent,
        LayerPermissionComponent,
        ModulePermissionComponent,
        LayerStyleComponent,
        PageComponent,
        PageConfigComponent,
        ConfirmDeleteComponent,
        ServerNewComponent,
        NewUserComponent,
        NewGroupComponent,
        EditGroupComponent,
        ChangePictureComponent,
        LayerDetailsComponent,
        UserDetailsComponent,
        ServerDetailsComponent,
        ServerLayersComponent,
        ModuleSettingsComponent,
        InstanceNewComponent
    ],

    imports: [
        BrowserModule,
        FormsModule,
        CommonModule,
        HttpClientModule,
        HttpClientJsonpModule,
        HttpModule,
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
        MatButtonToggleModule,
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
        MatSnackBarModule,
        MatDividerModule,
        MatAutocompleteModule,
        LinkyModule,
        FeatureModulesModule,
        DragDropModule
    ],

    providers: [
        UserService,
        MapService,
        StyleService,
        GeocodingService,
        AuthGuard,
        AdminGuard,
        AuthenticationService,
        UserService,
        GroupService,
        GroupMemberService,
        LayerService,
        LayerPermissionService,
        ModulePermissionService,
        SQLService,
        UserPageLayerService,
        UserPageService,
        Configuration,
        BaseRequestOptions,
        ServerService,
        geoJSONService,
        MyCubeService,
        WMSService,
        SideNavService,
        MessageService,
        mapStyles,
        ImageService,
        UserValidatorService,
        NotifService,
        FeatureModulesService,
        UserPageInstanceService,
        ModuleService

    ],

    bootstrap: [AppComponent]
})

export class AppModule { }