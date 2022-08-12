import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxFilesComponent } from './codx-files.component';

describe('CodxFilesComponent', () => {
  let component: CodxFilesComponent;
  let fixture: ComponentFixture<CodxFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
