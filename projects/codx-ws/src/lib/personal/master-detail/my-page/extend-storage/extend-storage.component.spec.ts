import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendStorageComponent } from './extend-storage.component';

describe('ExtendStorageComponent', () => {
  let component: ExtendStorageComponent;
  let fixture: ComponentFixture<ExtendStorageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExtendStorageComponent]
    });
    fixture = TestBed.createComponent(ExtendStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
