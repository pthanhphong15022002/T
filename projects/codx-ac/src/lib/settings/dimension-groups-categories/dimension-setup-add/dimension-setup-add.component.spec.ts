import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionSetupAddComponent } from './dimension-setup-add.component';

describe('PopAddDimensionSetupComponent', () => {
  let component: DimensionSetupAddComponent;
  let fixture: ComponentFixture<DimensionSetupAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DimensionSetupAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionSetupAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
