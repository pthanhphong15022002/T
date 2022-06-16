import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MwpComponent } from './mwp.component';

describe('MwpComponent', () => {
  let component: MwpComponent;
  let fixture: ComponentFixture<MwpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MwpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MwpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
