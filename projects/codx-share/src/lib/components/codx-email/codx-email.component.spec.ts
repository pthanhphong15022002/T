import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxEmailComponent } from './codx-email.component';

describe('CodxEmailComponent', () => {
  let component: CodxEmailComponent;
  let fixture: ComponentFixture<CodxEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxEmailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
