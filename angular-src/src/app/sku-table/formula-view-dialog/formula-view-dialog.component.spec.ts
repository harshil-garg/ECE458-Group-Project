import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaViewDialogComponent } from './formula-view-dialog.component';

describe('FormulaViewDialogComponent', () => {
  let component: FormulaViewDialogComponent;
  let fixture: ComponentFixture<FormulaViewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormulaViewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
