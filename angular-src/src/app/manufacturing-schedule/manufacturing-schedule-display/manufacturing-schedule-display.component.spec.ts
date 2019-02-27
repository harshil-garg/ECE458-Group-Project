import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturingScheduleDisplayComponent } from './manufacturing-schedule-display.component';

describe('ManufacturingScheduleDisplayComponent', () => {
  let component: ManufacturingScheduleDisplayComponent;
  let fixture: ComponentFixture<ManufacturingScheduleDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManufacturingScheduleDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufacturingScheduleDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
