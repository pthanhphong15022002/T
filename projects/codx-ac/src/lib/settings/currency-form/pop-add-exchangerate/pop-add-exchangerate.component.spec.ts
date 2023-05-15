import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddExchangerateComponent } from './pop-add-exchangerate.component';

describe('PopAddExchangerateComponent', () => {
  let component: PopAddExchangerateComponent;
  let fixture: ComponentFixture<PopAddExchangerateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddExchangerateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddExchangerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
