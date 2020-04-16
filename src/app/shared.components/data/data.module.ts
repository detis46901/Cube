import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataFormComponentComponent } from '../data-component/data-form-component/data-form-component.component'
import { LogFormComponentComponent } from '../data-component/log-form-component/log-form-component.component'
import { HtmlFormComponent } from '../data-component/html-form-component/html-form.component'
import { DataFormService } from '../data-component/data-form.service'
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

@NgModule({
  declarations: [DataFormComponentComponent, LogFormComponentComponent, HtmlFormComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatTableModule,
    MatToolbarModule,
    MatDividerModule,
    MatChipsModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    FormsModule, ReactiveFormsModule
  ],
  providers: [DataFormService],
  exports: [LogFormComponentComponent, DataFormService, DataFormComponentComponent, HtmlFormComponent]
})

export class DataModule { }
