import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExamService } from '../../services/exam.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exam-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exam-create.component.html',
  styleUrl: './exam-create.component.css'
})
export class ExamCreateComponent {
  examForm: FormGroup;
  
  fb = inject(FormBuilder);
  examService = inject(ExamService);
  router = inject(Router);

  constructor() {
    this.examForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      durationMinutes: [60, Validators.required],
      questions: this.fb.array([])
    });
    
    this.addQuestion(); // Start with 1 question
  }

  get questions() {
    return this.examForm.get('questions') as FormArray;
  }

  addQuestion() {
    const question = this.fb.group({
      text: ['', Validators.required],
      marks: [1, Validators.required],
      options: this.fb.array([])
    });
    this.questions.push(question);
    this.addOption(this.questions.length - 1);
    this.addOption(this.questions.length - 1); // Start with 2 options
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  getOptions(questionIndex: number) {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number) {
    const option = this.fb.group({
      text: ['', Validators.required],
      isCorrect: [false]
    });
    this.getOptions(questionIndex).push(option);
  }

  removeOption(questionIndex: number, optionIndex: number) {
    this.getOptions(questionIndex).removeAt(optionIndex);
  }

  onSubmit() {
    if (this.examForm.valid) {
      // Custom Validation: Check if every question has at least one correct option
      const questions = this.examForm.value.questions;
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const hasCorrectOption = q.options.some((o: any) => o.isCorrect);
        if (!hasCorrectOption) {
          alert(`Question ${i + 1} must have at least one correct answer selected.`);
          return;
        }
        if (q.options.length < 2) {
            alert(`Question ${i + 1} must have at least two options.`);
            return;
        }
      }

      this.examService.createExam(this.examForm.value).subscribe({
        next: () => {
          alert('Exam created successfully!');
          this.router.navigate(['/exams']);
        },
        error: (err) => {
            console.error(err);
            alert(err.error || 'Failed to create exam. Please check your inputs.');
        }
      });
    } else {
        alert('Please fill in all required fields.');
    }
  }
}
