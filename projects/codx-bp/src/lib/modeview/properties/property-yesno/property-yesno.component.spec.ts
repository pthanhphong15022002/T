import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyYesnoComponent } from './property-yesno.component';

describe('PropertyYesnoComponent', () => {
  let component: PropertyYesnoComponent;
  let fixture: ComponentFixture<PropertyYesnoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyYesnoComponent]
    });
    fixture = TestBed.createComponent(PropertyYesnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
