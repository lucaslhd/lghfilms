// Run with NODE_PATH pointing to the bundled Sharp installation (see README).
const sharp=require('sharp');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 for(const name of process.argv.slice(2)){
  const input=path.join('design',`${name}.svg`),output=path.join('public',`${name}.jpg`);
  let encoded;
  for(const quality of [80,76,72,68,64,60]){
   encoded=await sharp(input).jpeg({quality,mozjpeg:true}).toBuffer();
   if(encoded.length<65000)break;
  }
  await fs.writeFile(output,encoded);
  console.log(JSON.stringify({file:output,bytes:encoded.length}));
 }
})();
