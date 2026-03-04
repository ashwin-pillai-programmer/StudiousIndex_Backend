import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface AboutCard {
  title: string;
  description: string;
}

interface FeaturedClass {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

interface FeatureHighlight {
  icon: string;
  title: string;
  description: string;
}

interface RolePanel {
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentYear = new Date().getFullYear();

  aboutCards: AboutCard[] = [
    {
      title: 'Online Exam System',
      description: 'Create, schedule, and conduct secure online exams with flexible patterns and timing.'
    },
    {
      title: 'Video Lectures',
      description: 'Host structured video content so students can revise concepts at their own pace.'
    },
    {
      title: 'Automated Report Cards',
      description: 'Instantly generate detailed report cards after each exam attempt.'
    },
    {
      title: 'Performance Analytics',
      description: 'Visualize scores, trends, and rankings to understand progress over time.'
    }
  ];

  featuredClasses: FeaturedClass[] = [
    {
      title: 'Class 1 – Math',
      subtitle: 'Strong foundations',
      description: 'Fun, visual math concepts for early learners.',
      icon: 'bi-calculator'
    },
    {
      title: 'Class 1 – English',
      subtitle: 'Language basics',
      description: 'Reading, vocabulary, and basic grammar practice.',
      icon: 'bi-chat-dots'
    },
    {
      title: 'Class 2 – Math',
      subtitle: 'Concept building',
      description: 'Numbers, patterns, and problem-solving skills.',
      icon: 'bi-bar-chart'
    },
    {
      title: 'Class 2 – English',
      subtitle: 'Fluent expression',
      description: 'Story-based learning and grammatical accuracy.',
      icon: 'bi-journal-richtext'
    }
  ];

  featureHighlights: FeatureHighlight[] = [
    {
      icon: 'bi-graph-up-arrow',
      title: 'Smart Result Analysis',
      description: 'Understand performance by subject, topic, and attempt history.'
    },
    {
      icon: 'bi-play-circle-fill',
      title: 'Video Learning',
      description: 'High-quality video lectures attached directly to exam topics.'
    },
    {
      icon: 'bi-trophy',
      title: 'Ranking System',
      description: 'Motivate students with class-wise and school-wise leaderboards.'
    },
    {
      icon: 'bi-file-earmark-text',
      title: 'Downloadable Report Cards',
      description: 'Generate printable, well-formatted PDFs for parents and teachers.'
    }
  ];

  rolePanels: RolePanel[] = [
    {
      title: 'Admin Panel',
      description: 'Configure the platform, approve content, and monitor overall performance.',
      link: '/admin'
    },
    {
      title: 'Teacher Panel',
      description: 'Create exams, upload lectures, and view student attempts in one place.',
      link: '/teacher'
    },
    {
      title: 'Student Panel',
      description: 'Attempt exams, watch lectures, and track progress in a clean dashboard.',
      link: '/student'
    }
  ];
}
