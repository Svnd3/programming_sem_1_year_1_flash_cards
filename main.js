import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { extraCards } from './extra-cards.js';

const cards = [
  ['Core','Programming','The process of turning a solution into instructions a computer can execute.'],
  ['Core','Program','A set of instructions a computer follows to perform a task.'],
  ['Core','Algorithm','A finite, ordered set of clear steps for solving a problem.'],
  ['Core','Pseudocode','A plain-language outline of an algorithm, before writing real code.'],
  ['Core','Flowchart','A diagram that uses symbols and arrows to show an algorithm.'],
  ['Core','IPO','Input, Processing, Output: a simple way to break down a problem.'],
  ['Data','Variable','A named place in memory for a value that can change.'],
  ['Data','Constant','A named value that cannot change while a program runs.'],
  ['Data','Data type','The kind of value stored, such as int, float, char or bool.'],
  ['Data','Array','A fixed collection of same-type values, accessed by index. In C++, the first index is 0.'],
  ['Data','Pointer','A variable that stores the memory address of another variable.'],
  ['Data','Scope','The part of a program where a variable can be used.'],
  ['Translation','Compiler','Translates the whole program before it runs. Common with C++.'],
  ['Translation','Interpreter','Translates and runs code one line at a time. Common with Python.'],
  ['Translation','Source code','Instructions written by a programmer in a programming language.'],
  ['Translation','Machine language','Binary instructions (0s and 1s) understood directly by a computer.'],
  ['Translation','IDE','A development workspace with tools like an editor, compiler and debugger.'],
  ['Syntax','Statement','A single instruction that performs an action. In C++, it usually ends with ;'],
  ['Syntax','Expression','Values and operators combined to produce a value, like x + 5.'],
  ['Syntax','Comment','An explanation in code that the compiler ignores. C++ uses // or /* â€¦ */.'],
  ['Errors','Syntax error','Code that breaks the language rules, such as a missing semicolon.'],
  ['Errors','Runtime error','A problem that happens while a program is running.'],
  ['Errors','Logical error','The program runs, but produces the wrong result.'],
  ['Functions','Function','A named block of code that performs a task and can be reused.'],
  ['Functions','Parameter','A placeholder variable listed in a function definition.'],
  ['Functions','Call by value','A function receives a copy, so changes do not affect the original.'],
  ['Functions','Recursion','When a function calls itself. It needs a base case to stop.'],
  ['Control','Loop','A structure that repeats a block of code while a condition holds.'],
  ['Control','for loop','A counter-controlled loop with setup, condition and update.'],
  ['Control','while loop','Checks its condition before each repetition; it can run zero times.'],
  ['Control','break','Immediately exits the current loop or switch.'],
  ['Control','continue','Skips to the next loop iteration.'],
  ['Operators','Modulus (%)','Returns the remainder. Use n % 2 to check if n is even.'],
  ['Operators','Equality (==)','Checks whether two values are equal. Assignment uses a single =.'],
  ['Operators','Logical operators','Combine conditions: && means AND, || means OR, and ! means NOT.'],
  ['Python','Python input','input() returns text. Use int() or float() to convert numeric input.'],
  ['Python','Python indentation','Indentation defines code blocks. A wrong indent causes an error.'],
  ['Python','Python range','range(1, 11) counts from 1 up to, but excludes, 11.'],
  ['Python','Python division','/ gives a decimal result; // gives whole-number division.'],
  ['Python','Python conditionals','Use if, elif and else with a colon and an indented body.'],
  ['Python','Python loops','for item in collection repeats once for each item.']
].map(([topic,title,definition])=>({topic,title,definition,id:title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}));
const existingTitles=new Set(cards.map(card=>card.title.toLowerCase()));
extraCards.forEach(card=>{if(!existingTitles.has(card.title.toLowerCase())){existingTitles.add(card.title.toLowerCase());cards.push({...card,id:card.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')})}});

const palette={Core:['#ffd52f','#fff187','#d49a00'],Data:['#90ed61','#ccff7b','#449c25'],Translation:['#ff805b','#ffb28d','#c94028'],Syntax:['#5bdcff','#a8f2ff','#148ac2'],Errors:['#ff72ac','#ffadd1','#bf2866'],Functions:['#bd80ff','#e0b5ff','#7936bc'],Control:['#ffae36','#ffd16b','#c56a00'],Operators:['#59e7bd','#a1ffe0','#168d72'],Python:['#ffee42','#fff896','#c4a800']};
const collectedOrder=JSON.parse(localStorage.getItem('sundays-order')||'[]');
const previouslySeen=JSON.parse(localStorage.getItem('sundays-seen')||'[]');
previouslySeen.forEach(id=>{if(!collectedOrder.includes(id))collectedOrder.push(id)});
const seen=new Set(collectedOrder);
const container=document.querySelector('#canvas-container'), bar=document.querySelector('#progress-bar'), pct=document.querySelector('#progress-text');
const modal=document.querySelector('#photo-modal'), modalCard=document.querySelector('#modal-card'); let activeCard=null, activeTopic='All';
const topics=['All',...new Set(cards.map(c=>c.topic))]; const nav=document.querySelector('#topics');const topbar=document.querySelector('.topbar'),navToggle=document.querySelector('#nav-toggle');
navToggle.addEventListener('click',()=>{const open=topbar.classList.toggle('nav-open');navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'Close topics':'Open topics');nav.setAttribute('aria-hidden',String(!open))});
document.addEventListener('click',e=>{if(!topbar.contains(e.target)&&topbar.classList.contains('nav-open')){topbar.classList.remove('nav-open');navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','Open topics');nav.setAttribute('aria-hidden','true')}});
topics.forEach(topic=>{const b=document.createElement('button');b.className='topic-pill'+(topic==='All'?' active':'');b.textContent=topic;b.onclick=()=>{activeTopic=topic;nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));meshes.forEach(m=>{m.visible=topic==='All'||m.userData.card.topic===topic});topbar.classList.remove('nav-open');navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','Open topics');nav.setAttribute('aria-hidden','true')};nav.append(b)});

const scene=new THREE.Scene(); scene.fog=new THREE.FogExp2(0xf6eee3,.012);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,100);camera.position.set(0,1.2,20.5);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xf6eee3,0);container.append(renderer.domElement);
const liquidMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uProgress:{value:0},uColor:{value:new THREE.Color('#16a4ff')}},vertexShader:`varying vec3 vPos;void main(){vPos=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform float uTime;uniform float uProgress;uniform vec3 uColor;varying vec3 vPos;void main(){float edge=vPos.y+sin(vPos.x*7.0+uTime*.65)*.035+sin(vPos.z*8.0-uTime*.5)*.025;float alpha=smoothstep(edge-.025,edge+.025,uProgress*2.1-1.05);gl_FragColor=vec4(uColor,alpha*.94);}`});
const liquidGlobe=new THREE.Mesh(new THREE.SphereGeometry(6.58,96,72),liquidMaterial);liquidGlobe.renderOrder=0;scene.add(liquidGlobe);
const controls=new OrbitControls(camera,renderer.domElement);Object.assign(controls,{enableDamping:true,dampingFactor:.06,minDistance:3.5,maxDistance:30,enablePan:false,rotateSpeed:.5,zoomSpeed:.7});
const layers=[{radius:9.2,count:cards.length,size:1.55,speed:.035}], meshes=[], groups=[];
function texture(card,mono=null){const s=300,canvas=document.createElement('canvas');canvas.width=canvas.height=s;const ctx=canvas.getContext('2d');const color=mono?[mono,mono,mono]:(seen.has(card.id)?['#c3c6cc','#e3e5e9','#9da1aa']:palette[card.topic]||palette.Core);ctx.beginPath();ctx.roundRect(0,0,s,s,70);ctx.clip();ctx.fillStyle=color[0];ctx.fillRect(0,0,s,s);if(!mono){const g=ctx.createLinearGradient(0,0,s,s);g.addColorStop(0,'rgba(255,255,255,.30)');g.addColorStop(1,'rgba(0,0,0,.12)');ctx.fillStyle=g;ctx.fillRect(0,0,s,s)}ctx.strokeStyle='rgba(48,35,23,.45)';ctx.lineWidth=5;ctx.strokeRect(3,3,s-6,s-6);ctx.fillStyle=mono?'#172331':(seen.has(card.id)?'#555860':'#302317');ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${card.title.length>16?26:34}px Paper`;wrapText(ctx,card.title,s/2,s/2,240,40);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;return tex}
function makeCardGeometry(){const shape=new THREE.Shape(),r=.25;shape.moveTo(r,0);shape.lineTo(1-r,0);shape.quadraticCurveTo(1,0,1,r);shape.lineTo(1,1-r);shape.quadraticCurveTo(1,1,1-r,1);shape.lineTo(r,1);shape.quadraticCurveTo(0,1,0,1-r);shape.lineTo(0,r);shape.quadraticCurveTo(0,0,r,0);const geometry=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.025,bevelThickness:.025});geometry.translate(-.5,-.5,0);return geometry}
const cardGeometry=makeCardGeometry();
function wrapText(ctx,text,x,y,maxWidth,lineHeight){const words=text.split(' '),lines=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word}else line=next}lines.push(line);lines.slice(0,3).forEach((l,i)=>ctx.fillText(l,x,y+(i-(Math.min(lines.length,3)-1)/2)*lineHeight))}
function points(count,r){const out=[],gold=(1+Math.sqrt(5))/2;for(let i=0;i<count;i++){const t=2*Math.PI*i/gold,p=Math.acos(1-2*(i+.5)/count);out.push(new THREE.Vector3(r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t)))}return out}
const storedAnchor=JSON.parse(localStorage.getItem('sundays-anchor')||'null');let magnetAnchor=storedAnchor?new THREE.Vector3(...storedAnchor).normalize():(collectedOrder.length?new THREE.Vector3(0,0,1):null);if(!storedAnchor&&magnetAnchor)localStorage.setItem('sundays-anchor',JSON.stringify(magnetAnchor.toArray()));
const magnetRadius=6.75,slotTemplate=points(cards.length,magnetRadius).sort((a,b)=>b.z-a.z);
function magnetSlot(index,anchor=magnetAnchor){const direction=(anchor||new THREE.Vector3(0,0,1)).clone().normalize(),rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),direction);return slotTemplate[index].clone().applyQuaternion(rotation)}
let built=0;await document.fonts.load('34px Paper');layers.forEach((layer,li)=>{const group=new THREE.Group(),start=points(layer.count,layer.radius);start.forEach((pos,pi)=>{const card=cards[pi],map=texture(card),front=new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.03,side:THREE.DoubleSide,fog:true}),edge=new THREE.MeshBasicMaterial({color:seen.has(card.id)?0x777a82:0x302317}),mesh=new THREE.Mesh(cardGeometry,[front,edge]);mesh.scale.set(layer.size,layer.size,1);mesh.position.copy(pos);mesh.lookAt(pos.clone().multiplyScalar(2));const orderIndex=collectedOrder.indexOf(card.id);mesh.userData={card,target:orderIndex>=0?magnetSlot(orderIndex):null,settled:seen.has(card.id),inPlace:false};if(mesh.userData.settled&&mesh.userData.target){mesh.position.copy(mesh.userData.target);mesh.lookAt(mesh.userData.target.clone().multiplyScalar(2));mesh.userData.inPlace=true}mesh.visible=activeTopic==='All'||card.topic===activeTopic;group.add(mesh);meshes.push(mesh);built++});scene.add(group);groups.push({group,speed:layer.speed});bar.style.width='100%';pct.textContent='100%'});
document.querySelector('#loading-screen').classList.add('hidden');setTimeout(()=>document.querySelector('#loading-screen')?.remove(),800);
let activeMesh=null;let dragging=false;controls.addEventListener('start',()=>dragging=true);controls.addEventListener('end',()=>dragging=false);const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),down={x:0,y:0};renderer.domElement.addEventListener('pointerdown',e=>{down.x=e.clientX;down.y=e.clientY});renderer.domElement.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;pointer.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(meshes,false)[0];if(hit)openCard(hit.object.userData.card,hit.object)});renderer.domElement.addEventListener('pointermove',e=>{pointer.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);raycaster.setFromCamera(pointer,camera);renderer.domElement.style.cursor=raycaster.intersectObjects(meshes,false).length?'pointer':'grab'});
function openCard(card,mesh){activeCard=card;activeMesh=mesh;const colors=palette[card.topic]||palette.Core;modalCard.style.setProperty('--card-color',colors[0]);modalCard.style.setProperty('--card-light',colors[1]);modalCard.style.setProperty('--card-dark',colors[2]);modalCard.querySelector('.card-front h1').textContent=card.title;modalCard.querySelector('.card-back h2').textContent=card.title;modalCard.querySelector('.card-back p').textContent=card.definition;modalCard.classList.remove('flipped');modal.classList.add('active');modal.setAttribute('aria-hidden','false');modalCard.focus()}
function closeCard(){if(activeCard&&activeMesh){if(!magnetAnchor){magnetAnchor=activeMesh.position.clone().normalize();localStorage.setItem('sundays-anchor',JSON.stringify(magnetAnchor.toArray()))}if(!collectedOrder.includes(activeCard.id))collectedOrder.push(activeCard.id);seen.add(activeCard.id);localStorage.setItem('sundays-order',JSON.stringify(collectedOrder));localStorage.setItem('sundays-seen',JSON.stringify([...seen]));const target=magnetSlot(collectedOrder.indexOf(activeCard.id));meshes.filter(m=>m.userData.card.id===activeCard.id).forEach(m=>{m.material[0].map.dispose();m.material[0].map=texture(activeCard);m.material[0].needsUpdate=true;m.material[1].color.set(0x777a82);m.userData.target=target.clone();m.userData.settled=true;m.userData.inPlace=false})}modal.classList.remove('active');modal.setAttribute('aria-hidden','true');activeCard=null;activeMesh=null}
function testFinish(){if(completionStarted)return;if(!magnetAnchor)magnetAnchor=meshes[0].position.clone().normalize();cards.forEach(card=>{if(!collectedOrder.includes(card.id))collectedOrder.push(card.id);seen.add(card.id)});meshes.forEach(mesh=>{mesh.material[0].map.dispose();mesh.material[0].map=texture(mesh.userData.card);mesh.material[0].needsUpdate=true;mesh.material[1].color.set(0x777a82);mesh.userData.target=magnetSlot(collectedOrder.indexOf(mesh.userData.card.id));mesh.userData.settled=true;mesh.userData.inPlace=false})}
document.querySelector('#test-finish').addEventListener('click',testFinish);
document.querySelector('#redo-button').addEventListener('click',()=>{['sundays-order','sundays-seen','sundays-anchor'].forEach(k=>localStorage.removeItem(k));location.reload()});
modalCard.addEventListener('click',e=>{if(e.target.closest('.modal-close'))return;modalCard.classList.toggle('flipped')});document.querySelector('#modal-close').addEventListener('click',closeCard);modal.addEventListener('click',e=>{if(e.target===modal)closeCard()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCard();if(e.key===' '&&modal.classList.contains('active')&&e.target===modalCard){e.preventDefault();modalCard.classList.toggle('flipped')}});
const completionScreen=document.querySelector('#completion-screen'),completionFact=document.querySelector('#completion-fact'),factCategory=document.querySelector('#fact-category');
const facts=[
  ['History','The Inka road network stretched for about 24,000 milesâ€”built across mountains without iron tools or wheeled transport.'],
  ['History','Inka record keepers used knotted strings called khipu to store and communicate information.'],
  ['History','For centuries, royal purple dye was so costly that thousands of sea snails could be needed for one robe.'],
  ['History','The Smithsonian Institution began with an act of Congress in 1846.'],
  ['History','Ada Lovelaceâ€™s 1843 notes described a step-by-step calculation for Babbageâ€™s proposed Analytical Engine.'],
  ['History','Ada Lovelace imagined a calculating engine could work with symbolsâ€”and even compose music.'],
  ['History','Early ENIAC programmers rewired cables and switches for each new problem; setup could take days.'],
  ['History','Six women programmed ENIAC, one of the first large-scale electronic computers.'],
  ['History','The Manchester â€œBabyâ€ ran a 17-instruction program for 52 minutes in its first successful run.'],
  ['History','A moth was taped into the Harvard Mark II logbook in 1947. The word â€œbugâ€ for a fault was already older.'],
  ['History','Grace Hopper helped build one of the earliest compilers and later helped shape COBOL.'],
  ['History','The seven-bridges puzzle of KÃ¶nigsberg helped launch graph theory when Euler showed the route was impossible.'],
  ['History','Apollo 11â€™s command module, Columbia, was the only part of the first Moon-landing spacecraft to return to Earth.'],
  ['History','UNIVAC I passed U.S. Census Bureau tests in 1951, then helped bring computers into public view.'],
  ['Space','A day on Venus lasts longer than its yearâ€”and the Sun would rise in the west.'],
  ['Space','Neptuneâ€™s winds can race past 2,000 kilometres per hour.'],
  ['Space','One sunrise-to-sunset day on Mercury lasts about 176 Earth days.'],
  ['Biology','An octopus has three hearts, blue blood, and a ring-shaped brainâ€”with clusters of nerves in each arm.'],
  ['Biology','Tardigrades can curl into a dried-out â€œtunâ€ and survive for years until water returns.'],
  ['Chemistry','Gallium melts at about 29.8Â°Câ€”just above a warm room and close to body temperature.'],
  ['Math','Eulerâ€™s famous bridge puzzle turned a walk through a city into a new way to study networks.'],
  ['Computer science','The familiar â€œbugâ€ story is literal: a moth once jammed a relay inside an early computer.'],
  ['Computer science','A compiler translates code; Grace Hopper helped make that idea practical on early computers.'],
  ['History','The Inka called their empire Tawantinsuyu, meaning â€œthe four regions together.â€']
];
let completionStarted=false,connectors=null,completionAt=0,selectedColor='#16a4ff',completionFactsShown=false;
function buildConnectorPath(){const ordered=[],remaining=new Set(meshes);let current=meshes.find(m=>m.userData.card.id===collectedOrder[0])||meshes[0];ordered.push(current);remaining.delete(current);while(remaining.size){let next=null,best=Infinity;for(const candidate of remaining){const d=current.userData.target.distanceToSquared(candidate.userData.target);if(d<best){best=d;next=candidate}}ordered.push(next);remaining.delete(next);current=next}const vertices=[];for(let i=1;i<ordered.length;i++){const a=ordered[i-1].userData.target.clone().normalize().multiplyScalar(magnetRadius+.22),b=ordered[i].userData.target.clone().normalize().multiplyScalar(magnetRadius+.22);for(let j=0;j<8;j++){const p=a.clone().lerp(b,j/8),q=a.clone().lerp(b,(j+1)/8);vertices.push(p.x,p.y,p.z,q.x,q.y,q.z)}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setDrawRange(0,0);connectors=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:selectedColor,transparent:true,opacity:.9}));connectors.renderOrder=5;groups[0].group.add(connectors);return ordered}
let completionPath=[];
function beginCompletion(t){completionStarted=true;completionAt=t;const options=['#17a9ff','#13e6bd','#ff45b8','#ffb21c','#9a55ff'];selectedColor=options[Math.floor(Math.random()*options.length)];liquidMaterial.uniforms.uColor.value.set(selectedColor);completionPath=buildConnectorPath();const [category,fact]=facts[Math.floor(Math.random()*facts.length)];factCategory.textContent=category;completionFact.textContent=fact}
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime(),mul=dragging ? .15 : 1;liquidMaterial.uniforms.uTime.value=t;groups.forEach((l,i)=>{l.group.rotation.y+=l.speed*.008*mul;l.group.rotation.x=Math.sin(t*.13*(i+1))*.025;l.group.rotation.z=Math.cos(t*.1*(i+1))*.018;l.group.children.forEach(m=>{if(m.userData.settled&&!m.userData.inPlace){m.position.lerp(m.userData.target,.035);const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(m.userData.target,m.userData.target.clone().multiplyScalar(2),new THREE.Vector3(0,1,0)));m.quaternion.slerp(q,.035);if(m.position.distanceTo(m.userData.target)<.015){m.position.copy(m.userData.target);m.userData.inPlace=true}}if(m.userData.lift!==undefined){m.userData.lift+=(m.userData.liftTarget-m.userData.lift)*.12;const base=m.userData.target||m.position;m.position.copy(base).addScaledVector(base.clone().normalize(),m.userData.lift)}})});if(!completionStarted&&meshes.length&&meshes.every(m=>m.userData.inPlace))beginCompletion(t);if(completionStarted){const elapsed=t-completionAt,step=.065,reached=Math.min(completionPath.length,Math.floor(elapsed/step)+1),segments=Math.min((completionPath.length-1)*8,Math.floor(elapsed/step)*8);if(connectors)connectors.geometry.setDrawRange(0,segments*2);for(let i=0;i<reached;i++){const m=completionPath[i];if(!m.userData.mono){m.userData.mono=true;m.userData.lift=0;m.userData.liftTarget=.3;m.material[0].map.dispose();m.material[0].map=texture(m.userData.card,selectedColor);m.material[0].needsUpdate=true;m.material[1].color.set(0x171717)}}const fillStart=completionPath.length*step+.35,fill=(elapsed-fillStart)/2.5;liquidMaterial.uniforms.uProgress.value=Math.max(0,Math.min(1,fill));if(fill>=1&&!completionFactsShown){completionFactsShown=true;document.body.classList.add('complete');completionScreen.classList.add('active');completionScreen.setAttribute('aria-hidden','false');setTimeout(()=>completionScreen.classList.add('show-quote'),1700)}}scene.position.y=Math.sin(t*.18)*.12;controls.update();renderer.render(scene,camera)}const clock=new THREE.Clock();animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

