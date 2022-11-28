import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEmployeePartyInfoComponent } from './popup-employee-party-info.component';

describe('PopupEmployeePartyInfoComponent', () => {
  let component: PopupEmployeePartyInfoComponent;
  let fixture: ComponentFixture<PopupEmployeePartyInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEmployeePartyInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEmployeePartyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
