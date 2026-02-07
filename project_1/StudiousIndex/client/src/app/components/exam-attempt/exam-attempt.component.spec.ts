import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamAttemptComponent } from './exam-attempt.component';

describe('ExamAttemptComponent', () => {
  let component: ExamAttemptComponent;
  let fixture: ComponentFixture<ExamAttemptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamAttemptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExamAttemptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
