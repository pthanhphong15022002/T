import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxWpComponent } from './codx-wp.component';

describe('CodxWpComponent', () => {
  let component: CodxWpComponent;
  let fixture: ComponentFixture<CodxWpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxWpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxWpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
