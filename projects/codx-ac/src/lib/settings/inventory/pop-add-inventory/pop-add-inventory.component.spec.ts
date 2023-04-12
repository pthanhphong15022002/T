import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddInventoryComponent } from './pop-add-inventory.component';

describe('PopAddInventoryComponent', () => {
  let component: PopAddInventoryComponent;
  let fixture: ComponentFixture<PopAddInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
