import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageComponent } from './storage.component';

describe('ArchivesComponent', () => {
  let component: StorageComponent;
  let fixture: ComponentFixture<StorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StorageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
