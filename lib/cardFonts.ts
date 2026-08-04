import { readFile } from "node:fs/promises";
import path from "node:path";

export type CardFont = {
  name: string;
  data: Buffer;
  weight: 300 | 400 | 700;
  style: "normal";
};

let cached: CardFont[] | null = null;

// next/og só aceita ttf/otf/woff (não woff2) — por isso as fontes ficam em
// assets/fonts/ como .ttf, carregadas uma vez e reaproveitadas entre requests
// no mesmo processo serverless.
export async function loadCardFonts(): Promise<CardFont[]> {
  if (cached) return cached;

  const dir = path.join(process.cwd(), "assets", "fonts");
  const [
    playfairBold,
    josefinRegular,
    josefinLight,
    poppinsBold,
    poppinsRegular,
    balooBold,
    nunitoRegular,
    nunitoLight,
  ] = await Promise.all([
    readFile(path.join(dir, "PlayfairDisplay-Bold.ttf")),
    readFile(path.join(dir, "JosefinSans-Regular.ttf")),
    readFile(path.join(dir, "JosefinSans-Light.ttf")),
    readFile(path.join(dir, "Poppins-Bold.ttf")),
    readFile(path.join(dir, "Poppins-Regular.ttf")),
    readFile(path.join(dir, "Baloo2-Bold.ttf")),
    readFile(path.join(dir, "Nunito-Regular.ttf")),
    readFile(path.join(dir, "Nunito-Light.ttf")),
  ]);

  cached = [
    { name: "Playfair Display", data: playfairBold, weight: 700, style: "normal" },
    { name: "Josefin Sans", data: josefinRegular, weight: 400, style: "normal" },
    { name: "Josefin Sans", data: josefinLight, weight: 300, style: "normal" },
    { name: "Poppins", data: poppinsBold, weight: 700, style: "normal" },
    { name: "Poppins", data: poppinsRegular, weight: 400, style: "normal" },
    { name: "Baloo 2", data: balooBold, weight: 700, style: "normal" },
    { name: "Nunito", data: nunitoRegular, weight: 400, style: "normal" },
    { name: "Nunito", data: nunitoLight, weight: 300, style: "normal" },
  ];

  return cached;
}
