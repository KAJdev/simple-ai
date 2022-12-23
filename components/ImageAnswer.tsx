import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import create from "zustand";
import { Generation } from "./Generation";

function Artifact({ artifact }: { artifact: Generation.Artifact }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.img
      key={artifact.seed}
      layoutId={`artifact-${artifact.seed}`}
      className="w-64 h-64 object-cover"
      src={artifact.image}
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 100,
        restSpeed: 0.0005,
      }}
      onLoad={() => setLoaded(true)}
    />
  );
}

export function ImageAnswer() {
  const { artifacts, setArtifacts } = ImageAnswer.use();

  return (
    <AnimatePresence>
      {artifacts && artifacts.length > 0 && (
        <motion.div
          layoutId="image-answer"
          className="flex flex-row gap-4 justify-center items-center text-2xl font-medium font-mono text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {artifacts.map((artifact) => (
            <Artifact key={artifact.seed} artifact={artifact} />
          ))}
          <div className="absolute bottom-full left-full p-2 z-10 cursor-pointer hover:opacity-50 duration-300">
            <X size={32} onClick={() => setArtifacts([])} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type ImageAnswerState = {
  artifacts: Generation.Artifact[];
  setArtifacts: (artifacts: Generation.Artifact[]) => void;
};

export namespace ImageAnswer {
  export const use = create<ImageAnswerState>()((set) => ({
    artifacts: [],
    setArtifacts: (artifacts) => set({ artifacts }),
  }));
}
