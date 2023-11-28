import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsConversionAddComponent } from './items-conversion-add.component';

describe('PopupAddItemConversionComponent', () => {
  let component: ItemsConversionAddComponent;
  let fixture: ComponentFixture<ItemsConversionAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemsConversionAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsConversionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
