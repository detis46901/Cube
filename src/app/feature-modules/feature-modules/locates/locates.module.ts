import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocatesComponent } from './locates.component';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocatesService } from '../locates/locates.service'
import { StyleService } from '../locates/style.service'
import { LocatesAdminService } from '../locates/locates-admin.service'
import { locateStyles } from './locates.model'
import { ModuleInstanceService } from './../../../../_services/_moduleInstance.service'
import { NgxSoapModule } from 'ngx-soap'


@NgModule({
  imports: [
    CommonModule,
    MatExpansionModule,
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
    FormsModule,
    ReactiveFormsModule,
    NgxSoapModule

  ],
  declarations: [LocatesComponent],
  providers: [LocatesService, LocatesAdminService, locateStyles, ModuleInstanceService, StyleService],
  exports:[LocatesComponent]
})
export class LocatesModule { }
