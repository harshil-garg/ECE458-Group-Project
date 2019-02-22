import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSkuComponent } from './search-sku.component';

describe('SearchSkuComponent', () => {
  let component: SearchSkuComponent;
  let fixture: ComponentFixture<SearchSkuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchSkuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchSkuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
