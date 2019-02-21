import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturingGoalTableComponent } from './manufacturing-goal-table.component';

describe('ManufacturingGoalTableComponent', () => {
  let component: ManufacturingGoalTableComponent;
  let fixture: ComponentFixture<ManufacturingGoalTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManufacturingGoalTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufacturingGoalTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
