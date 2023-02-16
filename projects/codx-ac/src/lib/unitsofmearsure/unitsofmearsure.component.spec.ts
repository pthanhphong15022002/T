import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsofmearsureComponent } from './unitsofmearsure.component';

describe('UnitsofmearsureComponent', () => {
  let component: UnitsofmearsureComponent;
  let fixture: ComponentFixture<UnitsofmearsureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitsofmearsureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitsofmearsureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
