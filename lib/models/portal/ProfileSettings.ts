export interface ProfileSettings {
  display_units: string;
  confidence_floor: number;
  weekly_email_opt_in: boolean;
}

export const generateMockProfileSettings = (): ProfileSettings => ({
  display_units: "percent",
  confidence_floor: 0.3,
  weekly_email_opt_in: true
});
