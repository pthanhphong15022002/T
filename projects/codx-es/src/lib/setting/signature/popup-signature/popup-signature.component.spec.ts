import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSignatureComponent } from './popup-signature.component';

describe('PopupSignatureComponent', () => {
  let component: PopupSignatureComponent;
  let fixture: ComponentFixture<PopupSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupSignatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
