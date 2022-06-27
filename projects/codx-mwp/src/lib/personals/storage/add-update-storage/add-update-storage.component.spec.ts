import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateStorageComponent } from './add-update-storage.component';

describe('AddUpdateStorageComponent', () => {
  let component: AddUpdateStorageComponent;
  let fixture: ComponentFixture<AddUpdateStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateStorageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
