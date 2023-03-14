import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEProcessContractComponent } from './popup-eprocess-contract.component';

describe('PopupEProcessContractComponent', () => {
  let component: PopupEProcessContractComponent;
  let fixture: ComponentFixture<PopupEProcessContractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEProcessContractComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEProcessContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
