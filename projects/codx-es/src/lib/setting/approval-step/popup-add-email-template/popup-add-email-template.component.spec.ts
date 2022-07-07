import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddEmailTemplateComponent } from './popup-add-email-template.component';

describe('PopupAddEmailTemplateComponent', () => {
  let component: PopupAddEmailTemplateComponent;
  let fixture: ComponentFixture<PopupAddEmailTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddEmailTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddEmailTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
