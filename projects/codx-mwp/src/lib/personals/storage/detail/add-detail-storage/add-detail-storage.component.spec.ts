import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDetailStorageComponent } from './add-detail-storage.component';

describe('AddDetailStorageComponent', () => {
  let component: AddDetailStorageComponent;
  let fixture: ComponentFixture<AddDetailStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDetailStorageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDetailStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
