import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddCrmPartnerComponent } from './popup-add-crm-partner.component';

describe('PopupAddCrmPartnerComponent', () => {
  let component: PopupAddCrmPartnerComponent;
  let fixture: ComponentFixture<PopupAddCrmPartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddCrmPartnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddCrmPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
