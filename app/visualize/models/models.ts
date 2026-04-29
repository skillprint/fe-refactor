// Auto-generated TypeScript models corresponding to Django backend models

// ==========================================
// Base / Shared Types
// ==========================================

export interface Person {
  id: number;
  name: string;
  slug: string;
}

export interface Publisher extends Person {}

export interface Developer extends Person {}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  short_description: string;
}

export interface Skill extends Tag {}

export interface Mood extends Tag {}

// ==========================================
// Enums / Choices
// ==========================================

export enum ExitButtonPosition {
  TOP_RIGHT = "TOP_RIGHT",
  BOTTOM_RIGHT = "BOTTOM_RIGHT",
  TOP_LEFT = "TOP_LEFT",
  BOTTOM_LEFT = "BOTTOM_LEFT",
}

export enum GameplayTag {
  ACHIEVEMENTS = "Achievements",
  AUGMENTED_REALITY = "Augmented Reality",
  AUTO_BATTLE = "Auto Battle",
  CARD = "Card",
  CHAT = "Chat",
  COMPETITIVE = "Competitive",
  CUSTOMIZATION = "Customization",
  EVENTS = "Events",
  FRIEND_INVITES = "Friend Invites",
  GUILDS = "Guilds/Clans",
  HIDDEN_OBJECT = "Hidden Object",
  LEADERBOARDS = "Leaderboards",
  LOGIN_REWARDS = "Daily/Login Rewards",
  LUCK = "Lucky Spin/Scratch",
  MATCH_3 = "Match3",
  MERGE = "Merge",
  MISSIONS = "Missions",
  MMO = "MMO",
  MULTIPLAYER = "Multiplayer",
  MULTIPLE_LEVELS = "Multiple levels",
  SOCIAL_ASSISTS = "Social Assists",
  TOURNAMENTS = "Tournaments",
  UNLIMITED_TIME = "Unlimited Time",
  UNLIMITED_TRIES = "Unlimited Tries",
}

export enum ArtStyle {
  ANIME = "Anime",
  CARTOONY = "Cartoony",
  LANDSCAPE = "Landscape",
  PIXEL_VOXEL = "Pixel/Voxel",
  PORTRAIT = "Portrait",
  REALISTIC = "Realistic",
  THREE_D = "3D",
  TWO_D = "2D",
}

export enum Theme {
  APOCALYPTIC = "Apocalyptic/Post",
  CASINO = "Casino/Gambling",
  DETECTIVE = "Detective",
  FANTASY_EASTERN = "Fantasy (Eastern)",
  FANTASY_WESTERN = "Fantasy (Western)",
  FARMING = "Farming",
  FEMALE_ORIENTED = "Female Oriented",
  HOME_DESIGN = "Home Design",
  HISTORICAL = "Historical/Medieval",
  HORROR = "Horror",
  MODERN_MILITARY = "Modern Military",
  NATURE = "Nature",
  ROMANCE = "Romance/Love",
  SNIPER = "Sniper",
  SPACE = "Space",
  SCIFI = "Sci-Fi",
  WAR = "War",
  WESTERN_AMERICAN = "Western (American)",
}

export enum Genre {
  ACTION = "Action",
  BOARD = "Board",
  ARCADE = "Arcade",
  PUZZLE = "Puzzle",
  HYPER_CASUAL = "Hyper-Casual",
  IDLE = "Idle",
  INDIE = "Indie",
  KIDS = "Kids",
  LIFESTYLE = "Lifestyle",
  PARTY = "Party",
  RACING = "Racing",
  RPG = "RPG",
  SHOOTER = "Shooter",
  SIMULATION = "Simulation",
  SPORTS = "Sports",
  STRATEGY = "Strategy",
  WORD = "Word",
}

export enum Goal {
  AVOID = "Avoid",
  CREATE = "Create",
  CONFIGURE = "Configure",
  FIND = "Find",
  OBTAIN = "Obtain",
  OPTIMIZE = "Optimize",
  REACH = "Reach",
  REMOVE = "Remove",
  SOLVE = "Solve",
  SYNCHRONIZE = "Synchronize",
}

export enum ScreenshotOrientation {
  LANDSCAPE = "landscape",
  PORTRAIT = "portrait",
}

export enum GameEngineType {
  UNITY = "unity",
  HTML5_JS = "html5_js",
  CONSTRUCT = "construct",
  PHASER = "phaser",
  GODOT_HTML5 = "godot_html5",
  CUSTOM_JS = "custom_js",
}

export enum SessionState {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export enum SessionStage {
  NO_TELEMETRY = "NO_TELEMETRY",
  NOT_CALIBRATED = "NOT_CALIBRATED",
  NOT_PROCESSED = "NOT_PROCESSED",
  PROCESSED = "PROCESSED",
  CALIBRATED = "CALIBRATED",
}

// ==========================================
// Game Models
// ==========================================

export interface Game {
  id: number;
  at_created: string;
  at_updated: string;
  is_active: boolean;
  name: string;
  slug: string;
  display_name: string;
  short_description: string;
  long_description: string;
  screenshot: string;
  priority: number;
  is_publicly_listed: boolean;
  suggested_duration: string;
  is_playable_in_pwa: boolean;

  skills: number[]; // Array of Skill IDs (or Skill[] if populated)
  moods: number[];  // Array of Mood IDs (or Mood[] if populated)

  exit_button_position: ExitButtonPosition | null;
  
  gameplay_tags: GameplayTag[] | null;
  art_styles: ArtStyle[] | null;
  themes: Theme[] | null;
  genres: Genre[] | null;
  goals: Goal[] | null;

  release_date: string | null;

  publisher_id: number | null;
  developer_id: number | null;

  ios_store_link: string | null;
  android_store_link: string | null;
  external_web_url: string | null;
  
  organization_id: number | null;

  thumbnail: string | null;
  game_zip: string | null;
  game_path: string | null;
  
  sdk_enabled: boolean;
  orientation: ScreenshotOrientation;
  engine_type: GameEngineType;
  html5_entry_file: string;
  requires_iframe: boolean;
  html5_init_params: Record<string, any>;
}

export interface GameSchema {
  id: number;
  game_id: number;
  schema: Record<string, any>;
}

export interface Favorite {
  id: number;
  at_created: string;
  game_id: number;
  user_id: number | string;
}


// ==========================================
// Session & Telemetry Models
// ==========================================

export interface Session {
  id: number;
  session_id: string; // UUID
  user_id: number | string | null;
  game_id: number;

  at_created: string;
  duration: string | null;

  telemetry: any[];

  state: SessionState;
  stage: SessionStage;

  generated_content: Record<string, any>;
  skill_scores: Record<string, any>;
  mood_scores: Record<string, any>;
  gameplay_tips: string | null;

  processed: boolean;
  is_processing: boolean;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  processing_error: string | null;

  partner_organization_id: number | null;
  target_mood_id: number | null;

  parameter_updates: any[];
}


// ==========================================
// Survey Models
// ==========================================

export interface Survey {
  id: number;
  at_created: string;
  at_updated: string;
  game_id: number;
  score: number; // -1 to 1
  user_id: number | string | null;
  session_id: string | null;
}

export interface SkillSurvey extends Survey {
  skill_id: number | null;
  skills: number[]; // Array of Skill IDs
}

export interface MoodSurvey extends Survey {
  mood_id: number;
}


// ==========================================
// Scoring Models
// ==========================================

export interface GameChunkAnalysis {
  id: number;
  session_id: number;
  timestamp: string;
  
  images: string[] | null;
  video: string | null;
  
  raw_skill_llm_output: Record<string, any>;
  raw_flow_llm_output: Record<string, any>;
  skill_llm_output: Record<string, any>;
  flow_llm_output: Record<string, any>;
  
  is_processing: boolean;
  processing_started_at: string | null;
  processing_error: string | null;
  processing_attempts: number;
  last_processing_attempt: string | null;
}

export interface SkillPrintProfile {
  id: number;
  user_id: number | string;
  created_at: string;
  last_updated: string;
  
  total_sessions: number;
  total_time_played: string;
  
  avg_flow_score: number;
  flow_score_history: any[];
  flow_confidence: number;
  
  state_distributions: Record<string, any>;
}

export interface GameScoringConfig {
  id: number;
  game_id: number;
  is_enabled: boolean;
  
  skill_prompt_override: string;
  flow_prompt_override: string;
  adjustment_instructions: string;
  
  skill_schema_override: Record<string, any> | null;
  flow_schema_override: Record<string, any> | null;
  
  parameter_definitions: Record<string, any>;
  notes: string;
  
  created_at: string;
  updated_at: string;
}
