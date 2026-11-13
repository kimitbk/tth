import { ENGLISH } from "./english";
import { MATH } from "./math";
import type { Subject } from "./types";
import { VIETNAMESE } from "./vietnamese";

export const SUBJECTS: Subject[] = [MATH, VIETNAMESE, ENGLISH];

export const QUESTIONS_PER_ROUND = 10;

export function getSubject(id: string) {
  return SUBJECTS.find((s) => s.id === id);
}

export function getTopic(subjectId: string, topicId: string) {
  return getSubject(subjectId)?.topics.find((t) => t.id === topicId);
}

export function topicKey(subjectId: string, topicId: string) {
  return `${subjectId}/${topicId}`;
}

export type { Question, Subject, Topic, Visual } from "./types";
