import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OkrPlanShareComponent } from './okr-plans-share.component';


describe('OkrEditComponent', () => {
  let component: OkrPlanShareComponent;
  let fixture: ComponentFixture<OkrPlanShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OkrPlanShareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OkrPlanShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
