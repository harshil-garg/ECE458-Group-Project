import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFormulaDialogComponent } from './add-formula-dialog.component';

describe('AddFormulaDialogComponent', () => {
  let component: AddFormulaDialogComponent;
  let fixture: ComponentFixture<AddFormulaDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFormulaDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFormulaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
