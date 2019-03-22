import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDrilldownComponent } from './sales-drilldown.component';

describe('SalesDrilldownComponent', () => {
  let component: SalesDrilldownComponent;
  let fixture: ComponentFixture<SalesDrilldownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesDrilldownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesDrilldownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
