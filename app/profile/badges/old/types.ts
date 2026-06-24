export type UserAchievementSlugsType =
  | 'first-mood-session'
  | 'first-skill-score'
  | 'persistent-penguin'
  | 'logical-lion'
  | 'calculating-chimpanzee'
  | 'storing-spider'
  | 'keen-koala'
  | 'hurried-hummingbird'
  | 'assembled-ant'
  | 'plural-pigeon'
  | 'worldly-whale';

export interface UserAchievementType {
  userAchievementId?: number;     // If present, the badge is unlocked. Otherwise, it is locked.
  name: string;                   // Display title (e.g., "Persistent Penguin")
  slug: UserAchievementSlugsType; // Asset slug mapping (e.g., "persistent-penguin")
  shortDescription: string;       // Short preview description
  longDescription: string;        // Full details shown in the popover/modal
  acknowledged: boolean;          // Tracks if the user dismissed the new achievement notification
  triggerDescription: string;     // Hint text (e.g., "Play 3 spatial reasoning games")
  triggerTargetAttribute?: {      // Association with specific cognitive attributes
    name: string;                 // Attribute display name (e.g., "Spatial Reasoning")
    slug: string;                 // Attribute slug (e.g., "spatial-reasoning")
    attributeType: string;        // Category type (e.g., "skills", "mindsets", "traits")
  };
}
