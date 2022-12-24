import Head from "next/head";
import { useEffect } from "react";
import { Generation } from "../components/Generation";
import { History } from "../components/History";
import { ImageAnswer } from "../components/ImageAnswer";
import { Prompt } from "../components/Prompt";
import { TextAnswer } from "../components/TextAnswer";

export default function Home() {
  const { loading } = Generation.use();
  const { artifacts } = ImageAnswer.use();
  const { value } = TextAnswer.use();

  useEffect(() => {
    // Add event listeners for file drop and dragover
    document.addEventListener("drop", interrogate);
    document.addEventListener("dragover", onDragOver);

    // Remove event listeners when the component is unmounted
    return () => {
      document.removeEventListener("drop", interrogate);
      document.removeEventListener("dragover", onDragOver);
    };
  }, []); // Run only once

  const interrogate = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      ImageAnswer.addFiles(files);
    }
  };

  const onDragOver = (event: any) => {
    // Prevent default behavior (e.g., open the file in the browser)
    event.preventDefault();
  };

  return (
    <>
      <Head>
        <title>Simple AI</title>
        <meta name="description" content="Natrually Proficient" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`flex flex-col items-center w-screen overflow-hidden h-screen gap-32 p-12 relative`}
      >
        <Prompt />
        <div className="absolute top-[25%] mx-24 flex flex-col gap-16 -translate-y-[50%] pointer-events-none">
          <ImageAnswer />
        </div>
        <div className="absolute top-[50%] mx-24 flex flex-col gap-16 -translate-y-[50%] pointer-events-none">
          <TextAnswer />
        </div>
        {/* <History /> */}
      </main>
    </>
  );
}
