import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEexperiencesComponent } from './popup-eexperiences.component';

describe('PopupEexperiencesComponent', () => {
  let component: PopupEexperiencesComponent;
  let fixture: ComponentFixture<PopupEexperiencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEexperiencesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEexperiencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
