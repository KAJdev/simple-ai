import { AnimatePresence, motion } from "framer-motion";
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { value, setValue } = Prompt.use();
  const { loading, task } = Generation.use();

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
    <AnimatePresence mode="wait">
      <motion.div
        layoutId="prompt"
        layout="preserve-aspect"
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 100,
        }}
        initial={{ opacity: 0, y: "10%", filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: "10%", filter: "blur(10px)" }}
        className={`flex flex-col h-full w-full ${
          loading ||
          (imageAnswer.artifacts && imageAnswer.artifacts.length > 0) ||
          (textAnswer.value && textAnswer.value.length > 0)
            ? "justify-end"
            : "justify-center"
        }`}
      >
        <motion.h2
          layoutId="prompt-title"
          className={`text-xl font-medium select-none font-mono text-center pointer-events-none ${
            loading ? "opacity-50 animate-pulse" : ""
          }`}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{
            opacity: loading ? 1 : 0,
            filter: loading ? "blur(0px)" : "blur(10px)",
          }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
        >
          {loading && task}
        </motion.h2>
        <motion.textarea
          layoutId="prompt-textarea"
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);

            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
              if (textareaRef.current && textareaRef.current.value.length > 0) {
                Generation.generate(value);
              }
            }, 7000);
          }}
          placeholder={
            loading
              ? "The computer is thinking..."
              : "The world awaits your wisdom..."
          }
          className={`bg-transparent text-4xl font-medium w-full h-full resize-none outline-none focus:outline-none text-center placeholder:opacity-50`}
          autoFocus
          disabled={loading}
          onFocus={(e) => {
            if (
              textAnswer.value.length > 0 &&
              imageAnswer.artifacts.length === 0
            ) {
              textAnswer.setValue("");
            }
            // if (imageAnswer.artifacts.length > 0) {
            //   imageAnswer.setArtifacts([]);
            // }
            e.target.setSelectionRange(0, e.target.value.length);
          }}
          onBlur={(e) => {
            if (lastItem) {
              if (lastItem.type === "Assistant") {
                textAnswer.setValue(lastItem.text);
              } else if (lastItem.type === "Generation") {
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
      </motion.div>
    </AnimatePresence>
  );
}

export namespace Prompt {
  export const use = create<PromptState>()((set) => ({
    value: "",
    setValue: (value) => set({ value }),
  }));

  export const INITIAL =
    `Determine the specific action of a user's message based on the following list and format the response correctly using the previous history as context | Date: {DATE}

Actions:
- Assistant chat (Assistant: {message})
- Image Generation (Generate: {count}x"{prompt}")

Example:
User: Hello computer
Assistant: Hi there! How can I help you?

User: Show me an image of a dog
Generation: 1x"A black and white border collie running through a meadow, chasing a butterfly"

User: What is Mars?
Assistant: Mars is the fourth planet from the Sun and the second smallest planet in the Solar System. It is a terrestrial planet, meaning it is composed of mostly rock. It has a thin atmosphere and is home to the largest volcano in the Solar System, Olympus Mons.

User: What's it look like?
Generation: 3x"A vivid photo of the red planet Mars, taken from a telescope"

User: *added files*
Generation: 2x"An image of a dog and a cat sitting on a couch together"

User: What do these images have in common?
Assistant: They are both animals.

New Context (no memory of previous prompts):
` as const;

  export const TEXT =
    `You are Assistant. A Large Language Model (LLM) Trained to answer questions and provide feedback | Date: {DATE} | Browsing: Disabled` as const;
}
