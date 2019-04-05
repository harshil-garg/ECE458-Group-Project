import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaEditDialogComponent } from './formula-edit-dialog.component';

describe('FormulaEditDialogComponent', () => {
  let component: FormulaEditDialogComponent;
  let fixture: ComponentFixture<FormulaEditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormulaEditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
