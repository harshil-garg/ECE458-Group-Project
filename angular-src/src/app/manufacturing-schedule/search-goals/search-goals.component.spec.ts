import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchGoalsComponent } from './search-goals.component';

describe('SearchGoalsComponent', () => {
  let component: SearchGoalsComponent;
  let fixture: ComponentFixture<SearchGoalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchGoalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
