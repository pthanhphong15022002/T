import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddItemComponent } from './pop-add-item.component';

describe('PopAddItemComponent', () => {
  let component: PopAddItemComponent;
  let fixture: ComponentFixture<PopAddItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopAddItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopAddItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
