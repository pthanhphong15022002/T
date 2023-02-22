import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddDimensionSetupComponent } from './pop-add-dimension-setup.component';

describe('PopAddDimensionSetupComponent', () => {
  let component: PopAddDimensionSetupComponent;
  let fixture: ComponentFixture<PopAddDimensionSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddDimensionSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddDimensionSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
