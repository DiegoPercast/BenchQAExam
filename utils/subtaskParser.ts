export interface SubtaskCount {
  completed: number;
  total: number;
}

export function parseSubtaskCount(text: string): SubtaskCount {
  const match = text.match(/(\d+)\s+of\s+(\d+)/);
  if (!match) return { completed: 0, total: 0 };
  return {
    completed: parseInt(match[1], 10),
    total: parseInt(match[2], 10),
  };
}
