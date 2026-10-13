export function extractErrorMessage(data: any): string {
  if (!data) return 'An unknown error occurred. Please try again later.';

  // 1. Prioritize detailed error description
  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail.trim();
  }

  // 2. Extract message property
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  // 3. Validation errors array/object
  if (data.errors && typeof data.errors === 'object') {
    const messages: string[] = [];
    Object.entries(data.errors).forEach(([_, val]) => {
      if (Array.isArray(val)) {
        val.forEach((m) => messages.push(String(m)));
      } else if (typeof val === 'string') {
        messages.push(val);
      }
    });
    if (messages.length > 0) {
      return messages.join(' · ');
    }
  }

  // 4. Custom title if not generic English default
  if (typeof data.title === 'string' && data.title.trim()) {
    const title = data.title.trim();
    const genericWords = ['unauthorized', 'bad request', 'not found', 'forbidden', 'internal server error', 'one or more validation errors occurred.'];
    if (!genericWords.includes(title.toLowerCase())) {
      return title;
    }
  }

  return 'Operation failed. Please verify your details and try again.';
}

