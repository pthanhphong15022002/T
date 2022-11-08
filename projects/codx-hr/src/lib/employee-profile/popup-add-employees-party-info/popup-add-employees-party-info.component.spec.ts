import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddEmployeesPartyInfoComponent } from './popup-add-employees-party-info.component';

describe('PopupAddEmployeesPartyInfoComponent', () => {
  let component: PopupAddEmployeesPartyInfoComponent;
  let fixture: ComponentFixture<PopupAddEmployeesPartyInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddEmployeesPartyInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddEmployeesPartyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
