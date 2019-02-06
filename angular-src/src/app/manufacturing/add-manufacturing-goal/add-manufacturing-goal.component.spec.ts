import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManufacturingGoalComponent } from './add-manufacturing-goal.component';

describe('AddManufacturingGoalComponent', () => {
  let component: AddManufacturingGoalComponent;
  let fixture: ComponentFixture<AddManufacturingGoalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddManufacturingGoalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddManufacturingGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
