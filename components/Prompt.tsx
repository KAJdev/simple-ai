import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import create from "zustand";
import { Generation } from "./Generation";
import { History } from "./History";
import { ImageAnswer } from "./ImageAnswer";
import { TextAnswer } from "./TextAnswer";

export type PromptState = {
  value: string;
  setValue: (value: string) => void;
};

export type Prompt = string;

export function Prompt() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { value, setValue } = Prompt.use();
  const { loading } = Generation.use();

  const textAnswer = TextAnswer.use();
  const imageAnswer = ImageAnswer.use();

  const lastItem = History.useLastItem();

  useEffect(() => {
    if (textareaRef.current) {
      const styles = window.getComputedStyle(textareaRef.current);
      textareaRef.current.style.height = "auto";

      const newHeight =
        textareaRef.current.scrollHeight +
        parseInt(styles.paddingTop) +
        parseInt(styles.paddingBottom);

      textareaRef.current.style.height = newHeight + "px";
    }
  }, [value, textareaRef]);

  return (
    <motion.textarea
      layoutId="prompt"
      layout="preserve-aspect"
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="The world awaits your wisdom..."
      className={`bg-transparent text-4xl font-medium w-full h-full resize-none outline-none focus:outline-none text-center placeholder:opacity-50 ${
        loading ? "opacity-50 animate-pulse" : ""
      }`}
      autoFocus
      disabled={loading}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 100,
      }}
      onFocus={(e) => {
        if (textAnswer.value.length > 0) {
          textAnswer.setValue("");
        }
        if (imageAnswer.artifacts.length > 0) {
          imageAnswer.setArtifacts([]);
        }
        e.target.setSelectionRange(0, e.target.value.length);
      }}
      onBlur={(e) => {
        if (lastItem) {
          if (lastItem.type === "text") {
            textAnswer.setValue(lastItem.text);
          } else if (lastItem.type === "image") {
            imageAnswer.setArtifacts(
              lastItem.images.map((i) => ({ image: i, seed: 0 }))
            );
          }
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();

          if (value.trim().length > 0) {
            Generation.generate(value);
          }
        }
      }}
    />
  );
}

export namespace Prompt {
  export const use = create<PromptState>()((set) => ({
    value: "",
    setValue: (value) => set({ value }),
  }));

  export const INITIAL =
    `Determine if the following message brings an image to mind. If so, respond with only the amount of images and a description of a more detailed image than the one described. Otherwise, respond with "null".

examples:
Message: "I wonder what a cat looks like"
Response: 4x"A fluffy white cat with bright blue eyes perched atop a windowsill, looking out at the world with a curious expression."

Message: "Man I would kill to see some cars right now"
Response: 3x"A red Ferrari sitting idle on a race track at night. Headlights shining through the misty night"

Message: "Two photos of cats"
Response: 2x"Two cats lying in the sun, cartoon drawing"

Message: "I want to see a hotdog"
Response: 1x"A delicious-looking hotdog on a plate"

Message: "Show me 5 photos of dogs"
Response: 5x"A golden retriever puppy playing in a field of wildflowers, tongue lolling out of its mouth in joy."

Message: "Paint something like Tyler Edlin's paintings"
Response: 1x"A beautiful concept art painting by Tyler Edlin"` as const;

  export const TEXT =
    `You are Assistant. A Large Language Model (LLM) Trained to answer questions and provide feedback | Date: {DATE} | Browsing: Disabled` as const;
}
