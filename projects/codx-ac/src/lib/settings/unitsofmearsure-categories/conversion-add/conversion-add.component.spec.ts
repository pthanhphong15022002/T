import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversionAddComponent } from './conversion-add.component';

describe('PopAddConversionComponent', () => {
  let component: ConversionAddComponent;
  let fixture: ComponentFixture<ConversionAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConversionAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
