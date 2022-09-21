import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBallotComponent } from './edit-ballot.component';

describe('EditBallotComponent', () => {
  let component: EditBallotComponent;
  let fixture: ComponentFixture<EditBallotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBallotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBallotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
