import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashrecieptDetailComponent } from './cashreciept-detail.component';

describe('CashrecieptDetailComponent', () => {
  let component: CashrecieptDetailComponent;
  let fixture: ComponentFixture<CashrecieptDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashrecieptDetailComponent]
    });
    fixture = TestBed.createComponent(CashrecieptDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
