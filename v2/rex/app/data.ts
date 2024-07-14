type PromptRecord = {
  id: string;
  query: string;
  result?: string;
}

const promptState = {
  records: {} as Record<string, PromptRecord>,

  async getAll(): Promise<PromptRecord[]> {
    return Object.values(promptState.records);
  },

  async get(id: string): Promise<PromptRecord> {
    return promptState.records[id];
  },

  async set(id: string, query: string, result: string): Promise<PromptRecord> {
    const prompt = promptState.records[id];
    if (!prompt) {
      throw new Error("Prompt not found");
    }

    prompt.query = query;
    prompt.result = result;

    return prompt;
  }
}

export async function getAllPrompts(): Promise<PromptRecord[]> {
  return promptState.getAll();
}

export async function getPrompt(id: string): Promise<PromptRecord> {
  return promptState.get(id);
}

export function updatePrompt(id: string, query: string): Promise<PromptRecord> {
  const prompt = { id, query };

  promptState.records[id] = prompt;

  return Promise.resolve(prompt);
}