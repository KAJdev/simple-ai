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

  // string type
  export type GPTResponse =
    | `Assistant: ${string}`
    | `Generation: ${number}x"${string}"`;

  export async function generate(prompt: string) {
    use.getState().setLoading(true);

    const hist = History.getLastItems(10);

    const init_prompt = `${Prompt.INITIAL.replace(
      "{DATE}",
      new Date().toLocaleTimeString()
    )}${
      hist && hist.length > 0
        ? hist
            .map(
              (h) =>
                `User: ${h.user}\n${h.type}: ${
                  h.type === "Assistant"
                    ? h.text
                    : `${h.images.length}x"${h.prompt}"`
                }`
            )
            .join("\n\n")
        : ""
    }\n\nUser: ${prompt}\n`;

    const response = await gpt3(init_prompt);

    console.log(init_prompt);
    console.log(response);

    if (RegExp(/Generation:\s(\d+)x"(.+)"/).test(response)) {
      const [count, imgPrompt] = response
        .replace("Generation: ", "")
        .replace(/"/g, "")
        .split("x");
      const artifacts = await stable(imgPrompt, parseInt(count));

      use.getState().setLoading(false);

      ImageAnswer.use.getState().setArtifacts(artifacts);

      History.use.getState().addItem({
        user: prompt,
        prompt: imgPrompt,
        images: artifacts.map((a) => a.image),
        type: "Generation",
      } as History.ImageHistoryItem);

      return artifacts;
    } else {
      use.getState().setLoading(false);

      const text = response.replace("Assistant: ", "");

      TextAnswer.use.getState().setValue(text);

      History.use.getState().addItem({
        user: prompt,
        text,
        type: "Assistant",
      } as History.TextHistoryItem);

      return text;
    }
  }
}
