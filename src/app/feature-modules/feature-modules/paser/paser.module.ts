import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaserComponent } from './paser.component';
//Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaserService } from '../paser/paser.service'
import { StyleService } from '../paser/style.service'
import { PaserAdminService } from '../paser/paser-admin.service'
import { PaserStyles } from './paser.model'
import { ModuleInstanceService } from '../../../../_services/_moduleInstance.service'
import { LinkyModule } from 'ngx-linky';
import { DataModule } from '../../../shared.components/data/data.module'
// import { DataFormComponentComponent } from '../../../shared.components/data-component/data-form-component/data-form-component.component'
// import { LogFormComponentComponent } from '../../../shared.components/data-component/log-form-component/log-form-component.component'
// import { DataFormService } from '../../../shared.components/data-component/data-form.service'


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
    LinkyModule,
    DataModule

  ],
  declarations: [PaserComponent,
    // DataFormComponentComponent,
    // LogFormComponentComponent
  ],
  providers: [PaserService, PaserAdminService, PaserStyles, ModuleInstanceService, StyleService],
  exports:[PaserComponent]
})
export class PaserModule { }
