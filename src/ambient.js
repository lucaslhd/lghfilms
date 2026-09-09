// Original 8-bar instrumental, synthesized locally. No recordings or external audio requests.
export function playAmbient(context, onEnd) {
  const beat=60/76, bars=8, cycles=2, start=context.currentTime+.08;
  const master=context.createGain();master.gain.value=.22;master.connect(context.destination);
  const reverb=context.createConvolver(), wet=context.createGain();wet.gain.value=.12;
  const impulse=context.createBuffer(2,context.sampleRate*1.15,context.sampleRate);
  for(let c=0;c<2;c++){const data=impulse.getChannelData(c);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2.8);}
  reverb.buffer=impulse;reverb.connect(wet);wet.connect(master);
  const nodes=[];const hz=m=>440*2**((m-69)/12);
  function note(m,time,length,volume,bass=false) {
    const envelope=context.createGain();envelope.gain.setValueAtTime(0,time);envelope.gain.linearRampToValueAtTime(volume,time+.018);envelope.gain.exponentialRampToValueAtTime(.0001,time+length);
    envelope.connect(master);if(!bass)envelope.connect(reverb);
    const tone=context.createOscillator();tone.type='sine';tone.frequency.value=hz(m);tone.connect(envelope);tone.start(time);tone.stop(time+length+.03);nodes.push(tone);
    if(!bass){const overtone=context.createOscillator(),gain=context.createGain();overtone.type='sine';overtone.frequency.value=hz(m)*2;gain.gain.value=.17;overtone.connect(gain);gain.connect(envelope);overtone.start(time);overtone.stop(time+length+.03);nodes.push(overtone);}
  }
  const chords=[[54,61,64,68,73],[54,57,61,64,68],[54,57,61,66,69],[55,59,62,66,69],[55,61,66,71],[54,61,64,68,73],[54,59,62,66,69],[55,61,64,66,71]];
  const bass=[38,42,35,40,33,38,31,33];
  const melody=[[78,76],[73,80],[78,73],[74,78],[76,73],[73,78],[78,74],[76,73]];
  for(let cycle=0;cycle<cycles;cycle++)for(let bar=0;bar<bars;bar++){
    const t=start+(cycle*bars+bar)*4*beat;
    chords[bar].forEach((m,i)=>{note(m,t+i*.018,beat*2.6,.075);note(m,t+2.65*beat+i*.014,beat*1.25,.039);});
    note(bass[bar],t,beat*1.65,.36,true);note(bass[bar]+7,t+2*beat,beat*1.3,.21,true);
    melody[bar].forEach((m,i)=>note(m,t+(1.65+i*1.4)*beat,beat*.85,.045));
  }
  let ended=false;
  const stop=()=>{if(ended)return;ended=true;clearTimeout(timer);master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(0,context.currentTime,.045);setTimeout(()=>{nodes.forEach(n=>{try{n.stop();}catch{}});master.disconnect();reverb.disconnect();wet.disconnect();context.close();},220);onEnd();};
  const timer=setTimeout(stop,(cycles*bars*4*beat+1.2)*1000);
  return {stop,duration:cycles*bars*4*beat};
}
