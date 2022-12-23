import { AnimatePresence, motion } from "framer-motion";
import create from "zustand";

export function TextAnswer() {
  const { value, setValue } = TextAnswer.use();

  return (
    <AnimatePresence>
      {value && value.length > 0 && (
        <motion.h1
          layoutId="text-answer"
          className="text-2xl font-medium font-mono text-center"
          initial={{ opacity: 0, y: 100, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 100, filter: "blur(10px)" }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100,
          }}
        >
          {value}
        </motion.h1>
      )}
    </AnimatePresence>
  );
}

export type TextAnswerState = {
  value: string;
  setValue: (value: string) => void;
};

export namespace TextAnswer {
  export const use = create<TextAnswerState>()((set) => ({
    value: "",
    setValue: (value) => set({ value }),
  }));
}
