export type TaskType = 'question' | 'multiple_choice' | 'qr_code' | 'photo';

export interface QuestionTask {
  type: 'question';
  prompt: string;
  acceptedAnswers: string[];
}

// Placeholders for future task types — data model is ready, editor UI is not (yet).
export interface MultipleChoiceTask {
  type: 'multiple_choice';
  prompt: string;
  choices: string[];
  correctChoiceIndex: number;
}

export interface QrCodeTask {
  type: 'qr_code';
  expectedCode: string;
}

export interface PhotoTask {
  type: 'photo';
  prompt: string;
}

export type Task = QuestionTask | MultipleChoiceTask | QrCodeTask | PhotoTask;

export interface Station {
  id: string;
  gameId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  points: number;
  order: number;
  task: Task;
}

export interface Game {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface NewGame {
  name: string;
  description?: string;
}

export type NewStation = Omit<Station, 'id'>;
