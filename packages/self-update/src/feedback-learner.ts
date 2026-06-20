import { FeedbackEntry, LearningSignal } from './types.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { join } from 'path';

export class FeedbackLearner {
  private feedback: FeedbackEntry[] = [];
  private signals: LearningSignal[] = [];
  private storagePath: string;

  constructor(basePath: string = '.memory') {
    this.storagePath = basePath;
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true });
    }
    this.load();
  }

  recordFeedback(entry: Omit<FeedbackEntry, 'id' | 'timestamp'>): FeedbackEntry {
    const full: FeedbackEntry = {
      ...entry,
      id: uuid(),
      timestamp: new Date(),
    };
    this.feedback.push(full);
    this.persist();
    
    // Analyze and extract learning signals
    const signals = this.analyzeFeedback(full);
    this.signals.push(...signals);
    
    return full;
  }

  recordCorrection(context: string, userInput: string, systemOutput: string, correctOutput?: string): FeedbackEntry {
    return this.recordFeedback({
      type: 'correction',
      context,
      userInput,
      systemOutput,
      correctOutput,
      source: 'user-correction',
      severity: 'major',
    });
  }

  recordUndo(context: string, userInput: string, systemOutput: string): FeedbackEntry {
    return this.recordFeedback({
      type: 'undo',
      context,
      userInput,
      systemOutput,
      source: 'user-undo',
      severity: 'minor',
    });
  }

  recordReaction(context: string, userInput: string, systemOutput: string, positive: boolean): FeedbackEntry {
    return this.recordFeedback({
      type: 'reaction',
      context,
      userInput,
      systemOutput,
      correctOutput: positive ? systemOutput : undefined,
      source: 'user-reaction',
      severity: positive ? 'minor' : 'major',
    });
  }

  private analyzeFeedback(entry: FeedbackEntry): LearningSignal[] {
    const signals: LearningSignal[] = [];

    // Extract tool preference signals
    if (entry.type === 'correction' || entry.type === 'undo') {
      const toolMatch = entry.systemOutput.match(/\[(\w+)\]/);
      if (toolMatch) {
        signals.push({
          id: uuid(),
          type: 'tool-preference',
          confidence: 0.6,
          signal: `Avoid tool: ${toolMatch[1]} in context "${entry.context.slice(0, 50)}"`,
          applied: false,
          timestamp: new Date(),
        });
      }
    }

    // Extract response style signals
    if (entry.type === 'reaction' && entry.correctOutput === entry.systemOutput) {
      signals.push({
        id: uuid(),
        type: 'response-style',
        confidence: 0.7,
        signal: `User likes this response style for "${entry.context.slice(0, 50)}"`,
        applied: false,
        timestamp: new Date(),
      });
    }

    return signals;
  }

  getLearningSignals(minConfidence: number = 0.5): LearningSignal[] {
    return this.signals.filter(s => s.confidence >= minConfidence && !s.applied);
  }

  applySignal(signalId: string): void {
    const signal = this.signals.find(s => s.id === signalId);
    if (signal) {
      signal.applied = true;
      this.persist();
    }
  }

  getFeedbackStats() {
    return {
      total: this.feedback.length,
      corrections: this.feedback.filter(f => f.type === 'correction').length,
      undos: this.feedback.filter(f => f.type === 'undo').length,
      reactions: this.feedback.filter(f => f.type === 'reaction').length,
      signals: this.signals.length,
      appliedSignals: this.signals.filter(s => s.applied).length,
    };
  }

  private load(): void {
    const feedbackPath = join(this.storagePath, 'feedback.json');
    const signalsPath = join(this.storagePath, 'signals.json');
    
    try {
      if (existsSync(feedbackPath)) {
        this.feedback = JSON.parse(readFileSync(feedbackPath, 'utf-8'));
      }
      if (existsSync(signalsPath)) {
        this.signals = JSON.parse(readFileSync(signalsPath, 'utf-8'));
      }
    } catch (err) {
      console.error('[FeedbackLearner] Load error:', err);
    }
  }

  private persist(): void {
    try {
      writeFileSync(
        join(this.storagePath, 'feedback.json'),
        JSON.stringify(this.feedback, null, 2),
        'utf-8'
      );
      writeFileSync(
        join(this.storagePath, 'signals.json'),
        JSON.stringify(this.signals, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('[FeedbackLearner] Persist error:', err);
    }
  }
}
