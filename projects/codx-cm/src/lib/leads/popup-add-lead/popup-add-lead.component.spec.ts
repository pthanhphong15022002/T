import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddLeadComponent } from './popup-add-lead.component';

describe('PopupAddLeadComponent', () => {
  let component: PopupAddLeadComponent;
  let fixture: ComponentFixture<PopupAddLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddLeadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
