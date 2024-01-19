import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsOfMearSureAdd } from './unitsofmearsure-add.component';

describe('PopAddMearsureComponent', () => {
  let component: UnitsOfMearSureAdd;
  let fixture: ComponentFixture<UnitsOfMearSureAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitsOfMearSureAdd ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitsOfMearSureAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
