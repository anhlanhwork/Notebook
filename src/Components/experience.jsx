import { useState, useRef, useEffect } from 'react';
import { showConfirm } from './dialog.jsx';
import { CInput, CTextarea } from './ui/CInput.jsx';

const STORAGE_KEY = 'exp_v2';

const EXP_STATUS = {
  published: { label: 'Đã đăng', icon: 'ti-circle-check', color: '#5BAA50', bg: 'rgba(91,170,80,0.12)',    border: 'rgba(91,170,80,0.4)'   },
  scheduled: { label: 'Hẹn giờ', icon: 'ti-clock',        color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.4)'  },
  draft:     { label: 'Nháp',    icon: 'ti-pencil',        color: '#9CA3AF', bg: 'rgba(156,163,175,0.10)', border: 'rgba(156,163,175,0.3)' },
};

const EXP_CATS = {
  lesson:       { label: 'Bài học',        icon: 'ti-bulb',           color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  casestudy:    { label: 'Case study',     icon: 'ti-clipboard-text',  color: '#378ADD', bg: 'rgba(55,138,221,0.12)'  },
  tip:          { label: 'Mẹo',           icon: 'ti-wand',            color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  bestpractice: { label: 'Best practice',  icon: 'ti-star',            color: '#5BAA50', bg: 'rgba(91,170,80,0.12)'   },
  pitfall:      { label: 'Tránh mắc phải', icon: 'ti-alert-triangle',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   },
};

const AV_COLORS = ['#5BAA50','#378ADD','#E11D48','#7C3AED','#F59E0B','#0D9488','#EC4899','#F97316'];
function avatarColor(str) {
  let h = 0;
  for (let i = 0; i < (str||'').length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}
function initials(name) {
  return (name||'?').trim().split(/\s+/).map(w => w[0]).slice(-2).join('').toUpperCase() || '?';
}
function makeSlug(title) {
  return title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/đ/g,'d').replace(/[^a-z0-9\s]/g,'').trim().replace(/\s+/g,'-').slice(0,60);
}
function fmtNum(n) { return (n||0).toLocaleString('vi-VN'); }
function today()   { return new Date().toISOString().slice(0,10); }

function makeExp() {
  return {
    id: 'exp_' + Math.random().toString(36).slice(2,9),
    title: '', category: 'lesson', status: 'draft',
    description: '', content: '', tags: [],
    author: '', projectRef: '', slug: '',
    views: 0, likes: 0, comments: 0,
    scheduledAt: null, publishedAt: null,
    createdAt: today(), updatedAt: today(),
  };
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

/* ── Main screen ── */
export function ExperienceScreen() {
  const [items, setItems]               = useState(load);
  const [editId, setEditId]             = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [catFilter, setCatFilter]       = useState('all');
  const [query, setQuery]               = useState('');
  const [view, setView]                 = useState('grid');

  function save(next) { setItems(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  function addNew()   { const e = makeExp(); save([e, ...items]); setEditId(e.id); }
  function upsert(u)  { save(items.map(i => i.id === u.id ? u : i)); }
  async function del(id) {
    if (!await showConfirm('Xóa bài viết này?')) return;
    save(items.filter(i => i.id !== id));
    if (editId === id) setEditId(null);
  }
  function publish(id) {
    save(items.map(i => i.id === id ? { ...i, status: 'published', publishedAt: today(), updatedAt: today() } : i));
  }

  const published  = items.filter(i => i.status === 'published').length;
  const scheduled  = items.filter(i => i.status === 'scheduled').length;
  const draft      = items.filter(i => i.status === 'draft').length;
  const totalViews = items.reduce((s,i) => s + (i.views||0), 0);

  const catCounts = Object.fromEntries(
    Object.keys(EXP_CATS).map(k => [k, items.filter(i => i.category === k).length])
  );

  const filtered = items.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (catFilter !== 'all' && i.category !== catFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return i.title.toLowerCase().includes(q) ||
             i.description.toLowerCase().includes(q) ||
             i.tags.some(t => t.toLowerCase().includes(q)) ||
             (i.author||'').toLowerCase().includes(q);
    }
    return true;
  });

  if (editId) {
    const item = items.find(i => i.id === editId);
    if (!item) { setEditId(null); return null; }
    return <ExperienceEditor item={item} onUpdate={upsert} onBack={() => setEditId(null)} onDelete={() => del(editId).then(() => setEditId(null))}/>;
  }

  return (
    <div className="exp-screen">

      {/* Hero */}
      <div className="exp-hero-wrap">
        <div className="exp-hero2">
          <div className="clt-eyebrow">TRI THỨC RÚT RA · CÓ THỂ PUBLISH</div>
          <h1 className="exp-hero2-title">Kinh nghiệm dự án</h1>
          <p className="exp-hero2-sub">
            Bài học, case study, mẹo, best practice — đúc kết từ team.
            Có thể xuất bản lên <span className="exp-hero2-link">knowledge.notebook.vn</span> để chia sẻ rộng rãi.
          </p>
          <div className="exp-hero2-stats">
            <span><b>{published}</b> đã đăng</span>
            <span className="exp-hero2-dot">·</span>
            <span><b>{scheduled}</b> hẹn giờ</span>
            <span className="exp-hero2-dot">·</span>
            <span><b>{draft}</b> nháp</span>
            <span className="exp-hero2-dot">·</span>
            <span><b>{totalViews.toLocaleString('vi-VN')}</b> lượt xem tổng</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="exp-filter-bar">
        <div className="exp-filter-left">
          <div className="exp-fbar-search">
            <i className="ti ti-search"/>
            <CInput placeholder="Tìm theo tiêu đề, mô tả, tag..." value={query} onChange={e => setQuery(e.target.value)}/>
          </div>
          <div className="exp-status-tabs">
            {[
              { key: 'all',       label: 'Tất cả',  icon: null,              count: items.length },
              { key: 'published', label: 'Đã đăng', icon: 'ti-circle-check', count: published    },
              { key: 'scheduled', label: 'Hẹn giờ', icon: 'ti-clock',        count: scheduled    },
              { key: 'draft',     label: 'Nháp',    icon: 'ti-pencil',       count: draft        },
            ].map(({ key, label, icon, count }) => (
              <button key={key} className={'exp-status-tab' + (statusFilter === key ? ' active' : '')} onClick={() => setStatusFilter(key)}>
                {icon && <i className={'ti ' + icon}/>}
                {label} <span className="exp-tab-cnt">{count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="exp-filter-right">
          <div className="exp-view-toggle">
            <button className={'exp-view-btn' + (view === 'grid' ? ' active' : '')} onClick={() => setView('grid')} title="Lưới"><i className="ti ti-layout-grid"/></button>
            <button className={'exp-view-btn' + (view === 'list' ? ' active' : '')} onClick={() => setView('list')} title="Danh sách"><i className="ti ti-menu-2"/></button>
          </div>
          <button className="btn-primary" onClick={addNew}><i className="ti ti-plus"/> Viết bài mới</button>
        </div>
      </div>

      {/* Category chips */}
      <div className="exp-cat-chips">
        <button className={'exp-cat-chip' + (catFilter === 'all' ? ' active' : '')} onClick={() => setCatFilter('all')}>
          <i className="ti ti-layout-grid"/> Tất cả <span className="exp-cat-cnt">{items.length}</span>
        </button>
        {Object.entries(EXP_CATS).map(([k, v]) => (
          <button key={k}
            className={'exp-cat-chip' + (catFilter === k ? ' active' : '')}
            style={catFilter === k ? { color: v.color, borderColor: v.color + '88', background: v.bg } : {}}
            onClick={() => setCatFilter(k)}>
            <i className={'ti ' + v.icon}/> {v.label} <span className="exp-cat-cnt">{catCounts[k]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="exp-content-area">
        {filtered.length === 0 ? (
          <div className="exp-empty">
            <i className="ti ti-file-off"/>
            <p>{query || statusFilter !== 'all' || catFilter !== 'all'
              ? 'Không tìm thấy kết quả phù hợp.'
              : 'Chưa có bài viết nào. Nhấn "Viết bài mới" để bắt đầu.'}</p>
          </div>
        ) : view === 'grid' ? (
          <div className="exp-grid">
            {filtered.map(item => (
              <ExperienceCard key={item.id} item={item}
                onOpen={() => setEditId(item.id)}
                onPublish={e => { e.stopPropagation(); publish(item.id); }}
                onDelete={e => { e.stopPropagation(); del(item.id); }}/>
            ))}
          </div>
        ) : (
          <div className="exp-list2">
            {filtered.map(item => (
              <ExperienceListRow key={item.id} item={item}
                onOpen={() => setEditId(item.id)}
                onPublish={e => { e.stopPropagation(); publish(item.id); }}
                onDelete={e => { e.stopPropagation(); del(item.id); }}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Grid card ── */
function ExperienceCard({ item, onOpen, onPublish, onDelete }) {
  const cat = EXP_CATS[item.category]  || EXP_CATS.lesson;
  const st  = EXP_STATUS[item.status] || EXP_STATUS.draft;

  return (
    <div className="exp-card" onClick={onOpen}>
      <div className="exp-card-head">
        <span className="exp-card-cat-badge" style={{ color: cat.color, background: cat.bg }}>
          <i className={'ti ' + cat.icon}/> {cat.label}
        </span>
        <span className="exp-card-st-badge" style={{ color: st.color, background: st.bg, borderColor: st.border }}>
          <i className={'ti ' + st.icon}/> {st.label}
        </span>
      </div>

      <h3 className="exp-card-title">
        {item.title || <span className="exp-card-placeholder">Chưa có tiêu đề</span>}
      </h3>
      {item.description && <p className="exp-card-desc">{item.description}</p>}

      {item.tags.length > 0 && (
        <div className="exp-card-tags">
          {item.tags.slice(0,4).map(t => <span key={t} className="exp-card-tag">{t}</span>)}
        </div>
      )}

      {item.status === 'published' && (
        <div className="exp-card-stats">
          <span><i className="ti ti-eye"/> {fmtNum(item.views)}</span>
          <span><i className="ti ti-heart"/> {fmtNum(item.likes)}</span>
          <span><i className="ti ti-message-circle"/> {fmtNum(item.comments)}</span>
          {item.slug && <span className="exp-card-slug">/ {item.slug} <i className="ti ti-arrow-right"/></span>}
        </div>
      )}
      {item.status === 'scheduled' && item.scheduledAt && (
        <div className="exp-card-scheduled">
          <i className="ti ti-clock"/> Lên lịch đăng: {item.scheduledAt.replace('T',' ')}
        </div>
      )}
      {item.status === 'draft' && (
        <div className="exp-card-draft-row" onClick={e => e.stopPropagation()}>
          <span className="exp-card-unpub">Chưa publish</span>
          <button className="exp-card-pub-btn" onClick={onPublish}>Publish ngay</button>
        </div>
      )}

      <div className="exp-card-footer">
        {item.author ? (
          <div className="exp-card-author">
            <span className="exp-card-av" style={{ background: avatarColor(item.author) }}>
              {initials(item.author)}
            </span>
            <span className="exp-card-author-name">{item.author}</span>
          </div>
        ) : <div/>}
        <span className="exp-card-date">{item.updatedAt}</span>
      </div>

      <button className="exp-card-del-btn" onClick={onDelete} title="Xóa">
        <i className="ti ti-trash"/>
      </button>
    </div>
  );
}

/* ── List row ── */
function ExperienceListRow({ item, onOpen, onPublish, onDelete }) {
  const cat = EXP_CATS[item.category]  || EXP_CATS.lesson;
  const st  = EXP_STATUS[item.status] || EXP_STATUS.draft;

  return (
    <div className="exp-lrow" onClick={onOpen}>
      <span className="exp-lrow-cat-dot" style={{ background: cat.color }} title={cat.label}/>
      <div className="exp-lrow-main">
        <div className="exp-lrow-title">{item.title || <em style={{ color: 'var(--text3)' }}>Chưa có tiêu đề</em>}</div>
        {item.description && <div className="exp-lrow-desc">{item.description}</div>}
      </div>
      {item.tags.length > 0 && (
        <div className="exp-lrow-tags">
          {item.tags.slice(0,2).map(t => <span key={t} className="exp-card-tag">{t}</span>)}
        </div>
      )}
      <span className="exp-card-st-badge" style={{ color: st.color, background: st.bg, borderColor: st.border }}>
        <i className={'ti ' + st.icon}/> {st.label}
      </span>
      {item.status === 'published' && (
        <div className="exp-lrow-stats">
          <span><i className="ti ti-eye"/> {fmtNum(item.views)}</span>
          <span><i className="ti ti-heart"/> {fmtNum(item.likes)}</span>
        </div>
      )}
      {item.author && (
        <div className="exp-lrow-author">
          <span className="exp-card-av" style={{ background: avatarColor(item.author), width:22, height:22, fontSize:9 }}>
            {initials(item.author)}
          </span>
          <span className="exp-lrow-author-name">{item.author}</span>
        </div>
      )}
      <span className="exp-lrow-date">{item.updatedAt}</span>
      <div className="exp-lrow-actions" onClick={e => e.stopPropagation()}>
        {item.status === 'draft' && (
          <button className="exp-lrow-pub-btn" onClick={onPublish}>Publish</button>
        )}
        <button className="exp-lrow-del" onClick={onDelete}><i className="ti ti-trash"/></button>
      </div>
    </div>
  );
}

/* ── Editor ── */
function ExperienceEditor({ item, onUpdate, onBack, onDelete }) {
  const edRef = useRef(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (edRef.current) edRef.current.innerHTML = item.content || '';
  }, [item.id]); // eslint-disable-line

  function field(k, v) {
    const u = { ...item, [k]: v, updatedAt: today() };
    if (k === 'title' && !item.slug) u.slug = makeSlug(v);
    onUpdate(u);
  }
  function execCmd(cmd, val = null) { document.execCommand(cmd, false, val); edRef.current?.focus(); }
  function addTag(e) {
    if (e.key !== 'Enter') return;
    const t = tagInput.trim();
    if (!t || item.tags.includes(t)) return;
    field('tags', [...item.tags, t]);
    setTagInput('');
  }

  const cat = EXP_CATS[item.category]  || EXP_CATS.lesson;
  const st  = EXP_STATUS[item.status] || EXP_STATUS.draft;

  return (
    <div className="exp-editor-screen">

      {/* Topbar */}
      <div className="exp-editor-topbar">
        <button className="exp-editor-back" onClick={onBack}>
          <i className="ti ti-arrow-left"/> Kinh nghiệm
        </button>
        <div className="exp-editor-topbar-right">
          <span className="exp-card-cat-badge" style={{ color: cat.color, background: cat.bg }}>
            <i className={'ti ' + cat.icon}/> {cat.label}
          </span>
          <span className="exp-card-st-badge" style={{ color: st.color, background: st.bg, borderColor: st.border }}>
            <i className={'ti ' + st.icon}/> {st.label}
          </span>
          <button className="exp-editor-del" onClick={onDelete} title="Xóa bài">
            <i className="ti ti-trash"/>
          </button>
          {item.status !== 'published' && (
            <button className="btn-primary" onClick={() => field('status', 'published')}>
              <i className="ti ti-send"/> Publish
            </button>
          )}
        </div>
      </div>

      <div className="exp-editor-body">

        {/* Meta sidebar */}
        <div className="exp-editor-meta">
          <div className="exp-emeta-section">
            <div className="exp-emeta-lbl">Loại bài</div>
            <select className="exp-emeta-sel" value={item.category} style={{ color: cat.color }}
              onChange={e => field('category', e.target.value)}>
              {Object.entries(EXP_CATS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="exp-emeta-section">
            <div className="exp-emeta-lbl">Trạng thái</div>
            <select className="exp-emeta-sel" value={item.status} style={{ color: st.color }}
              onChange={e => field('status', e.target.value)}>
              {Object.entries(EXP_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          {item.status === 'scheduled' && (
            <div className="exp-emeta-section">
              <div className="exp-emeta-lbl">Lên lịch đăng</div>
              <input type="datetime-local" className="exp-emeta-input"
                value={item.scheduledAt || ''} onChange={e => field('scheduledAt', e.target.value)}/>
            </div>
          )}
          <div className="exp-emeta-section">
            <div className="exp-emeta-lbl">Tác giả</div>
            <CInput className="exp-emeta-input" value={item.author} placeholder="Tên tác giả..."
              onChange={e => field('author', e.target.value)}/>
          </div>
          <div className="exp-emeta-section">
            <div className="exp-emeta-lbl">Dự án liên quan</div>
            <CInput className="exp-emeta-input" value={item.projectRef} placeholder="Tên dự án..."
              onChange={e => field('projectRef', e.target.value)}/>
          </div>
          <div className="exp-emeta-section">
            <div className="exp-emeta-lbl">Slug / URL</div>
            <CInput className="exp-emeta-input exp-emeta-slug" value={item.slug} placeholder="slug-url..."
              onChange={e => field('slug', e.target.value)}/>
          </div>
          <div className="exp-emeta-section">
            <div className="exp-emeta-lbl">Tags</div>
            <div className="exp-emeta-tags">
              {item.tags.map(t => (
                <span key={t} className="exp-tag">
                  {t}<button className="exp-tag-rm" onClick={() => field('tags', item.tags.filter(x => x !== t))}>×</button>
                </span>
              ))}
              <CInput className="exp-tag-input" placeholder="Thêm tag, Enter"
                value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}/>
            </div>
          </div>
          <div className="exp-emeta-section">
            <div className="exp-emeta-lbl">Lượt xem · Like · Bình luận</div>
            <div className="exp-emeta-stats-row">
              {[['views','👁'],['likes','❤'],['comments','💬']].map(([k,icon]) => (
                <input key={k} type="number" className="exp-emeta-input exp-emeta-stat" title={k}
                  value={item[k]||0} onChange={e => field(k, Math.max(0,+e.target.value))}
                  placeholder="0"/>
              ))}
            </div>
          </div>
          <div className="exp-emeta-section">
            <div className="exp-emeta-lbl">Ngày tạo</div>
            <div className="exp-emeta-date">{item.createdAt}</div>
          </div>
        </div>

        {/* Main editor */}
        <div className="exp-editor-main">
          <CInput className="exp-editor-title-inp" value={item.title}
            placeholder="Tiêu đề bài viết..."
            onChange={e => field('title', e.target.value)}/>

          <CTextarea className="exp-editor-desc-inp" value={item.description}
            placeholder="Mô tả ngắn hiển thị trên card..."
            onChange={e => field('description', e.target.value)}
            rows={2}/>

          <div className="exp-toolbar">
            <button className="exp-tb-btn" onMouseDown={e=>{e.preventDefault();execCmd('bold');}}><b>B</b></button>
            <button className="exp-tb-btn" onMouseDown={e=>{e.preventDefault();execCmd('italic');}}><em>I</em></button>
            <button className="exp-tb-btn" onMouseDown={e=>{e.preventDefault();execCmd('underline');}}><u>U</u></button>
            <button className="exp-tb-btn" onMouseDown={e=>{e.preventDefault();execCmd('strikeThrough');}}><s>S</s></button>
            <span className="exp-tb-sep"/>
            <button className="exp-tb-btn" onMouseDown={e=>{e.preventDefault();execCmd('insertOrderedList');}}><i className="ti ti-list-numbers"/></button>
            <button className="exp-tb-btn" onMouseDown={e=>{e.preventDefault();execCmd('insertUnorderedList');}}><i className="ti ti-list"/></button>
            <button className="exp-tb-btn" onMouseDown={e=>{e.preventDefault();execCmd('indent');}}><i className="ti ti-indent-increase"/></button>
            <span className="exp-tb-sep"/>
            <button className="exp-tb-btn" onMouseDown={e=>{e.preventDefault();execCmd('formatBlock','blockquote');}}><i className="ti ti-quote"/></button>
            <button className="exp-tb-btn" onMouseDown={e=>{e.preventDefault();execCmd('formatBlock','pre');}}><i className="ti ti-code"/></button>
          </div>

          <div key={item.id} ref={edRef}
            className="exp-editor-content" contentEditable suppressContentEditableWarning
            onInput={() => field('content', edRef.current.innerHTML)}
            data-placeholder="Nội dung bài viết..."/>
        </div>
      </div>
    </div>
  );
}
