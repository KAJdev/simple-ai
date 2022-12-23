import create from "zustand";
import { ImageAnswer } from "./ImageAnswer";
import { Prompt } from "./Prompt";
import { TextAnswer } from "./TextAnswer";
import { History } from "./History";

export type GenerationState = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export namespace Generation {
  export const API_BASE = "https://api.prototyped.ai";

  export const use = create<GenerationState>()((set) => ({
    loading: false,
    setLoading: (loading) => set({ loading }),
  }));

  export type Artifact = {
    image: string;
    seed: number;
  };

  export async function gpt3(prompt: string): Promise<string> {
    use.getState().setLoading(true);

    const response = await fetch(`${API_BASE}/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    }).then((res) => res.json());

    use.getState().setLoading(false);

    return response.choices.pop().text;
  }

  export async function stable(
    prompt: string,
    amount?: number
  ): Promise<Artifact[]> {
    use.getState().setLoading(true);

    const response = await fetch(`${API_BASE}/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        count: amount || 1,
      }),
    }).then((res) => res.json());

    use.getState().setLoading(false);

    return response;
  }

  export async function generate(prompt: string) {
    use.getState().setLoading(true);

    const response = await gpt3(
      `${Prompt.INITIAL}\n\nMessage: "${prompt}"\nResponse: `
    );

    if (RegExp("(s*nulls*)").test(response)) {
      const hist = History.getLastTextItems(5);

      const text = await gpt3(
        `${Prompt.TEXT.replace("{DATE}", new Date().toLocaleTimeString())}${
          // map history to \n\nUser: {prompt}\nAssistant: {text}
          hist && hist.length > 0
            ? hist
                .map((h) => `\n\nUser: ${h.prompt}\nAssistant: ${h.text}`)
                .join("")
            : ""
        }\n\nUser: ${prompt}\nAssistant: `
      );

      use.getState().setLoading(false);

      TextAnswer.use.getState().setValue(text);

      History.use.getState().addItem({
        prompt,
        text,
        type: "text",
      } as History.TextHistoryItem);

      return text;
    } else {
      // message will look like this {number}x"{prompt}"
      const [count, prompt] = response.replace(/"/g, "").split("x");
      const artifacts = await stable(prompt, parseInt(count));

      use.getState().setLoading(false);

      ImageAnswer.use.getState().setArtifacts(artifacts);

      History.use.getState().addItem({
        prompt,
        images: artifacts.map((a) => a.image),
        type: "image",
      } as History.ImageHistoryItem);

      return artifacts;
    }
  }
}
