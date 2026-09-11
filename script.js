/* ================= SOUND ENGINE (procedural, no audio files) ================= */
let audioCtx = null, soundOn = true;
function ctx(){ if(!audioCtx){ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); } if(audioCtx.state==='suspended') audioCtx.resume(); return audioCtx; }
function noiseBuffer(c,duration){ const buf=c.createBuffer(1,c.sampleRate*duration,c.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<d.length;i++){ d[i]=(Math.random()*2-1)*(1-i/d.length); } return buf; }

function playHit(){
  if(!soundOn) return; const c=ctx();
  const pitch = 0.85 + Math.random()*0.3;
  const src=c.createBufferSource(); src.buffer=noiseBuffer(c,0.16);
  const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=(650+Math.random()*450)*pitch; bp.Q.value=1.1;
  const g=c.createGain(); g.gain.setValueAtTime(0.32,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.16);
  src.connect(bp).connect(g).connect(c.destination); src.start();

  const o=c.createOscillator(); const og=c.createGain();
  o.type='square'; o.frequency.setValueAtTime(200*pitch,c.currentTime); o.frequency.exponentialRampToValueAtTime(55,c.currentTime+0.11);
  og.gain.setValueAtTime(0.16,c.currentTime); og.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.13);
  o.connect(og).connect(c.destination); o.start(); o.stop(c.currentTime+0.14);

  const o2=c.createOscillator(); const og2=c.createGain();
  o2.type='triangle'; o2.frequency.setValueAtTime(90,c.currentTime);
  og2.gain.setValueAtTime(0.1,c.currentTime); og2.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.2);
  o2.connect(og2).connect(c.destination); o2.start(); o2.stop(c.currentTime+0.2);
}
function playWhoosh(){
  if(!soundOn) return; const c=ctx();
  const src=c.createBufferSource(); src.buffer=noiseBuffer(c,0.5);
  const bp=c.createBiquadFilter(); bp.type='lowpass'; bp.frequency.setValueAtTime(300,c.currentTime); bp.frequency.exponentialRampToValueAtTime(3500,c.currentTime+0.45);
  const g=c.createGain(); g.gain.setValueAtTime(0.16,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.5);
  src.connect(bp).connect(g).connect(c.destination); src.start();
}
function playShutter(){
  if(!soundOn) return; const c=ctx();
  const o=c.createOscillator(); const g=c.createGain();
  o.type='square'; o.frequency.setValueAtTime(1200,c.currentTime);
  g.gain.setValueAtTime(0.03,c.currentTime); g.gain.exponentialRampToValueAtTime(0.0008,c.currentTime+0.04);
  o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+0.05);
}
window.addEventListener('DOMContentLoaded', ()=>{
  const st = document.getElementById('sound-toggle');
  if(st) st.addEventListener('click', (e)=>{ soundOn=!soundOn; e.currentTarget.textContent = soundOn ? '\uD83D\uDD0A' : '\uD83D\uDD07'; ctx(); });
});

/* ================= CUSTOM CURSOR ================= */
window.addEventListener('DOMContentLoaded', ()=>{
  const dot=document.getElementById('cursor-dot'), ring=document.getElementById('cursor-ring');
  if(!dot||!ring) return;
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  window.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; });
  (function loop(){ rx+=(mx-rx)*0.16; ry+=(my-ry)*0.16; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); })();
  document.querySelectorAll('a,button,.tilt-card,.flip-card,#sound-toggle,.skill-chip').forEach(el=>{
    el.addEventListener('mouseenter', ()=>ring.classList.add('hover'));
    el.addEventListener('mouseleave', ()=>ring.classList.remove('hover'));
  });
});

/* ================= MANGA PANEL LOOP (changes every 1s, forever) ================= */
window.addEventListener('DOMContentLoaded', ()=>{
  const pages=document.querySelectorAll('.manga-page');
  const flashEl=document.getElementById('panel-flash');
  if(!pages.length) return;
  let pageIdx=0;
  setInterval(()=>{
    pages[pageIdx].classList.remove('active');
    pageIdx=(pageIdx+1)%pages.length;
    pages[pageIdx].classList.add('active');
    if(flashEl){ flashEl.classList.remove('hit'); void flashEl.offsetWidth; flashEl.classList.add('hit'); }
    playShutter();
  }, 1000);
});

/* ================= CLICK IMPACT (best-effort comic hit, everywhere, every click) ================= */
const WORDS=['POW!','BAM!','WHACK!','CRASH!','ZAP!','KAPOW!','BOOM!','SMASH!','THWACK!','BONK!'];
const clickFlash = document.createElement('div'); clickFlash.id='click-flash';
window.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(clickFlash));

function clickImpact(x,y){
  const wrap=document.createElement('div'); wrap.className='impact-wrap';
  document.body.appendChild(wrap);

  // core star
  const star=document.createElement('div'); star.className='impact-star'; star.style.left=x+'px'; star.style.top=y+'px';
  wrap.appendChild(star);
  star.animate([{transform:'translate(-50%,-50%) scale(0.25) rotate(0deg)',opacity:1},{transform:'translate(-50%,-50%) scale(2.6) rotate(60deg)',opacity:0}],{duration:440,easing:'cubic-bezier(.2,.8,.2,1)'});

  // expanding ring
  const ring=document.createElement('div'); ring.className='impact-ring'; ring.style.left=x+'px'; ring.style.top=y+'px';
  wrap.appendChild(ring);
  ring.animate([{transform:'translate(-50%,-50%) scale(0.5)',opacity:1},{transform:'translate(-50%,-50%) scale(9)',opacity:0}],{duration:500,easing:'ease-out'});

  // speed lines radiating
  const lines=16;
  for(let i=0;i<lines;i++){
    const line=document.createElement('div'); line.className='speed-line';
    const angle=(360/lines)*i + Math.random()*8;
    line.style.left=x+'px'; line.style.top=y+'px';
    line.style.transform=`translate(-50%,-50%) rotate(${angle}deg)`;
    wrap.appendChild(line);
    const dist=40+Math.random()*90;
    line.animate([
      {transform:`translate(-50%,-50%) rotate(${angle}deg) translateY(0)`, opacity:1},
      {transform:`translate(-50%,-50%) rotate(${angle}deg) translateY(-${dist}px)`, opacity:0}
    ],{duration:400+Math.random()*220, easing:'ease-out'});
  }

  // ink splatter dots
  for(let i=0;i<10;i++){
    const dotEl=document.createElement('div'); dotEl.className='ink-dot';
    dotEl.style.left=x+'px'; dotEl.style.top=y+'px';
    wrap.appendChild(dotEl);
    const ang=Math.random()*Math.PI*2, dist=20+Math.random()*80;
    dotEl.animate([
      {transform:'translate(-50%,-50%) scale(1)', opacity:1},
      {transform:`translate(${Math.cos(ang)*dist-2.5}px, ${Math.sin(ang)*dist-2.5}px) scale(0.4)`, opacity:0}
    ],{duration:500+Math.random()*300, easing:'cubic-bezier(.2,.8,.2,1)'});
  }

  // onomatopoeia word
  const word=document.createElement('div'); word.className='sfx-word'; word.textContent=WORDS[Math.floor(Math.random()*WORDS.length)];
  word.style.left=x+'px'; word.style.top=y+'px';
  const rot=(Math.random()*20-10);
  wrap.appendChild(word);
  word.animate([
    {transform:`translate(-50%,-50%) rotate(${rot}deg) scale(0.3)`, opacity:0},
    {transform:`translate(-50%,-65%) rotate(${rot*0.4}deg) scale(1.2)`, opacity:1, offset:0.35},
    {transform:`translate(-50%,-78%) rotate(0deg) scale(1)`, opacity:0}
  ],{duration:780, easing:'cubic-bezier(.2,.8,.2,1)'});

  // screen flash + shake for extra punch
  clickFlash.classList.remove('hit'); void clickFlash.offsetWidth; clickFlash.classList.add('hit');
  document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');

  setTimeout(()=>wrap.remove(), 820);
}
document.addEventListener('click', (e)=>{ clickImpact(e.clientX, e.clientY); playHit(); });

/* ================= 3D TILT ================= */
window.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.tilt-card').forEach(card=>{
    card.addEventListener('mousemove',(e)=>{
      const r=card.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width-0.5; const py=(e.clientY-r.top)/r.height-0.5;
      card.style.transform=`rotateX(${py*-12}deg) rotateY(${px*14}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform=''; });
  });

  /* ================= FLIP CARDS ================= */
  document.querySelectorAll('[data-flip]').forEach(card=>{
    card.addEventListener('click',(e)=>{ e.stopPropagation(); card.classList.toggle('flipped'); playHit(); clickImpact(e.clientX,e.clientY); });
  });

  /* ================= SCROLL REVEAL ================= */
  const io=new IntersectionObserver((entries)=>{ entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); } }); }, {threshold:0.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  /* ================= NAV WHOOSH ON PAGE LEAVE ================= */
  document.querySelectorAll('[data-nav]').forEach(link=>{
    link.addEventListener('click', ()=>{ playWhoosh(); });
  });

  /* ================= GLITCH HERO TEXT (index page only) ================= */
  const glitchEl=document.querySelector('.glitch[data-glitch]');
  if(glitchEl){
    const glitchChars='!<>-_\\/[]{}\u2014=+*^?#';
    function glitchOnce(el){
      const original=el.getAttribute('data-glitch'); let frame=0; const totalFrames=14;
      const timer=setInterval(()=>{
        frame++; let out='';
        for(let i=0;i<original.length;i++){
          if(original[i]===' '){ out+=' '; continue; }
          if(frame>totalFrames*0.6 || Math.random() > (frame/totalFrames)){ out+=original[i]; } else { out+=glitchChars[Math.floor(Math.random()*glitchChars.length)]; }
        }
        el.textContent=out;
        if(frame>=totalFrames){ clearInterval(timer); el.textContent=original; }
      },45);
    }
    setTimeout(()=>glitchOnce(glitchEl),300);
  }
});
