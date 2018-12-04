import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureModulesComponent } from './feature-modules.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { LocatesModule } from './feature-modules/locates/locates.module';

@NgModule({
  imports: [
    CommonModule,
    MatExpansionModule,
    LocatesModule
  ],
  declarations: [FeatureModulesComponent],
  exports: [FeatureModulesComponent]
})
export class FeatureModulesModule { }
