/* eslint-disable @next/next/no-img-element */
import create from "zustand";

export function History() {
  const { history } = History.use();

  console.log(history);

  if (history.length <= 1) return null;

  return (
    <div className="absolute -z-10 w-full h-full pointer-events-none overflow-hidden">
      {/* show the last couple history items blurred on top of each other */}
      {history
        .reverse()
        .slice(1)
        .slice(history.length - 3)
        .map((item, index) => {
          if ("images" in item) {
            return (
              <div
                className="flex flex-row gap-4 justify-center items-center text-center w-full h-full"
                key={index}
                style={{
                  filter: `blur(${index + 1 * 2}px)`,
                  opacity: 1 - index + 1 * 0.25,
                  scale: 1 - index + 1 * 0.25,
                }}
              >
                {item.images.map((artifact) => (
                  <img
                    key={artifact}
                    src={artifact}
                    alt="history image"
                    className="w-64 h-64"
                  />
                ))}
              </div>
            );
          } else {
            return (
              <div
                key={index}
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  filter: `blur(${index + 1 * 2}px)`,
                  opacity: 1 - index + 1 * 0.25,
                  scale: 1 - index + 1 * 0.25,
                }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50" />
                <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center">
                  <div className="text-2xl font-medium font-mono text-center">
                    {item.user}
                  </div>
                  <div className="text-2xl font-medium font-mono text-center">
                    {item.text}
                  </div>
                </div>
              </div>
            );
          }
        })}
    </div>
  );
}

export type HistoryState = {
  history: History.HistoryItem[];
  setHistory: (history: History.HistoryItem[]) => void;
  addItem: (item: History.HistoryItem) => void;
  addItems: (items: History.HistoryItem[]) => void;
};

export namespace History {
  export const use = create<HistoryState>()((set) => ({
    history: [],
    setHistory: (history) => set({ history }),
    addItem: (item) => set((state) => ({ history: [...state.history, item] })),
    addItems: (items) =>
      set((state) => ({ history: [...state.history, ...items] })),
  }));

  export const useLastItem = () => {
    const { history } = History.use();

    return history[history.length - 1];
  };

  export const getLastTextItems = (n: number) => {
    return History.use
      .getState()
      .history.filter((item) => item.type === "Assistant")
      .slice(-n) as TextHistoryItem[];
  };

  export const getLastItems = (n: number) => {
    return History.use.getState().history.slice(-n) as HistoryItem[];
  };

  export type ImageHistoryItem = {
    type: "Generation";
    user: string;
    prompt: string;
    images: string[];
  };

  export type TextHistoryItem = {
    type: "Assistant";
    user: string;
    text: string;
  };

  export type HistoryItem = ImageHistoryItem | TextHistoryItem;
}
