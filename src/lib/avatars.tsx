// Predefined avatar designs — abstract patterns with colors
export const AVATAR_DESIGNS = [
  { bg: "#6B8DA6", icon: "waves" },
  { bg: "#A67B5B", icon: "mountain" },
  { bg: "#7B68AE", icon: "diamond" },
  { bg: "#5B9E8F", icon: "leaf" },
  { bg: "#C07070", icon: "sun" },
  { bg: "#8B7EC8", icon: "star" },
  { bg: "#6AA0B7", icon: "drop" },
  { bg: "#B08968", icon: "flame" },
  { bg: "#7CAF7A", icon: "tree" },
  { bg: "#CC8899", icon: "heart" },
  { bg: "#8899AA", icon: "cloud" },
  { bg: "#AA7755", icon: "bolt" },
];

export function AvatarIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const s = size;
  switch (icon) {
    case "waves":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path d="M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
        </svg>
      );
    case "mountain":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20L8.5 8 12 14l3.5-6L22 20H2z" />
        </svg>
      );
    case "diamond":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
          <path d="M12 2v20" />
          <path d="M2 12h20" />
        </svg>
      );
    case "leaf":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <path d="M6 21c3-3 7-5 12-5C18 8 14 3 6 3c0 7 0 12 0 18z" />
          <path d="M6 21c3-4 6-7 12-8" />
        </svg>
      );
    case "sun":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
        </svg>
      );
    case "star":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case "drop":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" />
        </svg>
      );
    case "flame":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
        </svg>
      );
    case "tree":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22V13" />
          <path d="M4 13h16l-4-5h2l-4-5h2L12 2l-4 1h2L6 8h2l-4 5z" />
        </svg>
      );
    case "heart":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      );
    case "cloud":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
        </svg>
      );
    case "bolt":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    default:
      return null;
  }
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "U";
}
