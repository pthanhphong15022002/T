import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddOpportunityComponent } from './popup-add-opportunity.component';

describe('PopupAddOpportunityComponent', () => {
  let component: PopupAddOpportunityComponent;
  let fixture: ComponentFixture<PopupAddOpportunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddOpportunityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
