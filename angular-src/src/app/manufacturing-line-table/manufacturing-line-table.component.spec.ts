import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturingLineTableComponent } from './manufacturing-line-table.component';

describe('ManufacturingLineTableComponent', () => {
  let component: ManufacturingLineTableComponent;
  let fixture: ComponentFixture<ManufacturingLineTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManufacturingLineTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufacturingLineTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
