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

export enum FinalDecision {
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
