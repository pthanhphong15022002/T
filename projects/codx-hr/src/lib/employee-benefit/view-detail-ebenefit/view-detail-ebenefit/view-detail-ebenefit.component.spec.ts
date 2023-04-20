import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailEbenefitComponent } from './view-detail-ebenefit.component';

describe('ViewDetailEbenefitComponent', () => {
  let component: ViewDetailEbenefitComponent;
  let fixture: ComponentFixture<ViewDetailEbenefitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDetailEbenefitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDetailEbenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
