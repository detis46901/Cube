import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultsComponent } from './defaults.component';

describe('DefaultsComponent', () => {
  let component: DefaultsComponent;
  let fixture: ComponentFixture<DefaultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
