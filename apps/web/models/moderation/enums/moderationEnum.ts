// models/moderation/enums.ts

export enum AppealStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// export enum TargetType {
//   POST = 'POST',
//   SHARE = 'SHARE',
//   COMMENT = 'COMMENT',
// }

export enum Severity {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum ModerationAction {
  ALLOW = 'ALLOW',
  ALLOW_WITH_WARNING = 'ALLOW_WITH_WARNING',
  ALLOW_WITH_SUPPORT = 'ALLOW_WITH_SUPPORT',
  HARD_BLOCK = 'HARD_BLOCK',
}

export enum ModerationLabel {
  CLEAN = 'CLEAN',
  PROFANITY_VENTING = 'PROFANITY_VENTING',
  HATE_SPEECH = 'HATE_SPEECH',
  EMOTIONAL_CRISIS = 'EMOTIONAL_CRISIS',
  ILLEGAL_PORN = 'ILLEGAL_PORN',
}

export enum FinalDecision {
  VIOLATION = 'VIOLATION',
  NO_VIOLATION = 'NO_VIOLATION',
}

export enum FinalDecisionFilter {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
  VIOLATION = 'VIOLATION',
  NO_VIOLATION = 'NO_VIOLATION',
}


export enum Audience {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE',
}

// export enum Emotion {
//   HAPPY = 'HAPPY',
//   SAD = 'SAD',
//   ANGRY = 'ANGRY',
//   LOVE = 'LOVE',
//   WOW = 'WOW',
// }

// export enum ReactionType {
//   LIKE = 'LIKE',
//   LOVE = 'LOVE',
//   HAHA = 'HAHA',
//   WOW = 'WOW',
//   SAD = 'SAD',
//   ANGRY = 'ANGRY',
// }
