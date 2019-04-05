import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormulaComponent } from './search-formula.component';

describe('SearchFormulaComponent', () => {
  let component: SearchFormulaComponent;
  let fixture: ComponentFixture<SearchFormulaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormulaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
