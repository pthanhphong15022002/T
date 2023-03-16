import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddPurchaseComponent } from './pop-add-purchase.component';

describe('PopAddPurchaseComponent', () => {
  let component: PopAddPurchaseComponent;
  let fixture: ComponentFixture<PopAddPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddPurchaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
