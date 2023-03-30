import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddLinecashComponent } from './pop-add-linecash.component';

describe('PopAddLinecashComponent', () => {
  let component: PopAddLinecashComponent;
  let fixture: ComponentFixture<PopAddLinecashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddLinecashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddLinecashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
