import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManufacturingGoalDialogComponent } from './add-manufacturing-goal-dialog.component';

describe('AddManufacturingGoalDialogComponent', () => {
  let component: AddManufacturingGoalDialogComponent;
  let fixture: ComponentFixture<AddManufacturingGoalDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddManufacturingGoalDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddManufacturingGoalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
