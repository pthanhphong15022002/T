import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddContactComponent } from './pop-add-contact.component';

describe('PopAddContactComponent', () => {
  let component: PopAddContactComponent;
  let fixture: ComponentFixture<PopAddContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddContactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
