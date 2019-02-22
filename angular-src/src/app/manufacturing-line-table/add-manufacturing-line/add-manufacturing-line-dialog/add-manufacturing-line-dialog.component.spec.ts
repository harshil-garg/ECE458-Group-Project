import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManufacturingLineDialogComponent } from './add-manufacturing-line-dialog.component';

describe('AddManufacturingLineDialogComponent', () => {
  let component: AddManufacturingLineDialogComponent;
  let fixture: ComponentFixture<AddManufacturingLineDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddManufacturingLineDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddManufacturingLineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
