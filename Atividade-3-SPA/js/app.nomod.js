(function(){
  // templates
  function Home(){return `
    <section class="grid">
      <div class="card">
        <h1>Bem-vindo(a) à ONG Conecta</h1>
        <p>Conectando pessoas e causas para transformar realidades.</p>
        <img src="imagens/hero.jpg" alt="Imagem destaque da ONG">
      </div>
    </section>`;}
  function Projetos(lista){lista=lista||seedProjetos();return `
    <section>
      <h2>Projetos</h2>
      <div class="cards">
        ${lista.map(p=>`
          <article class="card">
            <h3>${p.titulo}</h3>
            <p>${p.descricao}</p>
            <span class="badge">${p.categoria}</span>
          </article>`).join('')}
      </div>
      <figure class="hero"><img src="imagens/projetos.jpg" alt="Projetos de voluntariado"></figure>
    </section>`;}
  function Cadastro(model){model=model||{};return `
    <section>
      <h2>Cadastro de Voluntários</h2>
      <form id="formCadastro" novalidate class="form">
        <div class="grid" style="grid-template-columns:repeat(2,1fr)">
          <div><label>Nome Completo</label><input type="text" name="nome" required value="${model.nome||''}"></div>
          <div><label>E-mail</label><input type="email" name="email" required value="${model.email||''}"></div>
          <div><label>CPF</label><input type="text" name="cpf" required placeholder="000.000.000-00" value="${model.cpf||''}"></div>
          <div><label>Telefone</label><input type="tel" name="telefone" required placeholder="(11) 99999-0000" value="${model.telefone||''}"></div>
          <div><label>Data de Nascimento</label><input type="date" name="nascimento" required value="${model.nascimento||''}"></div>
          <div><label>CEP</label><input type="text" name="cep" required placeholder="00000-000" value="${model.cep||''}"></div>
          <div><label>Cidade</label><input type="text" name="cidade" required value="${model.cidade||''}"></div>
          <div><label>Estado</label><input type="text" name="estado" required value="${model.estado||''}"></div>
        </div>
        <div id="errors" aria-live="assertive"></div>
        <div class="mt-16"><button class="btn primary" type="submit">Enviar</button></div>
      </form>
    </section>`;}

  // store (localStorage)
  const KEY_VOL = "pc_voluntarios";
  const KEY_PROJ = "pc_projetos";
  function getVoluntarios(){try{return JSON.parse(localStorage.getItem(KEY_VOL))||[]}catch{return []}}
  function addVoluntario(v){const all=getVoluntarios();all.push(Object.assign({},v,{id:String(Date.now()),createdAt:Date.now()}));localStorage.setItem(KEY_VOL, JSON.stringify(all));}
  function getProjetos(){try{return JSON.parse(localStorage.getItem(KEY_PROJ))||seedProjetos()}catch{return seedProjetos()}}
  function seedProjetos(){const data=[
    {id:"p1",titulo:"Leitura que Transforma",descricao:"Oficinas semanais de leitura.",categoria:"Educação"},
    {id:"p2",titulo:"Cuidar e Prevenir",descricao:"Ações de saúde preventiva.",categoria:"Saúde"},
    {id:"p3",titulo:"Verde Vivo",descricao:"Mutirões ambientais.",categoria:"Meio Ambiente"},
  ];localStorage.setItem(KEY_PROJ, JSON.stringify(data));return data;}

  // validators + masks
  function validarDados(fd){
    const data=Object.fromEntries(fd);const errors=[];
    const reEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const reCPF=/^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    const reTel=/^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
    const reCEP=/^\d{5}-\d{3}$/;
    ["nome","email","cpf","telefone","nascimento","cep","cidade","estado"].forEach(k=>{if(!data[k]||!String(data[k]).trim())errors.push(`${k}: obrigatório`)});
    if(data.nome && data.nome.trim().split(/\s+/).length<2)errors.push("nome: informe nome e sobrenome");
    if(data.email && !reEmail.test(data.email))errors.push("email: inválido");
    if(data.cpf && !reCPF.test(data.cpf))errors.push("cpf: use 000.000.000-00");
    if(data.telefone && !reTel.test(data.telefone))errors.push("telefone: use (11) 99999-0000");
    if(data.cep && !reCEP.test(data.cep))errors.push("cep: use 00000-000");
    if(data.nascimento){const nasc=new Date(data.nascimento+"T00:00:00");if(isNaN(nasc.getTime()))errors.push("nascimento: inválida");}
    return {ok:errors.length===0,errors,data};
  }
  function maskCPF(v){const d=v.replace(/\D/g,'');return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2}).*/,"$1.$2.$3-$4")}
  function maskTel(v){const d=v.replace(/\D/g,'');return (d.length>10?d.replace(/(\d{2})(\d{5})(\d{4}).*/,"($1) $2-$3"):d.replace(/(\d{2})(\d{4})(\d{4}).*/,"($1) $2-$3"))}
  def_mask_cep = lambda v: None;
  function maskCEP(v){const d=v.replace(/\D/g,'');return d.replace(/(\d{5})(\d{3}).*/,"$1-$2")}

  // router
  const routes={'/':()=>Home(),'/projetos':()=>Projetos(getProjetos()),'/cadastro':()=>Cadastro({})};
  function parseRoute(){const h=location.hash.replace('#','')||'/';return routes[h]?h:'/';}
  function render(){
    const r=parseRoute();const el=document.getElementById('app');el.innerHTML=routes[r]();
    if(r==='/cadastro'){const f=document.getElementById('formCadastro');
      const cpf=f.querySelector('[name="cpf"]');const tel=f.querySelector('[name="telefone"]');const cep=f.querySelector('[name="cep"]');
      if(cpf)cpf.addEventListener('input',e=>e.target.value=maskCPF(e.target.value));
      if(tel)tel.addEventListener('input',e=>e.target.value=maskTel(e.target.value));
      if(cep)cep.addEventListener('input',e=>e.target.value=maskCEP(e.target.value));
      f.addEventListener('submit',e=>{e.preventDefault();const res=validarDados(new FormData(f));const box=document.getElementById('errors');
        if(res.errors.length){box.innerHTML='<div class="card" style="border-color:#dc2626"><strong>Por favor, corrija:</strong><ul>'+res.errors.map(e=>`<li>${e}</li>`).join('')+'</ul></div>';}
        else{box.innerHTML='';addVoluntario(res.data);alert('Cadastro enviado!');f.reset();}
      });
    }
  }
  window.addEventListener('hashchange',render);window.addEventListener('DOMContentLoaded',render);
})();