import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddLineComponent } from './pop-add-line.component';

describe('PopAddLineComponent', () => {
  let component: PopAddLineComponent;
  let fixture: ComponentFixture<PopAddLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
