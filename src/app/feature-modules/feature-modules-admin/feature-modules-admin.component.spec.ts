import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureModulesAdminComponent } from './feature-modules-admin.component';

describe('FeatureModulesAdminComponent', () => {
  let component: FeatureModulesAdminComponent;
  let fixture: ComponentFixture<FeatureModulesAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureModulesAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureModulesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
