export interface OptionDto {
  id: number;
  text: string;
}

export interface QuestionDetailDto {
  id: number;
  text: string;
  marks: number;
  options: OptionDto[];
}

export interface ExamDto {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  createdBy: string;
  questionCount: number;
  isApproved: boolean;
}

export interface ExamDetailDto {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  createdBy: string;
  questionCount: number;
  questions: QuestionDetailDto[];
}

export interface CreateOptionDto {
  text: string;
  isCorrect: boolean;
}

export interface CreateQuestionDto {
  text: string;
  marks: number;
  options: CreateOptionDto[];
}

export interface CreateExamDto {
  title: string;
  description: string;
  durationMinutes: number;
  questions: CreateQuestionDto[];
}

export interface StudentExamResultDto {
  id: number;
  examTitle: string;
  studentName?: string;
  score: number;
  totalMarks: number;
  submittedAt: Date;
}

export interface ExamResultDetailDto extends StudentExamResultDto {
    questions: QuestionResultDto[];
}

export interface QuestionResultDto {
    id: number;
    text: string;
    marks: number;
    selectedOptionId: number;
    correctOptionId: number;
    isCorrect: boolean;
    options: OptionDto[];
}

export interface ExamSubmissionResult {
    attemptId: number;
    score: number;
    totalMarks: number;
    isPassed: boolean;
    submitTime: Date;
}

export interface StartExamResponse {
  attemptId: number;
  examId: number;
  startTime: string;
}

export interface SubmitAnswerDto {
  questionId: number;
  selectedOptionId: number;
}

export interface SubmitExamDto {
  attemptId: number;
  answers: SubmitAnswerDto[];
}
