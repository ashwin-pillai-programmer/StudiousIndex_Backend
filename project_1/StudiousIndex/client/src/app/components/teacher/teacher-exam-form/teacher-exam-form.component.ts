import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-teacher-exam-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mt-4 mb-5">
      <h2>{{ isEditMode ? 'Edit Exam' : 'Create New Exam' }}</h2>
      
      <form [formGroup]="examForm" (ngSubmit)="onSubmit()">
        <div class="card mb-4">
          <div class="card-header">Exam Details</div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Title</label>
              <input type="text" class="form-control" formControlName="title">
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" formControlName="description"></textarea>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Grade</label>
                <input type="text" class="form-control" formControlName="grade">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Board</label>
                <input type="text" class="form-control" formControlName="board">
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Duration (Minutes)</label>
                <input type="number" class="form-control" formControlName="durationMinutes">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Scheduled Date</label>
                <input type="datetime-local" class="form-control" formControlName="scheduledDate">
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>Questions</span>
            <button type="button" class="btn btn-sm btn-success" (click)="addQuestion()">Add Question</button>
          </div>
          <div class="card-body">
            <div formArrayName="questions">
              <div *ngFor="let q of questions.controls; let i=index" [formGroupName]="i" class="border p-3 mb-3 rounded">
                <div class="d-flex justify-content-between mb-2">
                  <h5>Question {{ i + 1 }}</h5>
                  <button type="button" class="btn btn-sm btn-danger" (click)="removeQuestion(i)">Remove</button>
                </div>
                
                <div class="mb-2">
                  <label class="form-label">Question Text</label>
                  <input type="text" class="form-control" formControlName="text">
                </div>
                <div class="mb-2">
                  <label class="form-label">Marks</label>
                  <input type="number" class="form-control" formControlName="marks">
                </div>

                <div class="ms-4 mt-3">
                  <h6>Options</h6>
                  <div formArrayName="options">
                    <div *ngFor="let o of getOptions(i).controls; let j=index" [formGroupName]="j" class="d-flex align-items-center mb-2">
                      <input type="radio" [name]="'correctOption' + i" [checked]="o.get('isCorrect')?.value" (change)="setCorrectOption(i, j)" class="me-2">
                      <input type="text" class="form-control me-2" formControlName="text" placeholder="Option text">
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeOption(i, j)">X</button>
                    </div>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-primary mt-2" (click)="addOption(i)">Add Option</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="examForm.invalid">Save Exam</button>
        <a routerLink="/teacher/dashboard" class="btn btn-secondary ms-2">Cancel</a>
      </form>
    </div>
  `
})
export class TeacherExamFormComponent implements OnInit {
  fb = inject(FormBuilder);
  teacherService = inject(TeacherService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  examForm: FormGroup;
  isEditMode = false;
  examId: number | null = null;

  constructor() {
    this.examForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      grade: ['', Validators.required],
      board: ['', Validators.required],
      durationMinutes: [60, [Validators.required, Validators.min(1)]],
      scheduledDate: ['', Validators.required],
      questions: this.fb.array([])
    });
  }

  ngOnInit() {
    this.examId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.examId) {
      this.isEditMode = true;
      this.loadExam(this.examId);
    } else {
      // Add one default question
      this.addQuestion();
    }
  }

  get questions() {
    return this.examForm.get('questions') as FormArray;
  }

  getOptions(questionIndex: number) {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addQuestion() {
    const question = this.fb.group({
      text: ['', Validators.required],
      marks: [1, [Validators.required, Validators.min(1)]],
      options: this.fb.array([])
    });
    this.questions.push(question);
    // Add 2 default options
    this.addOption(this.questions.length - 1);
    this.addOption(this.questions.length - 1);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
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

  setCorrectOption(questionIndex: number, optionIndex: number) {
    const options = this.getOptions(questionIndex);
    options.controls.forEach((ctrl, idx) => {
      ctrl.patchValue({ isCorrect: idx === optionIndex });
    });
  }

  loadExam(id: number) {
    this.teacherService.getExam(id).subscribe(exam => {
      this.examForm.patchValue({
        title: exam.title,
        description: exam.description,
        grade: exam.grade,
        board: exam.board,
        durationMinutes: exam.durationMinutes,
        scheduledDate: exam.scheduledDate
      });
      
      this.questions.clear();
      exam.questions.forEach(q => {
        const questionGroup = this.fb.group({
          text: [q.text, Validators.required],
          marks: [q.marks, Validators.required],
          options: this.fb.array([])
        });
        
        const optionsArray = questionGroup.get('options') as FormArray;
        q.options.forEach(o => {
          optionsArray.push(this.fb.group({
            text: [o.text, Validators.required],
            isCorrect: [o.isCorrect]
          }));
        });
        
        this.questions.push(questionGroup);
      });
    });
  }

  onSubmit() {
    if (this.examForm.invalid) return;

    const examData = this.examForm.value;

    if (this.isEditMode && this.examId) {
      this.teacherService.updateExam(this.examId, examData).subscribe(() => {
        this.router.navigate(['/teacher/dashboard']);
      });
    } else {
      this.teacherService.createExam(examData).subscribe(() => {
        this.router.navigate(['/teacher/dashboard']);
      });
    }
  }
}
