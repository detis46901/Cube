//Angular/Miscellaneous
import { BrowserModule } from '@angular/platform-browser';
import { Routing } from './app.routing';
import { NgModule } from '@angular/core';
//import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { Routes, RouterModule } from '@angular/router';
import { LinkyModule } from 'ngx-linky';
import { FeatureModulesModule } from './feature-modules/feature-modules.module'
import { AuthGuard } from '../_guards/auth.guard';
import { AdminGuard } from '../_guards/admin.guard';
import { Configuration } from '../_api/api.constants';
import { FilterPipe } from '../_pipes/rowfilter.pipe';
import { PagePipe } from '../_pipes/rowfilter2.pipe';
import { NumFilterPipe } from '../_pipes/numfilter.pipe';
//import { AdminModule } from './admin/admin.module'

//Angular Material
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu'
import {
    MatRadioModule, MatIconModule, MatCardModule, MatDialogModule, MatSelectModule, MatListModule,
    MatSidenavModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatTableModule,
    MatFormFieldModule, MatProgressSpinnerModule, MatToolbarModule, MatNativeDateModule
} from '@angular/material';
import {MatSliderModule, MatSlider} from '@angular/material/slider'
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
import { NotifService } from '../_services/notification.service';
import { FeatureModulesService } from '../app/feature-modules/feature-modules.service'
import { MapConfigService } from '../_services/mapConfig.service'
import { UserService } from '../_services/_user.service';
//import { MapService } from './map/services/map.service';
//import { FilterService } from './map/services/filter.service';
//import { GeocodingService } from './map/services/geocoding.service';

//Components
import { LoginComponent } from './login/login.component';
import { PageComponent2 } from './admin2/user/page/page.component'  //This needs to be fixed!
import { ConfirmDeleteComponent } from './admin2/confirmdelete/confirmdelete.component'
import { PageConfigComponent2 } from './admin2/user/pageconfig/pageconfig.component'  //This needs to be fixed!
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';
import { PasswordComponent } from './settings/password/password.component';
import { HeaderComponent } from './header/header.component';
import { SideNavComponent } from './featuredata/sidenav.component';
import { FeatureDataComponent } from './featuredata/featuredata.component'
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { ApiKeyComponent } from './settings/apiKey/apiKey.component';
import { ProfileComponent } from './settings/profile/profile.component';
import { ChangePictureComponent } from './settings/profile/change-picture/change-picture.component';
import { NotifComponent } from '../app/notification/notification.component';
import { MeasureComponent } from './map/measure/measure.component';
import { FilterComponent } from './map/filter/filter.component';
import { mapStyles } from '../app/map/models/map.model';
import { MapService } from './map/services/map.service';
import { StyleService } from './map/services/style.service';
import { GeocodingService } from './map/services/geocoding.service';
import { StyleComponent } from './map/style/style.component';


@NgModule({
    declarations: [
        AppComponent,
        MapComponent,
        HeaderComponent,
        SideNavComponent,
        FeatureDataComponent,
        HomeComponent,
        LoginComponent,
        SettingsComponent,
        PasswordComponent,
        FilterPipe,
        NumFilterPipe,
        PagePipe,
        NotifComponent,
        ApiKeyComponent,
        ProfileComponent,
        ChangePictureComponent,
        NotifComponent,
        MeasureComponent,
        FilterComponent,
        StyleComponent,
        LayerFilterPipe,
        PageComponent2,
        PageConfigComponent2,
        ConfirmDeleteComponent
    ],

    entryComponents: [
        ChangePictureComponent,
        PageComponent2,
        PageConfigComponent2,
        ConfirmDeleteComponent
    ],

    imports: [
        BrowserModule,
        FormsModule,
        //CommonModule,
        HttpClientModule,
        HttpClientJsonpModule,
        Routing,
        RouterModule.forRoot([
            {
                path: 'home',
                component: HomeComponent
            }
        ]),
        //AdminModule,
        FormsModule,
        ReactiveFormsModule,
        //BrowserAnimationsModule,
        NoopAnimationsModule,
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
        DragDropModule,
        MatSliderModule
    ],

    providers: [
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
        ServerService,
        geoJSONService,
        MyCubeService,
        WMSService,
        SideNavService,
        MessageService,
        mapStyles,
        ImageService,
        NotifService,
        FeatureModulesService,
        UserPageInstanceService,
        ModuleService,
        MapConfigService,
        UserService
    ],

    bootstrap: [AppComponent]
})

export class AppModule { }
