import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalcoeffempComponent } from './salcoeffemp.component';

describe('SalcoeffempComponent', () => {
  let component: SalcoeffempComponent;
  let fixture: ComponentFixture<SalcoeffempComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalcoeffempComponent]
    });
    fixture = TestBed.createComponent(SalcoeffempComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
