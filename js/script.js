const menu=document.querySelector('#menu'),links=document.querySelector('#links');
menu.addEventListener('click',()=>{let open=links.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.textContent=open?'×':'☰'});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* Interactive 3D-inspired particle sphere: drag to rotate, hover to light particles, click to pulse. */
(()=>{
 const canvas=document.querySelector('#orbCanvas'),scene=document.querySelector('#interactiveScene');
 if(!canvas||!scene)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let w=0,h=0,dpr=1,rotX=-.18,rotY=.35,dragging=false,lastX=0,lastY=0,pulse=0,last=performance.now();
 const pointer={x:0,y:0,inside:false},points=[],count=230;
 for(let i=0;i<count;i++){const y=1-2*i/(count-1),r=Math.sqrt(1-y*y),a=Math.PI*(3-Math.sqrt(5))*i;points.push({x:Math.cos(a)*r,y,z:Math.sin(a)*r,phase:Math.random()*6.28});}
 function resize(){const r=scene.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
 new ResizeObserver(resize).observe(scene);resize();
 function project(p,t){const wobble=reduced?0:Math.sin(t*.0007+p.phase)*.012,x=p.x*(1+wobble),y=p.y*(1+wobble),z=p.z*(1+wobble),cy=Math.cos(rotY),sy=Math.sin(rotY),cx=Math.cos(rotX),sx=Math.sin(rotX),x1=x*cy-z*sy,z1=x*sy+z*cy,y1=y*cx-z1*sx,z2=y*sx+z1*cx,perspective=3.1/(3.1-z2*.62),scale=Math.min(w,h)*.34;return{x:w/2+x1*scale*perspective,y:h/2+y1*scale*perspective,z:z2,depth:perspective};}
 function draw(now){const dt=Math.min((now-last)/16.67,2);last=now;ctx.clearRect(0,0,w,h);if(!dragging&&!reduced)rotY+=.0024*dt;
 const cx=w/2,cy=h/2,rad=Math.min(w,h)*.34,g=ctx.createRadialGradient(cx,cy,rad*.05,cx,cy,rad*1.5);g.addColorStop(0,'rgba(167,139,250,.14)');g.addColorStop(.55,'rgba(87,190,220,.055)');g.addColorStop(1,'rgba(8,11,18,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(cx,cy);ctx.strokeStyle='rgba(180,154,255,.22)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,0,rad*1.17,rad*.37,-.48,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(114,227,245,.19)';ctx.beginPath();ctx.ellipse(0,0,rad*1.18,rad*.34,.55,0,Math.PI*2);ctx.stroke();ctx.restore();
 const projected=points.map(p=>({p,...project(p,now)})).sort((a,b)=>a.z-b.z);
 for(const q of projected){const dx=pointer.x-q.x,dy=pointer.y-q.y,dist=Math.hypot(dx,dy),influence=pointer.inside?Math.max(0,1-dist/105):0,size=(1+q.depth*.95)*(q.z>0?1.15:.8)+influence*2.2,alpha=Math.min(.95,.28+q.depth*.45+(q.z>0?.22:0)+influence*.35);ctx.beginPath();ctx.arc(q.x,q.y,size,0,Math.PI*2);ctx.fillStyle=q.z>.2?`rgba(196,181,253,${alpha})`:`rgba(114,227,245,${alpha*.82})`;ctx.fill();if(influence>.25){ctx.beginPath();ctx.arc(q.x,q.y,size*3,0,Math.PI*2);ctx.fillStyle=`rgba(114,227,245,${influence*.11})`;ctx.fill();}}
 if(pulse>0){ctx.beginPath();ctx.arc(cx,cy,rad*(1.1-pulse*.72),0,Math.PI*2);ctx.strokeStyle=`rgba(114,227,245,${pulse*.65})`;ctx.lineWidth=1.5;ctx.stroke();pulse=Math.max(0,pulse-.018*dt);}
 const core=ctx.createRadialGradient(cx-rad*.08,cy-rad*.09,2,cx,cy,rad*.3);core.addColorStop(0,'rgba(242,232,255,.95)');core.addColorStop(.22,'rgba(180,154,255,.8)');core.addColorStop(.65,'rgba(99,111,211,.28)');core.addColorStop(1,'rgba(99,111,211,0)');ctx.fillStyle=core;ctx.beginPath();ctx.arc(cx,cy,rad*.3,0,Math.PI*2);ctx.fill();
 if(!reduced)requestAnimationFrame(draw);}
 function move(e){const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.inside=true;}
 canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);move(e);});
 canvas.addEventListener('pointermove',e=>{move(e);if(dragging){rotY+=(e.clientX-lastX)*.009;rotX=Math.max(-1.15,Math.min(1.15,rotX+(e.clientY-lastY)*.009));lastX=e.clientX;lastY=e.clientY;}});
 canvas.addEventListener('pointerup',()=>{if(dragging)pulse=1;dragging=false;});
 canvas.addEventListener('pointercancel',()=>dragging=false);
 canvas.addEventListener('pointerleave',()=>{if(!dragging)pointer.inside=false;});
 canvas.addEventListener('click',()=>pulse=1);
 if(reduced)draw(performance.now());else requestAnimationFrame(draw);
})();
