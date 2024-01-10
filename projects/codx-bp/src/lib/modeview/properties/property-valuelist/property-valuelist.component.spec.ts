import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyValueListComponent } from './property-valuelist.component';

describe('PropertyTextComponent', () => {
  let component: PropertyValueListComponent;
  let fixture: ComponentFixture<PropertyValueListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyValueListComponent]
    });
    fixture = TestBed.createComponent(PropertyValueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
