const STORAGE_KEY = 'oval_portfolio_projects_v2';
    const PROFILE_KEY = 'oval_portfolio_profile_v2';
    const SITE_KEY = 'oval_portfolio_site_v2';
    const HERO_KEY = 'oval_portfolio_hero_v2';
    const ADMIN_PASSWORD = 'justfriend1920';
    const ADMIN_SESSION_KEY = 'oval_portfolio_admin_session_v1';
    const adminAccessBtn = document.getElementById('adminAccessBtn');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminLoginError = document.getElementById('adminLoginError');

    function isAdmin(){ return sessionStorage.getItem(ADMIN_SESSION_KEY)==='1'; }
    function setAdminMode(on){
      document.body.classList.toggle('admin-mode', !!on);
      adminAccessBtn.classList.toggle('admin-on', !!on);
      adminAccessBtn.textContent = on ? 'Admin ✓' : 'Admin';
    }
    function syncScrollLock(){
      const hasOpenModal = !!document.querySelector('.modal.open');
      document.body.classList.toggle('modal-open', hasOpenModal);
      document.documentElement.style.overflowY = hasOpenModal ? 'hidden' : 'auto';
      document.body.style.overflowY = hasOpenModal ? 'hidden' : 'auto';
    }
    function openAdminLogin(){
      adminLoginError.textContent=''; adminPasswordInput.value='';
      adminLoginModal.classList.add('open'); syncScrollLock();
      setTimeout(()=>adminPasswordInput.focus(),50);
    }
    function closeAdminLogin(){ adminLoginModal.classList.remove('open'); syncScrollLock(); }
    function requireAdmin(action){ if(!isAdmin()){ openAdminLogin(); return false; } action?.(); return true; }
    function logoutAdmin(){
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      editingProjectId=null;
      selectedImage='';
      document.body.classList.remove('admin-mode');
      $$('.modal').forEach(m=>m.classList.remove('open'));
      syncScrollLock();
      if(imageInput) imageInput.value='';
      if(heroInput) heroInput.value='';
      if(profileInput) profileInput.value='';
      setAdminMode(false);
      toast('Kamu sudah keluar dari mode Admin. Mode pengunjung aktif.');
    }
    const defaultProjects = [
      {id:1,title:'Visual Event & Production',category:'Event Production',description:'Konsep visual dan produksi untuk kebutuhan event.',image:''},
      {id:2,title:'Brand Visual',category:'Graphic Design',description:'Eksplorasi layout, typography, dan materi promosi.',image:''},
      {id:3,title:'Photography Story',category:'Photography',description:'Dokumentasi visual dengan pendekatan natural.',image:''},
      {id:4,title:'Digital Campaign',category:'Digital Content',description:'Konten visual untuk memperkuat komunikasi brand.',image:''}
    ];
    const defaultSite = {
      heroEyebrow:'Graphic Designer • Visual Creative • Event Production',heroTitle1:'Creating',heroTitle2:'visual',heroTitle3:'with purpose.',
      heroDescription:'Halo, saya <strong>Oval Satriya Handanu</strong>. Saya menggabungkan desain, visual event, fotografi, dan produksi kreatif untuk membangun karya yang terlihat kuat sekaligus punya cerita.',
      heroCtaWork:'Lihat karya ↓',heroCtaContact:'Hubungi saya',profileName:'Oval Satriya Handanu',profileLocation:'Sintang, Kalimantan Barat<br>Indonesia',profileButton:'Tambah / Ganti foto profil',
      workEyebrow:'Selected work',workTitle1:'Karya',workTitle2:'pilihan.',workIntro:'Portfolio ini bersifat read-only untuk pengunjung. Hanya Admin yang dapat menambah, mengedit, dan menghapus karya serta mengubah teks dan gambar.',
      aboutEyebrow:'About',aboutText1:'Saya membuat desain yang',aboutText2:'jelas',aboutText3:'berkarakter',aboutText4:'dan siap dipakai.',aboutDescription:'Fokus saya berada pada desain komunikasi visual, kebutuhan event, branding sederhana, fotografi, serta produksi visual. Portfolio ini dibuat supaya proses menampilkan karya terasa cepat: pilih gambar, isi detail project, lalu project langsung muncul di halaman.',
      service1Title:'Graphic Design',service1Desc:'Poster, menu, social media, layout, dan materi promosi.',service2Title:'Event Visual',service2Desc:'Konsep visual event, booth, screen, dekorasi, dan produksi lapangan.',service3Title:'Photography',service3Desc:'Dokumentasi, portrait, product, dan kebutuhan visual brand.',service4Title:'Digital Content',service4Desc:'Konten visual untuk promosi digital dan kebutuhan bisnis.',skill1:'Photoshop',skill2:'Canva',skill3:'AutoCAD',skill4:'Graphic Design',skill5:'Photography',skill6:'Event Production',
      contactEyebrow:"Let's work together",contactTitle1:'Punya ide?',contactTitle2:'Mari wujudkan.',emailLabel:'Email:',emailButton:'Kirim pesan ↗',
      footerTagline:'Built for visual work.',addWorkButton:'+ Tambah Karya',ticker1:'Design ✦',ticker2:'Photography ✦',ticker3:'Event Production ✦',ticker4:'Branding ✦',ticker5:'Visual Experience ✦'
    };

    const $ = s => document.querySelector(s);
    const $$ = s => [...document.querySelectorAll(s)];
    const worksGrid = $('#worksGrid');
    const modal = $('#projectModal');
    const siteEditor = $('#siteEditorModal');
    const form = $('#projectForm');
    const dropzone = $('#dropzone');
    const imageInput = $('#projectImage');
    const preview = $('#imagePreview');
    const previewImg = $('#previewImg');
    let selectedImage = '';
    let editingProjectId = null;

    function loadProjects(){try{const d=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(d)?d:defaultProjects}catch{return defaultProjects}}
    function saveProjects(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}
    function loadSite(){try{return {...defaultSite,...JSON.parse(localStorage.getItem(SITE_KEY)||'{}')}}catch{return {...defaultSite}}}
    function saveSite(data){localStorage.setItem(SITE_KEY,JSON.stringify(data))}
    function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
    function escapeAttr(v){return escapeHtml(v).replace(/`/g,'&#96;')}

    function renderSite(){
      const site=loadSite();
      $$('[data-txt]').forEach(el=>{const key=el.dataset.txt;if(site[key]!==undefined) el.innerHTML=site[key]});
      $('#emailText').textContent=site.email||'oval.satriya@example.com';
      const email=(site.email||'oval.satriya@example.com').trim(); const subject=encodeURIComponent('Pesan dari Portfolio Oval Satriya Handanu'); const body=encodeURIComponent('Halo Oval Satriya Handanu,\n\nSaya melihat portfolio Anda dan ingin berdiskusi mengenai sebuah proyek.\n\nNama saya: \nKeperluan: \nPesan: \n\nTerima kasih.'); const gmailCompose='https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(email)+'&su='+subject+'&body='+body; const chooser='https://accounts.google.com/AccountChooser?service=mail&continue='+encodeURIComponent(gmailCompose); $('#emailBtn').href=chooser; $('#emailBtn').target='_blank'; $('#emailBtn').rel='noopener noreferrer';
      $('#editEmail').value=site.email||'oval.satriya@example.com';
      $('#footerName').textContent=site.profileName||'Oval Satriya Handanu';
      $('#editBrand').value=(localStorage.getItem('oval_portfolio_brand_v2')||'OVAL / SATRIYA');
      $('#editNavWork').value=(localStorage.getItem('oval_nav_work_v2')||'Karya');
      $('#editNavAbout').value=(localStorage.getItem('oval_nav_about_v2')||'Tentang');
      $('#editNavContact').value=(localStorage.getItem('oval_nav_contact_v2')||'Kontak');
      document.querySelector('.brand').innerHTML=escapeHtml(localStorage.getItem('oval_portfolio_brand_v2')||'OVAL / SATRIYA').replace(' / ',' <span>/</span> ');
      const navs=document.querySelectorAll('nav a'); if(navs[0])navs[0].textContent=localStorage.getItem('oval_nav_work_v2')||'Karya';if(navs[1])navs[1].textContent=localStorage.getItem('oval_nav_about_v2')||'Tentang';if(navs[2])navs[2].textContent=localStorage.getItem('oval_nav_contact_v2')||'Kontak';
      const pairs=[['ticker1','ticker1b'],['ticker2','ticker2b'],['ticker3','ticker3b'],['ticker4','ticker4b'],['ticker5','ticker5b']];
      pairs.forEach(([a,b])=>{const first=document.querySelector(`[data-txt="${a}"]`);const second=document.querySelector(`[data-txt="${b}"]`);if(first)first.innerHTML=site[a]+' <b>✦</b>';if(second)second.innerHTML=site[a]+' <b>✦</b>'});
      applyImage('#heroImageBox','#heroImage',localStorage.getItem(HERO_KEY));
    }

    function applyImage(boxSel,imgSel,src){const box=$(boxSel),img=$(imgSel);if(!box||!img)return;if(src){img.src=src;box.classList.add('show')}else{img.removeAttribute('src');box.classList.remove('show')}}

    function renderProjects(){
      const projects=loadProjects();worksGrid.innerHTML='';
      if(!projects.length){worksGrid.innerHTML='<div class="empty-work" style="grid-column:1/-1;min-height:300px;border-radius:28px;border:1px solid var(--line)"><strong>Belum ada project</strong><span>Klik tombol + Tambah Karya untuk menambahkan.</span></div>';return}
      projects.forEach((p,i)=>{
        const card=document.createElement('article');
        const ratioValue=p.ratio||p.originalRatio||'cover';
        let ratioClass='r-auto';
        const num=String(ratioValue).split(':');
        const ratioNum=num.length===2?(parseFloat(num[0])/parseFloat(num[1])):0;
        if(ratioValue==='16:9' || ratioNum>=1.45) ratioClass='r-landscape';
        else if(ratioValue==='9:16' || ratioNum<=0.68) ratioClass='r-reel';
        else if(ratioValue==='4:5' || ratioNum<0.92) ratioClass='r-portrait';
        else if(ratioValue==='1:1' || Math.abs(ratioNum-1)<0.08) ratioClass='r-square';
        else if(ratioNum>1.9) ratioClass='r-wide';
        card.className=`work-card ${ratioClass}`;
        const hasImage=!!p.image;
        card.innerHTML=`<div class="cover" ${hasImage?`style="background-image:url('${escapeAttr(p.image)}')"`:''}></div>${!hasImage?'<div class="empty-work" style="position:absolute;inset:0;z-index:1"><strong>Tambah gambar untuk project ini</strong><span>Gunakan tombol Edit.</span></div>':''}<div class="card-actions admin-only"><button class="card-action edit" type="button">Edit</button><button class="card-action danger delete" type="button">Hapus</button></div><div class="work-info"><div class="work-meta">${escapeHtml(p.category||'Project')}</div><h3>${escapeHtml(p.title||'Untitled')}</h3><p>${escapeHtml(p.description||'')}</p></div>`;
        /* Always keep the uploaded/original ratio. No fixed min-height and no nth-child sizing. */
        if(p.ratio && p.ratio !== 'cover') card.style.aspectRatio=String(p.ratio).replace(':',' / ');
        card.querySelector('.edit').addEventListener('click',e=>{e.stopPropagation();openModal(p)});
        card.querySelector('.delete').addEventListener('click',e=>{e.stopPropagation();if(confirm(`Hapus project “${p.title}”?`)){saveProjects(loadProjects().filter(x=>x.id!==p.id));renderProjects();toast('Project dihapus.')}});
        card.addEventListener('click',()=>showProjectDetail(p));worksGrid.appendChild(card);card.style.animationDelay=`${i*80}ms`;
      });
    }
    function showProjectDetail(p){const msg=`${p.title}\n${p.category}\n\n${p.description||'Tidak ada deskripsi.'}`;if(confirm(msg+'\n\nBuka mode edit project?'))openModal(p)}

    let selectedRatio='auto';
    let detectedRatio='';
    function detectRatio(w,h){
      const r=w/h;
      const known=[['1:1',1],['4:5',4/5],['9:16',9/16],['16:9',16/9]];
      let best=known[0],diff=Math.abs(r-known[0][1]);
      for(const item of known){const d=Math.abs(r-item[1]);if(d<diff){best=item;diff=d}}
      if(diff < 0.035) return best[0];
      const gcd=(a,b)=>b?gcd(b,a%b):a;
      const g=gcd(Math.round(w),Math.round(h));
      return `${Math.round(w/g)}:${Math.round(h/g)}`;
    }
    function setRatioUI(ratio,hasImage=false){
      selectedRatio=ratio||'auto';
      $('#projectRatio').value=['auto','9:16','4:5','16:9','1:1'].includes(selectedRatio)?selectedRatio:'auto';
      $('#projectRatioNote').textContent=hasImage && detectedRatio ? `Rasio foto asli: ${detectedRatio}. ${selectedRatio==='auto'?'Tampilan mengikuti rasio asli.':'Tampilan memakai '+selectedRatio+'.'}` : 'Upload foto untuk mendeteksi rasio asli secara otomatis.';
    }
    function openModal(project=null){
      editingProjectId=project?.id??null;modal.classList.add('open');syncScrollLock();
      $('#modalTitle').textContent=project?'Edit project':'Tambah project';
      $('#projectTitle').value=project?.title||'';$('#projectCategory').value=project?.category||'Graphic Design';$('#projectDescription').value=project?.description||'';
      selectedImage=project?.image||''; detectedRatio=project?.originalRatio||project?.ratio||''; setRatioUI(project?.ratio||'auto',!!selectedImage);
      if(selectedImage){previewImg.src=selectedImage;preview.classList.add('show')}else{preview.classList.remove('show');previewImg.removeAttribute('src')}
      setTimeout(()=>$('#projectTitle').focus(),50)
    }
    function closeModal(){modal.classList.remove('open');syncScrollLock();form.reset();selectedImage='';detectedRatio='';selectedRatio='auto';editingProjectId=null;preview.classList.remove('show');previewImg.removeAttribute('src');$('#projectRatioNote').textContent='Upload foto untuk mendeteksi rasio asli secara otomatis.';$('#modalTitle').textContent='Tambah project'}

    function compressImage(file,maxSide=1600,quality=.82){return new Promise((resolve,reject)=>{if(!file||!file.type.startsWith('image/'))return reject(new Error('bad'));const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,maxSide/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);resolve({src:c.toDataURL('image/jpeg',quality),width:img.width,height:img.height,ratio:detectRatio(img.width,img.height)})};img.onerror=reject;img.src=fr.result};fr.onerror=reject;fr.readAsDataURL(file)})}
    async function handleFile(file){try{const result=await compressImage(file);selectedImage=result.src;detectedRatio=result.ratio;setRatioUI(selectedRatio,true);previewImg.src=selectedImage;preview.classList.add('show')}catch{toast('File harus berupa gambar yang valid.')}}
    $('#projectRatio').addEventListener('change',()=>{selectedRatio=$('#projectRatio').value;setRatioUI(selectedRatio,!!selectedImage)});

    form.addEventListener('submit',e=>{e.preventDefault();if(!isAdmin()){openAdminLogin();return;}const title=$('#projectTitle').value.trim();if(!title)return;const projects=loadProjects();const chosenRatio=selectedRatio==='auto'?(detectedRatio||'cover'):selectedRatio;const payload={id:editingProjectId||Date.now(),title,category:$('#projectCategory').value,description:$('#projectDescription').value.trim(),image:selectedImage,ratio:chosenRatio,originalRatio:detectedRatio||chosenRatio};if(editingProjectId){const idx=projects.findIndex(x=>x.id===editingProjectId);if(idx>-1)projects[idx]=payload}else projects.unshift(payload);saveProjects(projects);renderProjects();closeModal();toast(editingProjectId?'Project berhasil diperbarui.':'Project berhasil ditambahkan.');document.querySelector('#work').scrollIntoView({behavior:'smooth'})});
    [$('#navAdd'),$('#floatingAdd')].forEach(b=>b.addEventListener('click',()=>{if(!isAdmin()){openAdminLogin();return;}openModal();}));
    $('#closeModal').addEventListener('click',closeModal);$('#cancelModal').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(modal.classList.contains('open'))closeModal();if(siteEditor.classList.contains('open'))closeSiteEditor();if(adminLoginModal.classList.contains('open'))closeAdminLogin()}});
    dropzone.addEventListener('click',()=>imageInput.click());imageInput.addEventListener('change',()=>handleFile(imageInput.files[0]));['dragenter','dragover'].forEach(type=>dropzone.addEventListener(type,e=>{e.preventDefault();dropzone.classList.add('drag')}));['dragleave','drop'].forEach(type=>dropzone.addEventListener(type,e=>{e.preventDefault();dropzone.classList.remove('drag')}));dropzone.addEventListener('drop',e=>handleFile(e.dataTransfer.files[0]));

    const profileInput=$('#profileImage');$('#changeProfileBtn').addEventListener('click',()=>{if(!isAdmin()){openAdminLogin();return;}profileInput.click();});profileInput.addEventListener('change',async()=>{const file=profileInput.files[0];if(!file)return;try{localStorage.setItem(PROFILE_KEY,await compressImage(file,1000,.84));renderProfile();toast('Foto profil diperbarui.')}catch{toast('Gagal membaca gambar.')}});
    function renderProfile(){const src=localStorage.getItem(PROFILE_KEY);const box=$('#avatarBox');box.innerHTML=src?`<img src="${escapeAttr(src)}" alt="Foto profil">`:'YOUR<br>PHOTO'}


    document.addEventListener('click', e=>{
      if(isAdmin()) return;
      const restricted=e.target.closest('.admin-only');
      if(restricted){
        e.preventDefault(); e.stopPropagation(); openAdminLogin(); return;
      }
      const editorOnly=e.target.closest('#siteEditorModal,#projectModal,#heroImageBtn,#changeProfileBtn,.card-action,#floatingAdd,#navAdd');
      if(editorOnly){ e.preventDefault(); e.stopPropagation(); }
    }, true);

    adminAccessBtn.addEventListener('click',()=>{ if(isAdmin()){ openSiteEditor(); } else { openAdminLogin(); } });
    document.getElementById('closeAdminLogin').addEventListener('click',closeAdminLogin);
    document.getElementById('cancelAdminLogin').addEventListener('click',closeAdminLogin);
    adminLoginModal.addEventListener('click',e=>{if(e.target===adminLoginModal)closeAdminLogin()});
    adminLoginForm.addEventListener('submit',e=>{
      e.preventDefault();
      if(adminPasswordInput.value===ADMIN_PASSWORD){
        sessionStorage.setItem(ADMIN_SESSION_KEY,'1'); setAdminMode(true); closeAdminLogin(); toast('Login admin berhasil. Semua fitur edit terbuka.'); openSiteEditor();
      }else{ adminLoginError.textContent='Password salah. Silakan coba lagi.'; adminPasswordInput.select(); }
    });

    // Site editor
    function openSiteEditor(){if(!isAdmin()){openAdminLogin();return;}const site=loadSite();$$('[data-edit]').forEach(el=>{el.value=site[el.dataset.edit]??''});$('#editEmail').value=site.email||'oval.satriya@example.com';$('#editBrand').value=localStorage.getItem('oval_portfolio_brand_v2')||'OVAL / SATRIYA';$('#editNavWork').value=localStorage.getItem('oval_nav_work_v2')||'Karya';$('#editNavAbout').value=localStorage.getItem('oval_nav_about_v2')||'Tentang';$('#editNavContact').value=localStorage.getItem('oval_nav_contact_v2')||'Kontak';siteEditor.classList.add('open');syncScrollLock()}
    function closeSiteEditor(){siteEditor.classList.remove('open');syncScrollLock()}
    $('#editSiteBtn').addEventListener('click',()=>requireAdmin(openSiteEditor));$('#closeSiteEditor').addEventListener('click',closeSiteEditor);siteEditor.addEventListener('click',e=>{if(e.target===siteEditor)closeSiteEditor()});
    $$('.editor-tab').forEach(tab=>tab.addEventListener('click',()=>{$$('.editor-tab').forEach(t=>t.classList.remove('active'));$$('.editor-pane').forEach(p=>p.classList.remove('active'));tab.classList.add('active');$('#'+tab.dataset.pane).classList.add('active')}));
    $('#saveSiteText').addEventListener('click',()=>{if(!isAdmin())return;const site=loadSite();$$('[data-edit]').forEach(el=>site[el.dataset.edit]=el.value);site.email=$('#editEmail').value.trim();saveSite(site);localStorage.setItem('oval_portfolio_brand_v2',$('#editBrand').value.trim()||'OVAL / SATRIYA');localStorage.setItem('oval_nav_work_v2',$('#editNavWork').value.trim()||'Karya');localStorage.setItem('oval_nav_about_v2',$('#editNavAbout').value.trim()||'Tentang');localStorage.setItem('oval_nav_contact_v2',$('#editNavContact').value.trim()||'Kontak');renderSite();closeSiteEditor();toast('Semua teks berhasil diperbarui.')});
    $('#logoutAdmin').addEventListener('click',logoutAdmin);
    $('#resetSiteText').addEventListener('click',()=>{if(!confirm('Reset semua teks website ke versi awal?'))return;saveSite({...defaultSite,email:'oval.satriya@example.com'});localStorage.removeItem('oval_portfolio_brand_v2');localStorage.removeItem('oval_nav_work_v2');localStorage.removeItem('oval_nav_about_v2');localStorage.removeItem('oval_nav_contact_v2');renderSite();openSiteEditor();toast('Teks dikembalikan ke default.')});

    // Hero image manager
    const heroInput=document.createElement('input');heroInput.type='file';heroInput.accept='image/*';heroInput.hidden=true;document.body.appendChild(heroInput);
    $('#heroImageBtn').addEventListener('click',()=>{if(!isAdmin()){openAdminLogin();return;}heroInput.click();});heroInput.addEventListener('change',async()=>{const f=heroInput.files[0];if(!f)return;try{localStorage.setItem(HERO_KEY,await compressImage(f,1400,.8));renderSite();toast('Gambar hero diperbarui.')}catch{toast('Gambar gagal diunggah.')}});

    function toast(text){const t=$('#toast');t.textContent=text;t.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
    const dot=$('#cursorDot'),ring=$('#cursorRing');let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`});function cursorLoop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(cursorLoop)}cursorLoop();
    function bindHover(){document.querySelectorAll('a,button,.work-card,.dropzone').forEach(el=>{el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-hover'));el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-hover'))})}bindHover();
    document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.08;const y=(e.clientY-r.top-r.height/2)*.08;el.style.transform=`translate(${x}px,${y}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});

    // Backward compatibility: migrate v1 project storage if present.
    if(!localStorage.getItem(STORAGE_KEY)&&localStorage.getItem('oval_portfolio_projects_v1')){try{localStorage.setItem(STORAGE_KEY,localStorage.getItem('oval_portfolio_projects_v1'))}catch{}}
    setAdminMode(isAdmin());
    syncScrollLock();
    renderSite();renderProjects();renderProfile();$('#year').textContent=new Date().getFullYear();
  
    // Backup/restore: keeps a portable copy of all editable text, projects and images.
    function collectBackup(){
      const keys=['oval_portfolio_projects_v2','oval_site_text_v2','oval_portfolio_brand_v2','oval_nav_work_v2','oval_nav_about_v2','oval_nav_contact_v2','oval_hero_image_v2','oval_profile_image_v2'];
      const data={version:2,createdAt:new Date().toISOString(),storage:{}};
      keys.forEach(k=>{const v=localStorage.getItem(k); if(v!==null) data.storage[k]=v});
      return data;
    }
    const exportBtn=document.getElementById('exportBackup');
    const importBtn=document.getElementById('importBackupBtn');
    const importInput=document.getElementById('importBackup');
    if(exportBtn){exportBtn.addEventListener('click',()=>{
      const blob=new Blob([JSON.stringify(collectBackup())],{type:'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='oval-satriya-portfolio-backup.json'; a.click(); URL.revokeObjectURL(a.href);
      if(typeof toast==='function') toast('Backup berhasil dibuat. Simpan file JSON ini agar data aman.');
    });}
    if(importBtn && importInput){importBtn.addEventListener('click',()=>importInput.click()); importInput.addEventListener('change',()=>{
      const f=importInput.files[0]; if(!f) return; const r=new FileReader();
      r.onload=()=>{try{const data=JSON.parse(r.result); if(!data.storage) throw new Error('invalid'); Object.entries(data.storage).forEach(([k,v])=>localStorage.setItem(k,v)); location.reload();}catch(e){alert('File backup tidak valid.')}};
      r.readAsText(f);
    });}
