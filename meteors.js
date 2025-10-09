
(function(){
  const root = document.createElement('div');
  root.style.cssText='position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;';
  document.body.appendChild(root);
  const COUNT=120;
  for(let i=0;i<COUNT;i++){
    const m=document.createElement('div');
    const h=80+Math.random()*120;
    m.style.cssText = 'position:absolute;width:2px;height:'+h+'px;background:linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,.9),rgba(255,255,255,0));filter:drop-shadow(0 0 6px rgba(255,255,255,.5));top:-150px;opacity:.85;';
    m.style.left = (Math.random()*100)+'vw';
    const dur=(2+Math.random()*3).toFixed(2);
    const delay=(Math.random()*3).toFixed(2);
    m.style.animation = 'fall '+dur+'s linear '+delay+'s infinite';
    root.appendChild(m);
  }
  const style=document.createElement('style');
  style.textContent='@keyframes fall{from{transform:translateY(-140px)}to{transform:translateY(110vh)}}';
  document.head.appendChild(style);
})();
