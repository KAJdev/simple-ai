import Head from "next/head";
import { Generation } from "../components/Generation";
import { History } from "../components/History";
import { ImageAnswer } from "../components/ImageAnswer";
import { Prompt } from "../components/Prompt";
import { TextAnswer } from "../components/TextAnswer";

export default function Home() {
  const { loading } = Generation.use();
  const { artifacts } = ImageAnswer.use();
  const { value } = TextAnswer.use();

  return (
    <>
      <Head>
        <title>Simple AI</title>
        <meta name="description" content="Natrually Proficient" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`flex flex-col items-center w-screen h-screen gap-32 p-12 relative ${
          loading ||
          (artifacts && artifacts.length > 0) ||
          (value && value.length > 0)
            ? "justify-end"
            : "justify-center"
        }`}
      >
        <Prompt />
        <div className="absolute top-[50%] mx-24 flex flex-col gap-16 -translate-y-[50%]">
          <TextAnswer />
          <ImageAnswer />
        </div>
        {/* <History /> */}
      </main>
    </>
  );
}
