import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailStorageComponent } from './detail-storage.component';

describe('DetailStorageComponent', () => {
  let component: DetailStorageComponent;
  let fixture: ComponentFixture<DetailStorageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailStorageComponent]
    });
    fixture = TestBed.createComponent(DetailStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
