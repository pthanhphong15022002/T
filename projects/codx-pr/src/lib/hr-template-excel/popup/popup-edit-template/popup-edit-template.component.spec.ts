import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditTemplateComponent } from './popup-edit-template.component';

describe('PopupEditTemplateComponent', () => {
  let component: PopupEditTemplateComponent;
  let fixture: ComponentFixture<PopupEditTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupEditTemplateComponent]
    });
    fixture = TestBed.createComponent(PopupEditTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
