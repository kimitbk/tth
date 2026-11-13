import { ENGLISH } from "./english";
import { MATH } from "./math";
import { EXERCISE_TYPES, type Exercise, type Subject, type Topic } from "./types";
import { shuffle } from "./util";
import { VIETNAMESE } from "./vietnamese";

export const SUBJECTS: Subject[] = [MATH, VIETNAMESE, ENGLISH];

/** Every round contains each exercise type this many times. */
export const PER_TYPE = 2;
export const QUESTIONS_PER_ROUND = EXERCISE_TYPES.length * PER_TYPE;

export function getSubject(id: string) {
  return SUBJECTS.find((s) => s.id === id);
}

export function getTopic(subjectId: string, topicId: string) {
  return getSubject(subjectId)?.topics.find((t) => t.id === topicId);
}

export function topicKey(subjectId: string, topicId: string) {
  return `${subjectId}/${topicId}`;
}

/**
 * A round goes through all six exercise types, then all six again, each pass in a new
 * order, so every round always contains every type and the same type never repeats back to back.
 */
export function makeRound(topic: Topic): Exercise[] {
  const out: Exercise[] = [];
  let last: string | undefined;
  for (let pass = 0; pass < PER_TYPE; pass++) {
    let order = shuffle(EXERCISE_TYPES);
    if (order[0] === last) order = [...order.slice(1), order[0]];
    for (const t of order) out.push(topic.make[t]());
    last = order[order.length - 1];
  }
  return out;
}

export type { Exercise, ExerciseType, Subject, Topic, Visual } from "./types";
export { EXERCISE_LABELS, EXERCISE_TYPES } from "./types";
