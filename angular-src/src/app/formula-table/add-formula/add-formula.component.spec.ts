import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFormulaComponent } from './add-formula.component';

describe('AddFormulaComponent', () => {
  let component: AddFormulaComponent;
  let fixture: ComponentFixture<AddFormulaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFormulaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
