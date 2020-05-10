import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Routing } from './app.routing';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { AdminNavComponent } from './adminnav/adminnav.component';
import { LayerComponent } from './layer/layer.component';
import { InstanceComponent } from './module/instance.component';
import { InstanceNewComponent } from './module/instanceNew/instanceNew.component'
import { LayerPermissionComponent } from './layer/layerPermission/layerPermission.component';
import { ModulePermissionComponent } from './module/modulePermission/modulePermission.component';
import { LayerStyleComponent } from './layer/layerStyle/layerStyle.component'
import { PageComponent } from './user/page/page.component';
import { PageConfigComponent } from './user/pageconfig/pageconfig.component';
import { LayerNewComponent } from './layer/layerNew/layerNew.component';
import { newMyCubeComponent } from './layer/myCubeLayer/newMyCube.component';
import { UserComponent } from './user/user.component';
import { DefaultsComponent } from './default/default.component';
import { ServerComponent } from './server/server.component';
import { ConfirmDeleteComponent } from './confirmdelete/confirmdelete.component';
import { ServerNewComponent } from './server/serverNew/serverNew.component';
import { ChangePasswordComponent } from './user/changepassword/changepassword.component';
import { GroupComponent } from './group/group.component';
import { NewGroupComponent } from './group/newGroup/newGroup.component';
import { NewUserComponent } from './user/newUser/newUser.component';
import { LayerDetailsComponent } from './details/layerDetails/layerDetails.component';
import { InstanceDetailsComponent } from './details/instanceDetails/instanceDetails.component';
import { EditGroupComponent } from './group/editGroup/editGroup.component'
import { UserDetailsComponent } from './details/userDetails/userDetails.component';
import { ServerDetailsComponent } from './details/serverDetails/serverDetails.component';
import { ServerLayersComponent } from './server/serverLayers/serverLayers.component';
import { ModuleSettingsComponent } from './module/moduleSettings/moduleSettings.component'
import { PagePipe, LayerFilterPipe, UserPipe } from '../admin/_pipes/rowfilter2.pipe'
import {DragDropModule} from '@angular/cdk/drag-drop';


//Angular Material
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu'
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


@NgModule({
  declarations: [
    PageComponent,
    AdminComponent,
    AdminNavComponent,
    GroupComponent,
    LayerComponent,
    InstanceComponent,
    UserComponent,
    LayerPermissionComponent,
    ModulePermissionComponent,
    LayerStyleComponent,
    PageComponent,
    PageConfigComponent,
    LayerNewComponent,
    newMyCubeComponent,
    ConfirmDeleteComponent,
    DefaultsComponent,
    ServerComponent,
    ServerNewComponent,
    ChangePasswordComponent,
    NewUserComponent,
    NewGroupComponent,
    LayerDetailsComponent,
    InstanceDetailsComponent,
    EditGroupComponent,
    UserDetailsComponent,
    ServerDetailsComponent,
    ServerLayersComponent,
    ModuleSettingsComponent,
    InstanceNewComponent,
    PagePipe,
    LayerFilterPipe,
    UserPipe
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
    LayerDetailsComponent,
    UserDetailsComponent,
    ServerDetailsComponent,
    ServerLayersComponent,
    ModuleSettingsComponent,
    InstanceNewComponent,
    InstanceDetailsComponent
  ],

  imports: [
    RouterModule.forChild([
      {
        path: 'admin',
        component: AdminComponent
    },
    ]),
    Routing,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    //BrowserAnimationsModule,
    //NoopAnimationsModule,
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
    DragDropModule
  ],
  providers: [
  ],
  exports: [
    RouterModule
  ]
})
export class AdminModule { }
