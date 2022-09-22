import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPatternComponent } from './edit-pattern.component';

describe('EditPatternComponent', () => {
  let component: EditPatternComponent;
  let fixture: ComponentFixture<EditPatternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPatternComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
