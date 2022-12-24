import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import create from "zustand";
import { Generation } from "./Generation";
import { History } from "./History";

function Artifact({ artifact }: { artifact: Generation.Artifact }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.img
      key={artifact.seed}
      layoutId={`artifact-${artifact.seed}`}
      className="w-64 h-64 object-cover"
      src={artifact.image}
      initial={{ opacity: 0, y: "-100%" }}
      animate={{ opacity: loaded ? 1 : 0, y: loaded ? "0%" : "-100%" }}
      exit={{ opacity: 0, y: "-100%" }}
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
    <AnimatePresence mode="wait">
      {artifacts && artifacts.length > 0 && (
        <motion.div
          layoutId="image-answer"
          className="flex flex-row gap-4 justify-center items-center text-2xl font-medium font-mono text-center"
          initial={{ opacity: 0, y: "-200%" }}
          animate={{ opacity: 1, y: "0%" }}
          exit={{ opacity: 0, y: "-200%" }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100,
          }}
        >
          {artifacts.map((artifact) => (
            <Artifact key={artifact.seed} artifact={artifact} />
          ))}
          <div className="absolute bottom-full left-full p-2 z-10 cursor-pointer hover:opacity-50 duration-300 pointer-events-auto">
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

  export async function addFiles(files: FileList) {
    // convert to blobs, get object urls, and add to artifacts + history
    Generation.use.getState().setLoading(true, "Pondering images...");

    const artifacts = await Promise.all(
      Array.from(files).map(async (file) => {
        const blob = await file.arrayBuffer();
        const url = URL.createObjectURL(new Blob([blob]));

        const prompt = await Generation.interrogate(url);

        History.use.getState().addItem({
          type: "Generation",
          user: "*added files*",
          images: [url],
          prompt,
        } as History.ImageHistoryItem);

        return { seed: 0, image: url };
      })
    );

    ImageAnswer.use.setState((state) => ({
      artifacts: [...state.artifacts, ...artifacts],
    }));

    Generation.use.getState().setLoading(false);
  }
}
