import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WpBreadcumComponent } from './wp-breadcum.component';

describe('WpBreadcumComponent', () => {
  let component: WpBreadcumComponent;
  let fixture: ComponentFixture<WpBreadcumComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WpBreadcumComponent]
    });
    fixture = TestBed.createComponent(WpBreadcumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
