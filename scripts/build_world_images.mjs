/** Derivatives of the EEVEE renders. Never substitute the concept artwork. */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
const root = new URL('../public/worlds/', import.meta.url);
const symbols = ['pebr', 'yeti', 'xmasr'];
const path = (name) => new URL(name, root).pathname;
await mkdir(path('poses'), { recursive: true });
for (const symbol of symbols) {
  await sharp(path(`${symbol}-poster.png`)).webp({ quality: 88 }).toFile(path(`${symbol}-poster.webp`));
  for (const [name, size] of [['mobile',600],['thumb',480]]) {
    await sharp(path(`${symbol}-poster.png`)).resize(size,size).webp({ quality: 86 }).toFile(path(`${symbol}-poster-${name}.webp`));
  }
  for (let pose=1;pose<=3;pose++) {
    await sharp(path(`poses/${symbol}-${pose}.png`)).resize(800,800).webp({ quality: 88 }).toFile(path(`poses/${symbol}-${pose}.webp`));
  }
}
// Share image uses all three finished models at equal scale, on their world backgrounds.
const panels = await Promise.all(symbols.map(async (symbol,index) => ({
  input: await sharp({ create: { width:400,height:630,channels:4,background:['#dcebcf','#dcebf4','#132238'][index] } })
    .composite([{input:await sharp(path(`${symbol}-poster.png`)).resize(400,400).toBuffer(),left:0,top:115}])
    .png().toBuffer(),left:index*400,top:0,
})));
await sharp({create:{width:1200,height:630,channels:4,background:'#dcebcf'}}).composite(panels)
  .webp({quality:90}).toFile(path('toris-coin-og.webp'));
console.log('World posters, mobile sources, thumbnails, nine poses and share image updated.');
