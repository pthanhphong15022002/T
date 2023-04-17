import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddConversionComponent } from './pop-add-conversion.component';

describe('PopAddConversionComponent', () => {
  let component: PopAddConversionComponent;
  let fixture: ComponentFixture<PopAddConversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddConversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
