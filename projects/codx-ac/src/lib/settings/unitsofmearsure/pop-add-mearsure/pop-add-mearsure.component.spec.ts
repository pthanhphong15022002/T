import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddMearsureComponent } from './pop-add-mearsure.component';

describe('PopAddMearsureComponent', () => {
  let component: PopAddMearsureComponent;
  let fixture: ComponentFixture<PopAddMearsureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddMearsureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddMearsureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
