import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UiParentComponent } from './ui-parent.component';

describe('UiParentComponent', () => {
  let component: UiParentComponent;
  let fixture: ComponentFixture<UiParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UiParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UiParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
