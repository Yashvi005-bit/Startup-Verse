function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  const listSpaceViews = ['listspace','provider','govspace'];
  document.querySelectorAll('nav.links button').forEach(b=>{
    const isListSpace = b.dataset.view==='listspace' && listSpaceViews.includes(name);
    b.classList.toggle('active', b.dataset.view===name || isListSpace);
  });
  window.scrollTo({top:0,behavior:'instant'});
  if(name==='dashboard'){ refreshPlatformStats(); }
  if(name==='govspace'){ loadGovSpaces(); }
}

function showDashTab(name){
  document.querySelectorAll('.dash-tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.dash-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('dash-tab-'+name).classList.add('active');
  document.getElementById('dash-panel-'+name).classList.add('active');
}

const AMENITY_LIST = ["WiFi","Power Backup","AC","Parking","Meeting Rooms","Cafeteria","24/7 Access","Security","Printing & Scanning","Reception Services"];
const SPACE_TYPES = ["Private Cabin / Office","Dedicated Desk","Hot Desk / Co-working","Meeting Room","Full Floor / Managed Office","Virtual Office"];
const LEASE_TYPES = ["Daily","Monthly","Quarterly","Yearly","Flexible / On-demand"];

function propertyFormHTML(prefix){
  const amenityChecks = AMENITY_LIST.map(a=>`<label class="check"><input type="checkbox" value="${a}"> ${a}</label>`).join('');
  const spaceOpts = SPACE_TYPES.map(s=>`<option>${s}</option>`).join('');
  const leaseOpts = LEASE_TYPES.map(s=>`<option>${s}</option>`).join('');
  return `
    <div class="form-section-title">Your details</div>
    <div class="field-row">
      <div class="field"><label>Your name *</label><input id="${prefix}-providerName" required></div>
      <div class="field"><label>Business / company name <span class="hint">(optional)</span></label><input id="${prefix}-businessName"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Email *</label><input type="email" id="${prefix}-email" required></div>
      <div class="field"><label>Phone *</label><input type="tel" id="${prefix}-phone" required></div>
    </div>

    <div class="form-section-title">Property details</div>
    <div class="field-row">
      <div class="field"><label>Property / listing name *</label><input id="${prefix}-title" placeholder="e.g. Sunrise Business Hub, Sector 44" required></div>
      <div class="field"><label>City *</label>
        <select id="${prefix}-city" required>
          <option value="">Select city</option>
          <option>Delhi NCR</option><option>Gurugram</option><option>Noida</option>
          <option>Bengaluru</option><option>Mumbai</option><option>Hyderabad</option>
          <option>Pune</option><option>Chennai</option><option>Other</option>
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field full"><label>Full address *</label><input id="${prefix}-address" required></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Space type *</label><select id="${prefix}-spaceType" required><option value="">Select type</option>${spaceOpts}</select></div>
      <div class="field"><label>Lease type *</label><select id="${prefix}-leaseType" required><option value="">Select lease type</option>${leaseOpts}</select></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Total area (sq. ft.) *</label><input type="number" min="1" id="${prefix}-totalArea" required></div>
      <div class="field"><label>Seating capacity *</label><input type="number" min="1" id="${prefix}-seatingCapacity" required></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Price (per seat / month) *</label><input type="number" min="0" id="${prefix}-price" required></div>
      <div class="field"><label>Currency</label><select id="${prefix}-currency"><option value="INR">₹ INR</option><option value="USD">$ USD</option></select></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Available from *</label><input type="date" id="${prefix}-availableFrom" required></div>
      <div class="field"></div>
    </div>

    <div class="form-section-title">Amenities</div>
    <div class="checks" id="${prefix}-amenities">${amenityChecks}</div>

    <div class="form-section-title">Photos</div>
    <div class="field-row">
      <div class="field full">
        <div class="photo-drop" onclick="document.getElementById('${prefix}-photos').click()">
          <div>📷 Click to upload photos</div>
          <p>You can select multiple images. Keep files small; these are stored with your listing.</p>
        </div>
        <input type="file" id="${prefix}-photos" accept="image/*" multiple style="display:none" onchange="handlePhotos('${prefix}')">
        <div class="photo-preview" id="${prefix}-preview"></div>
      </div>
    </div>

    <div class="form-section-title">Description</div>
    <div class="field-row">
      <div class="field full"><label>Tell startup teams about this space <span class="hint">(optional)</span></label><textarea id="${prefix}-description" placeholder="Natural light, walk to metro, ideal for teams of 5-15..."></textarea></div>
    </div>
  `;
}

function companyFormHTML(prefix){
  const amenityChecks = AMENITY_LIST.map(a=>`<label class="check"><input type="checkbox" value="${a}"> ${a}</label>`).join('');
  return `
    <div class="form-section-title">Company details</div>
    <div class="field-row">
      <div class="field"><label>Company name *</label><input id="${prefix}-companyName" required></div>
      <div class="field"><label>Contact person *</label><input id="${prefix}-contactPerson" required></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Email *</label><input type="email" id="${prefix}-email" required></div>
      <div class="field"><label>Phone *</label><input type="tel" id="${prefix}-phone" required></div>
    </div>

    <div class="form-section-title">Location / branch</div>
    <div class="field-row">
      <div class="field full"><label>Branch / franchise label <span class="hint">(optional, e.g. "Mumbai Franchise", "Delhi HQ")</span></label><input id="${prefix}-branchLabel" placeholder="Helps you tell locations apart if you need space in more than one state"></div>
    </div>

    <div class="form-section-title">Team &amp; space requirement</div>
    <div class="field-row">
      <div class="field"><label>Team size (seats needed) *</label><input type="number" min="1" id="${prefix}-teamSize" required></div>
      <div class="field"><label>Preferred city / state *</label>
        <select id="${prefix}-city" required>
          <option value="">Select city</option>
          <option>Delhi NCR</option><option>Gurugram</option><option>Noida</option>
          <option>Bengaluru</option><option>Mumbai</option><option>Hyderabad</option>
          <option>Pune</option><option>Chennai</option><option>Other</option>
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field full"><label>Preferred locations / landmarks <span class="hint">(optional)</span></label><input id="${prefix}-locations" placeholder="e.g. near metro, Cyber City, Koramangala..."></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Budget: min (per seat / month) *</label><input type="number" min="0" id="${prefix}-budgetMin" required></div>
      <div class="field"><label>Budget: max (per seat / month) *</label><input type="number" min="0" id="${prefix}-budgetMax" required></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Currency</label>
        <select id="${prefix}-currency"><option value="INR">₹ INR</option><option value="USD">$ USD</option></select>
      </div>
      <div class="field"><label>Desired move-in date *</label><input type="date" id="${prefix}-moveIn" required></div>
    </div>
    <div class="field-row">
      <div class="field full"><label>Lease duration preference *</label>
        <select id="${prefix}-leaseDuration" required>
          <option value="">Select duration</option>
          <option>Short-term (under 3 months)</option>
          <option>3–6 months</option>
          <option>6–12 months</option>
          <option>12+ months / Long-term</option>
          <option>Flexible / month-to-month</option>
        </select>
      </div>
    </div>

    <div class="form-section-title">Required amenities</div>
    <div class="checks" id="${prefix}-amenities">${amenityChecks}</div>

    <div class="form-section-title">Anything else?</div>
    <div class="field-row">
      <div class="field full"><label>Additional requirements <span class="hint">(optional)</span></label><textarea id="${prefix}-notes" placeholder="Anything specific: accessibility, pet-friendly, dedicated server room, etc."></textarea></div>
    </div>
  `;
}

function govFormHTML(prefix){
  const amenityChecks = AMENITY_LIST.map(a=>`<label class="check"><input type="checkbox" value="${a}"> ${a}</label>`).join('');
  return `
    <div class="form-section-title">Department details</div>
    <div class="field-row">
      <div class="field"><label>Department / government body *</label><input id="${prefix}-deptName" placeholder="e.g. Directorate of Industries" required></div>
      <div class="field"><label>Contact person *</label><input id="${prefix}-providerName" required></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Official email *</label><input type="email" id="${prefix}-email" required></div>
      <div class="field"><label>Phone *</label><input type="tel" id="${prefix}-phone" required></div>
    </div>
    <div class="field-row">
      <div class="field full"><label>Authorization / order reference <span class="hint">(optional)</span></label><input id="${prefix}-authRef" placeholder="Office order / resolution number authorizing this listing"></div>
    </div>

    <div class="form-section-title">Building details</div>
    <div class="field-row">
      <div class="field"><label>Building / floor name *</label><input id="${prefix}-title" placeholder="e.g. Old Collectorate Annexe, 2nd Floor" required></div>
      <div class="field"><label>City / state *</label>
        <select id="${prefix}-city" required>
          <option value="">Select city</option>
          <option>Delhi NCR</option><option>Gurugram</option><option>Noida</option>
          <option>Bengaluru</option><option>Mumbai</option><option>Hyderabad</option>
          <option>Pune</option><option>Chennai</option><option>Other</option>
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field full"><label>Full address *</label><input id="${prefix}-address" required></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Total area (sq. ft.) *</label><input type="number" min="1" id="${prefix}-totalArea" required></div>
      <div class="field"><label>Seating capacity *</label><input type="number" min="1" id="${prefix}-seatingCapacity" required></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Available from *</label><input type="date" id="${prefix}-availableFrom" required></div>
      <div class="field"><label>Usage terms <span class="hint">(optional)</span></label><input id="${prefix}-terms" placeholder="e.g. Free for DPIIT-recognized startups, MoU required"></div>
    </div>

    <div class="form-section-title">Amenities</div>
    <div class="checks" id="${prefix}-amenities">${amenityChecks}</div>

    <div class="form-section-title">Photos</div>
    <div class="field-row">
      <div class="field full">
        <div class="photo-drop" onclick="document.getElementById('${prefix}-photos').click()">
          <div>📷 Click to upload photos</div>
          <p>You can select multiple images. Keep files small; these are stored with your listing.</p>
        </div>
        <input type="file" id="${prefix}-photos" accept="image/*" multiple style="display:none" onchange="handlePhotos('${prefix}')">
        <div class="photo-preview" id="${prefix}-preview"></div>
      </div>
    </div>

    <div class="form-section-title">Description</div>
    <div class="field-row">
      <div class="field full"><label>Tell companies about this space <span class="hint">(optional)</span></label><textarea id="${prefix}-description" placeholder="Eligibility, how to apply, floor plan notes, etc."></textarea></div>
    </div>
  `;
}

const photoStore = { p: [], d: [], g: [] };
const MAX_PHOTO_DIM = 1280;
const PHOTO_QUALITY = 0.72;

function compressImage(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = e=>{
      const img = new Image();
      img.onload = ()=>{
        let { width, height } = img;
        if(width > MAX_PHOTO_DIM || height > MAX_PHOTO_DIM){
          const scale = MAX_PHOTO_DIM / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', PHOTO_QUALITY));
      };
      img.onerror = () => reject(new Error('Could not read image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

async function handlePhotos(prefix){
  const input = document.getElementById(prefix+'-photos');
  const preview = document.getElementById(prefix+'-preview');
  const files = Array.from(input.files).slice(0,6);
  photoStore[prefix] = [];
  preview.innerHTML = '';
  for(const file of files){
    try{
      const dataUrl = await compressImage(file);
      photoStore[prefix].push(dataUrl);
      const img = document.createElement('img');
      img.src = dataUrl;
      preview.appendChild(img);
    }catch(e){ console.error('Skipped a photo that could not be processed', e); }
  }
}

function readPropertyForm(prefix){
  const val = id => document.getElementById(prefix+'-'+id).value.trim();
  const amenities = Array.from(document.querySelectorAll('#'+prefix+'-amenities input:checked')).map(c=>c.value);
  return {
    providerName: val('providerName'), businessName: val('businessName'),
    email: val('email'), phone: val('phone'),
    title: val('title'), city: val('city'), address: val('address'),
    spaceType: val('spaceType'), leaseType: val('leaseType'),
    totalArea: val('totalArea'), seatingCapacity: val('seatingCapacity'),
    price: val('price'), currency: val('currency'),
    availableFrom: val('availableFrom'), amenities,
    photos: photoStore[prefix] || [], description: val('description'),
    createdAt: new Date().toISOString()
  };
}

function validatePropertyForm(prefix){
  const requiredIds = ['providerName','email','phone','title','city','address','spaceType','leaseType','totalArea','seatingCapacity','price','availableFrom'];
  for(const id of requiredIds){
    const el = document.getElementById(prefix+'-'+id);
    if(!el.value || !el.value.trim()) { el.focus(); return false; }
  }
  return true;
}

function clearPropertyForm(prefix){
  ['providerName','businessName','email','phone','title','address','totalArea','seatingCapacity','price','availableFrom','description'].forEach(id=>{
    const el = document.getElementById(prefix+'-'+id); if(el) el.value='';
  });
  ['city','spaceType','leaseType','currency'].forEach(id=>{ const el=document.getElementById(prefix+'-'+id); if(el) el.selectedIndex=0; });
  document.querySelectorAll('#'+prefix+'-amenities input').forEach(c=>c.checked=false);
  photoStore[prefix]=[];
  const pv = document.getElementById(prefix+'-preview'); if(pv) pv.innerHTML='';
}

/* ============ Company form read/validate/clear (reused by Find Space form + Company Dashboard) ============ */
function readCompanyForm(prefix){
  const val = id => document.getElementById(prefix+'-'+id).value.trim();
  const amenities = Array.from(document.querySelectorAll('#'+prefix+'-amenities input:checked')).map(c=>c.value);
  return {
    companyName: val('companyName'), contactPerson: val('contactPerson'),
    email: val('email'), phone: val('phone'),
    branchLabel: val('branchLabel'),
    teamSize: val('teamSize'), city: val('city'), locations: val('locations'),
    budgetMin: val('budgetMin'), budgetMax: val('budgetMax'), currency: document.getElementById(prefix+'-currency').value,
    moveIn: val('moveIn'), leaseDuration: val('leaseDuration'),
    amenities, notes: val('notes'),
    createdAt: new Date().toISOString()
  };
}
function validateCompanyForm(prefix){
  const requiredIds = ['companyName','contactPerson','email','phone','teamSize','city','budgetMin','budgetMax','moveIn','leaseDuration'];
  for(const id of requiredIds){
    const el = document.getElementById(prefix+'-'+id);
    if(!el.value || !el.value.trim()){ el.focus(); return false; }
  }
  return true;
}
function clearCompanyForm(prefix){
  ['companyName','contactPerson','email','phone','branchLabel','teamSize','locations','budgetMin','budgetMax','moveIn','notes'].forEach(id=>{
    const el = document.getElementById(prefix+'-'+id); if(el) el.value='';
  });
  ['city','currency','leaseDuration'].forEach(id=>{ const el=document.getElementById(prefix+'-'+id); if(el) el.selectedIndex=0; });
  document.querySelectorAll('#'+prefix+'-amenities input').forEach(c=>c.checked=false);
}

/* ============ Government space form read/validate/clear ============ */
function readGovForm(prefix){
  const val = id => document.getElementById(prefix+'-'+id).value.trim();
  const amenities = Array.from(document.querySelectorAll('#'+prefix+'-amenities input:checked')).map(c=>c.value);
  return {
    deptName: val('deptName'), providerName: val('providerName'),
    email: val('email'), phone: val('phone'), authRef: val('authRef'),
    title: val('title'), city: val('city'), address: val('address'),
    totalArea: val('totalArea'), seatingCapacity: val('seatingCapacity'),
    availableFrom: val('availableFrom'), terms: val('terms'),
    amenities, photos: photoStore[prefix] || [], description: val('description'),
    createdAt: new Date().toISOString()
  };
}
function validateGovForm(prefix){
  const requiredIds = ['deptName','providerName','email','phone','title','city','address','totalArea','seatingCapacity','availableFrom'];
  for(const id of requiredIds){
    const el = document.getElementById(prefix+'-'+id);
    if(!el.value || !el.value.trim()){ el.focus(); return false; }
  }
  return true;
}
function clearGovForm(prefix){
  ['deptName','providerName','email','phone','authRef','title','address','totalArea','seatingCapacity','availableFrom','terms','description'].forEach(id=>{
    const el = document.getElementById(prefix+'-'+id); if(el) el.value='';
  });
  const cityEl = document.getElementById(prefix+'-city'); if(cityEl) cityEl.selectedIndex=0;
  document.querySelectorAll('#'+prefix+'-amenities input').forEach(c=>c.checked=false);
  photoStore[prefix]=[];
  const pv = document.getElementById(prefix+'-preview'); if(pv) pv.innerHTML='';
}

/* ============ Storage helpers ============
   Front-end only for now: data lives in memory for this browser tab/session
   and resets on page reload. Swap these six functions for real API calls
   (fetch to your backend) once the backend is ready — the rest of the app
   only talks to these functions, so nothing else needs to change. */
const _memStore = { property: {}, company: {}, govspace: {} };

function _memSave(bucket, prefix, data, existingId){
  const id = existingId || (prefix+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,8));
  _memStore[bucket][id] = data;
  return id;
}
function _memDelete(bucket, id){
  delete _memStore[bucket][id];
}
function _memList(bucket){
  return Object.entries(_memStore[bucket]).map(([id, data]) => ({ id, ...data }));
}

async function saveProperty(data, existingId){
  return _memSave('property', 'p', data, existingId);
}
async function deleteProperty(id){
  _memDelete('property', id);
}
async function listProperties(){
  return _memList('property');
}
async function saveCompany(data, existingId){
  return _memSave('company', 'c', data, existingId);
}
async function deleteCompany(id){
  _memDelete('company', id);
}
async function listCompanies(){
  return _memList('company');
}
async function saveGovSpace(data, existingId){
  return _memSave('govspace', 'g', data, existingId);
}
async function deleteGovSpace(id){
  _memDelete('govspace', id);
}
async function listGovSpaces(){
  return _memList('govspace');
}

/* ============ Provider (List Your Space) form ============ */
let lastProviderEmail = '';
let lastCompanyEmail = '';

function goToDashboard(kind){
  showView('dashboard');
  showDashTab(kind);
  if(kind==='provider' && lastProviderEmail){
    document.getElementById('dash-email').value = lastProviderEmail;
    loadDashboard();
  } else if(kind==='company' && lastCompanyEmail){
    document.getElementById('cdash-email').value = lastCompanyEmail;
    loadCompanyDashboard();
  }
}

async function submitProvider(){
  const msg = document.getElementById('provider-msg');
  if(!validatePropertyForm('p')){ msg.textContent='Please fill all required fields.'; msg.className='form-msg err'; return; }
  msg.textContent='Saving...'; msg.className='form-msg';
  const data = readPropertyForm('p');
  const id = await saveProperty(data);
  if(id){
    msg.textContent='';
    document.getElementById('provider-success-text').textContent =
      `"${data.title}" in ${data.city} is now live. Manage it any time from your dashboard using ${data.email}.`;
    document.getElementById('provider-success').classList.add('show');
    lastProviderEmail = data.email;
    clearPropertyForm('p');
    refreshHeroStats();
  } else {
    msg.textContent='Something went wrong saving your listing. Please try again.'; msg.className='form-msg err';
  }
}

/* ============ Company (Find Space) form ============ */
async function submitCompany(){
  const msg = document.getElementById('company-msg');
  if(!validateCompanyForm('c')){ msg.textContent='Please fill all required fields.'; msg.className='form-msg err'; return; }
  msg.textContent='Saving...'; msg.className='form-msg';
  const data = readCompanyForm('c');
  const id = await saveCompany(data);
  if(id){
    msg.textContent='';
    document.getElementById('company-success-text').textContent =
      `Thanks, ${data.contactPerson}. We've logged your requirement for ${data.teamSize} seats in ${data.city}${data.branchLabel ? ' ('+data.branchLabel+')' : ''} and will match you with available spaces. Need space in another state too? Add it any time from your Company Dashboard.`;
    document.getElementById('company-success').classList.add('show');
    lastCompanyEmail = data.email;
    clearCompanyForm('c');
    renderCompanyBand();
  } else {
    msg.textContent='Something went wrong. Please try again.'; msg.className='form-msg err';
  }
}

/* ============ Government space form ============ */
async function submitGovSpace(){
  const msg = document.getElementById('govspace-msg');
  if(!validateGovForm('g')){ msg.textContent='Please fill all required fields.'; msg.className='form-msg err'; return; }
  msg.textContent='Saving...'; msg.className='form-msg';
  const data = readGovForm('g');
  const id = await saveGovSpace(data);
  if(id){
    msg.textContent='';
    document.getElementById('govspace-success-text').textContent =
      `"${data.title}" in ${data.city} is now listed. Companies can browse it below and reach out via ${data.email}.`;
    document.getElementById('govspace-success').classList.add('show');
    clearGovForm('g');
    loadGovSpaces();
    refreshPlatformStats();
  } else {
    msg.textContent='Something went wrong saving your listing. Please try again.'; msg.className='form-msg err';
  }
}

/* ============ Dashboard ============ */
let editingId = null;

function toggleAddPanel(){
  editingId = null;
  document.getElementById('add-panel-title').textContent = 'Add a new property';
  clearPropertyForm('d');
  document.getElementById('add-panel').classList.toggle('show');
}
function cancelAddPanel(){
  document.getElementById('add-panel').classList.remove('show');
  editingId = null;
}

async function submitDashProperty(){
  const msg = document.getElementById('dash-msg');
  const emailInput = document.getElementById('dash-email').value.trim();
  if(!validatePropertyForm('d')){ msg.textContent='Please fill all required fields.'; msg.className='form-msg err'; return; }
  msg.textContent='Saving...'; msg.className='form-msg';
  const data = readPropertyForm('d');
  if(!editingId && emailInput && data.email.toLowerCase() !== emailInput.toLowerCase()){
    // fine, still save under whatever email was entered in the form
  }
  const id = await saveProperty(data, editingId);
  if(id){
    msg.textContent='Saved.'; msg.className='form-msg ok';
    document.getElementById('dash-email').value = data.email;
    cancelAddPanel();
    loadDashboard();
    refreshHeroStats();
  } else {
    msg.textContent='Something went wrong. Please try again.'; msg.className='form-msg err';
  }
}

function editProperty(prop){
  editingId = prop.id;
  document.getElementById('add-panel-title').textContent = 'Edit property';
  document.getElementById('add-panel').classList.add('show');
  const set = (id,v)=>{ const el=document.getElementById('d-'+id); if(el) el.value = v || ''; };
  set('providerName',prop.providerName); set('businessName',prop.businessName);
  set('email',prop.email); set('phone',prop.phone);
  set('title',prop.title); set('city',prop.city); set('address',prop.address);
  set('spaceType',prop.spaceType); set('leaseType',prop.leaseType);
  set('totalArea',prop.totalArea); set('seatingCapacity',prop.seatingCapacity);
  set('price',prop.price); set('currency',prop.currency||'INR');
  set('availableFrom',prop.availableFrom); set('description',prop.description);
  document.querySelectorAll('#d-amenities input').forEach(c=>{ c.checked = (prop.amenities||[]).includes(c.value); });
  photoStore.d = prop.photos || [];
  const pv = document.getElementById('d-preview'); if(pv) pv.innerHTML='';
  (prop.photos||[]).forEach(src=>{ const img=document.createElement('img'); img.src=src; if(pv) pv.appendChild(img); });
  document.getElementById('add-panel').scrollIntoView({behavior:'smooth'});
}

async function removeProperty(id){
  if(!confirm('Remove this property listing?')) return;
  await deleteProperty(id);
  loadDashboard();
  refreshHeroStats();
}

function propCardHTML(p){
  const photo = (p.photos && p.photos[0]) ? `style="background-image:url('${p.photos[0]}')"` : '';
  const photoInner = (p.photos && p.photos[0]) ? '' : (p.title ? p.title.slice(0,2).toUpperCase() : '-');
  const amenities = (p.amenities||[]).slice(0,4).map(a=>`<span class="tag">${a}</span>`).join('');
  return `
    <div class="prop-card">
      <div class="prop-photo" ${photo}>${photoInner}</div>
      <div class="prop-body">
        <h4>${p.title||'Untitled space'}</h4>
        <div class="loc">${p.city||''} · ${p.spaceType||''} · ${p.seatingCapacity||'?'} seats</div>
        <div class="tag-row">${amenities}</div>
        <div class="price-row">
          <b>${p.currency==='USD'?'$':'₹'}${p.price||'-'}/seat/mo</b>
          <span style="font-size:12px;color:var(--muted);">${p.leaseType||''}</span>
        </div>
        <div class="prop-actions">
          <button class="btn btn-outline btn-sm" onclick='editProperty(${JSON.stringify(p).replace(/'/g,"&apos;")})'>Edit</button>
          <button class="btn btn-danger btn-sm" onclick="removeProperty('${p.id}')">Remove</button>
        </div>
      </div>
    </div>`;
}

async function loadDashboard(){
  const email = document.getElementById('dash-email').value.trim().toLowerCase();
  const container = document.getElementById('prop-container');
  if(!email){ container.innerHTML = '<div class="empty-state">Enter the email you registered with, then click "Load My Properties."</div>'; return; }
  container.innerHTML = '<div class="empty-state">Loading your properties…</div>';
  const all = await listProperties();
  const mine = all.filter(p => (p.email||'').toLowerCase() === email);
  document.getElementById('stat-my-props').textContent = mine.length;
  document.getElementById('stat-my-seats').textContent = mine.reduce((s,p)=>s+(parseInt(p.seatingCapacity)||0),0);
  if(mine.length===0){
    container.innerHTML = '<div class="empty-state">No properties yet for this email. Click "+ Add New Property" below to list your first one.</div>';
  } else {
    container.innerHTML = `<div class="prop-grid">${mine.map(propCardHTML).join('')}</div>`;
  }
  refreshPlatformStats();
}

async function refreshPlatformStats(){
  const [props, companies, govspaces] = await Promise.all([listProperties(), listCompanies(), listGovSpaces()]);
  document.getElementById('stat-platform-props').textContent = props.length;
  document.getElementById('stat-platform-companies').textContent = companies.length;
  const propsEl2 = document.getElementById('stat-platform-props-2'); if(propsEl2) propsEl2.textContent = props.length;
  const govEl = document.getElementById('stat-platform-govspaces'); if(govEl) govEl.textContent = govspaces.length;
}

async function refreshHeroStats(){
  const props = await listProperties();
  document.getElementById('stat-live-props').textContent = props.length + '+';
}

/* ============ Company Dashboard (multi-branch / multi-state requirements) ============ */
let editingCompanyId = null;

function toggleCompanyAddPanel(){
  editingCompanyId = null;
  document.getElementById('cadd-panel-title').textContent = 'Add a location requirement';
  clearCompanyForm('cd');
  document.getElementById('cadd-panel').classList.toggle('show');
}
function cancelCompanyAddPanel(){
  document.getElementById('cadd-panel').classList.remove('show');
  editingCompanyId = null;
}

async function submitDashCompany(){
  const msg = document.getElementById('cdash-msg');
  const emailInput = document.getElementById('cdash-email').value.trim();
  if(!validateCompanyForm('cd')){ msg.textContent='Please fill all required fields.'; msg.className='form-msg err'; return; }
  msg.textContent='Saving...'; msg.className='form-msg';
  const data = readCompanyForm('cd');
  const id = await saveCompany(data, editingCompanyId);
  if(id){
    msg.textContent='Saved.'; msg.className='form-msg ok';
    document.getElementById('cdash-email').value = data.email;
    cancelCompanyAddPanel();
    loadCompanyDashboard();
    renderCompanyBand();
  } else {
    msg.textContent='Something went wrong. Please try again.'; msg.className='form-msg err';
  }
}

function editCompanyReq(comp){
  editingCompanyId = comp.id;
  document.getElementById('cadd-panel-title').textContent = 'Edit location requirement';
  document.getElementById('cadd-panel').classList.add('show');
  const set = (id,v)=>{ const el=document.getElementById('cd-'+id); if(el) el.value = v || ''; };
  set('companyName',comp.companyName); set('contactPerson',comp.contactPerson);
  set('email',comp.email); set('phone',comp.phone); set('branchLabel',comp.branchLabel);
  set('teamSize',comp.teamSize); set('city',comp.city); set('locations',comp.locations);
  set('budgetMin',comp.budgetMin); set('budgetMax',comp.budgetMax); set('currency',comp.currency||'INR');
  set('moveIn',comp.moveIn); set('leaseDuration',comp.leaseDuration); set('notes',comp.notes);
  document.querySelectorAll('#cd-amenities input').forEach(c=>{ c.checked = (comp.amenities||[]).includes(c.value); });
  document.getElementById('cadd-panel').scrollIntoView({behavior:'smooth'});
}

async function removeCompanyReq(id){
  if(!confirm('Remove this location requirement?')) return;
  await deleteCompany(id);
  loadCompanyDashboard();
  renderCompanyBand();
}

function creqCardHTML(c){
  const amenities = (c.amenities||[]).slice(0,4).map(a=>`<span class="tag">${a}</span>`).join('');
  return `
    <div class="creq-card">
      ${c.branchLabel ? `<span class="branch-tag">${c.branchLabel}</span>` : ''}
      <h4>${c.companyName||'Untitled company'}</h4>
      <div class="loc">${c.city||''} · ${c.teamSize||'?'} seats needed</div>
      <div class="tag-row">${amenities}</div>
      <div class="price-row">
        <b>${c.currency==='USD'?'$':'₹'}${c.budgetMin||'-'}-${c.budgetMax||'-'}/seat/mo</b>
        <span style="font-size:12px;color:var(--muted);">${c.leaseDuration||''}</span>
      </div>
      <div class="prop-actions">
        <button class="btn btn-outline btn-sm" onclick='editCompanyReq(${JSON.stringify(c).replace(/'/g,"&apos;")})'>Edit</button>
        <button class="btn btn-danger btn-sm" onclick="removeCompanyReq('${c.id}')">Remove</button>
      </div>
    </div>`;
}

async function loadCompanyDashboard(){
  const email = document.getElementById('cdash-email').value.trim().toLowerCase();
  const container = document.getElementById('creq-container');
  if(!email){ container.innerHTML = '<div class="empty-state">Enter the email you registered with, then click "Load My Requirements."</div>'; return; }
  container.innerHTML = '<div class="empty-state">Loading your requirements…</div>';
  const all = await listCompanies();
  const mine = all.filter(c => (c.email||'').toLowerCase() === email);
  document.getElementById('stat-my-reqs').textContent = mine.length;
  document.getElementById('stat-my-states').textContent = new Set(mine.map(c=>c.city).filter(Boolean)).size;
  if(mine.length===0){
    container.innerHTML = '<div class="empty-state">No requirements yet for this email. Click "+ Add Location / Franchise Requirement" below: for example, one for your Delhi office and another for a Mumbai franchise.</div>';
  } else {
    container.innerHTML = `<div class="creq-grid">${mine.map(creqCardHTML).join('')}</div>`;
  }
  refreshPlatformStats();
}

/* ============ Government space browsing ============ */
function govCardHTML(g){
  const photo = (g.photos && g.photos[0]) ? `style="background-image:url('${g.photos[0]}')"` : '';
  const photoInner = (g.photos && g.photos[0]) ? '' : (g.title ? g.title.slice(0,2).toUpperCase() : '-');
  const amenities = (g.amenities||[]).slice(0,4).map(a=>`<span class="tag">${a}</span>`).join('');
  return `
    <div class="prop-card">
      <div class="prop-photo" ${photo}>${photoInner}</div>
      <div class="prop-body">
        <span class="tag gov" style="margin-bottom:8px;display:inline-block;">Government</span>
        <h4>${g.title||'Untitled building'}</h4>
        <div class="loc">${g.city||''} · ${g.deptName||''} · ${g.seatingCapacity||'?'} seats</div>
        <div class="tag-row">${amenities}</div>
        <div class="price-row">
          <b>${g.terms ? g.terms : 'Contact department for terms'}</b>
        </div>
        <div style="font-size:12.5px;color:var(--muted);">Apply via ${g.email||''}</div>
      </div>
    </div>`;
}

async function loadGovSpaces(){
  const container = document.getElementById('govspace-container');
  if(!container) return;
  container.innerHTML = '<div class="empty-state">Loading government-listed spaces…</div>';
  const spaces = await listGovSpaces();
  if(spaces.length===0){
    container.innerHTML = '<div class="empty-state">No government spaces listed yet. Be the first department to list one using the form above.</div>';
  } else {
    container.innerHTML = `<div class="prop-grid">${spaces.map(govCardHTML).join('')}</div>`;
  }
}

/* ============ Registered + demo company band ============ */
const DEMO_COMPANIES = ["Nimbus Robotics","Kavya AgriTech","Vertex Fintech","Loop Logistics","BlueQuartz Labs","Sundara Health","Orbit EV","GreenGrid Energy"];

async function renderCompanyBand(){
  const track = document.getElementById('company-band-track');
  if(!track) return;
  let names = [];
  try{
    const companies = await listCompanies();
    names = [...new Set(companies.map(c=>c.companyName).filter(Boolean))];
  }catch(e){ /* fall back to demo only */ }
  const combined = [...names.map(n=>({name:n, demo:false})), ...DEMO_COMPANIES.map(n=>({name:n, demo:true}))];
  const chips = combined.map(c=>`<div class="band-chip${c.demo?' demo':''}"><span class="dot"></span>${c.name}</div>`).join('');
  // duplicate the set once so the CSS marquee (translateX -50%) loops seamlessly
  track.innerHTML = chips + chips;
}

/* ============ Init ============ */
refreshHeroStats();
renderCompanyBand();






