import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupViewallBenefitComponent } from './popup-viewall-benefit.component';

describe('PopupViewallBenefitComponent', () => {
  let component: PopupViewallBenefitComponent;
  let fixture: ComponentFixture<PopupViewallBenefitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupViewallBenefitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupViewallBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
