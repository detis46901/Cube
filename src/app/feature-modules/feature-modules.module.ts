import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureModulesComponent } from './feature-modules.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import {MatDividerModule} from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LocatesModule } from './feature-modules/locates/locates.module';
import { SDSModule } from './feature-modules/SDS/SDS.module'
import { openAerialMapModule } from './feature-modules/open-aerial-map/open-aerial-map.module';
import {WOModule} from './feature-modules/WO/WO.module';
import { FeatureModulesAdminComponent } from './feature-modules-admin/feature-modules-admin.component'

@NgModule({
  imports: [
    CommonModule,
    MatExpansionModule,
    LocatesModule,
    openAerialMapModule,
    SDSModule,
    WOModule,
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
  ],
  declarations: [FeatureModulesComponent, FeatureModulesAdminComponent],
  exports: [FeatureModulesComponent]
})
export class FeatureModulesModule { }
