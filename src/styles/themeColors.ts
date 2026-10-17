export const themeColors = {
  ink: '#0D0D0C',
  paper: '#EFEBE4',
  sand: '#E9E3D9',
  eventos: '#07120D',
  obra: '#121211',
} as const;

export type ThemeName = keyof typeof themeColors;
