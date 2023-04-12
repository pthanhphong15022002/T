import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddArComponent } from './pop-add-ar.component';

describe('PopAddArComponent', () => {
  let component: PopAddArComponent;
  let fixture: ComponentFixture<PopAddArComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddArComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddArComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
