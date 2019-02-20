import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaTableComponent } from './formula-table.component';

describe('FormulaTableComponent', () => {
  let component: FormulaTableComponent;
  let fixture: ComponentFixture<FormulaTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormulaTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
