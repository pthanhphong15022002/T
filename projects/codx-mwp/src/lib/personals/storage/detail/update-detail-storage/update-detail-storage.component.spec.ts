import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDetailStorageComponent } from './update-detail-storage.component';

describe('UpdateDetailStorageComponent', () => {
  let component: UpdateDetailStorageComponent;
  let fixture: ComponentFixture<UpdateDetailStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateDetailStorageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDetailStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
