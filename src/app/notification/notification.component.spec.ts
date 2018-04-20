import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifComponent } from './notification.component';

describe('NotifComponent', () => {
  let component: NotifComponent;
  let fixture: ComponentFixture<NotifComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotifComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
