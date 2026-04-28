import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';

const EMPTY_CONTRIBUTION = { project: '', role: '', year: '', impact: '' };

const FACULTIES = [
  'Faculty of Agriculture',
  'Faculty of Business',
  'Faculty of Education',
  'Faculty of Engineering',
  'Faculty of Health Sciences',
  'Faculty of Law',
  'Faculty of Science & Technology',
  'Faculty of Social Sciences',
  'Other',
];

function Field({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy)', letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label} {required && <span style={{ color: 'var(--red)' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.73rem', color: 'var(--slate-light)', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.88rem', color: 'var(--navy)',
  background: 'white', transition: 'border-color 0.15s',
  outline: 'none',
};

export default function MemberForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', role: '', department: '', faculty: '',
    photo: '', email: '', phone: '',
    status: 'active', joinDate: '', expiryDate: '',
    presidentRemark: '',
    contributions: [{ ...EMPTY_CONTRIBUTION }],
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.getMember(id)
      .then(m => {
        const toDateInput = (d) =>
          d ? new Date(d).toISOString().slice(0, 10) : '';
        setForm({
          name: m.name || '',
          role: m.role || '',
          department: m.department || '',
          faculty: m.faculty || '',
          photo: m.photo || '',
          email: m.email || '',
          phone: m.phone || '',
          status: m.status || 'active',
          joinDate: toDateInput(m.joinDate),
          expiryDate: toDateInput(m.expiryDate),
          presidentRemark: m.presidentRemark || '',
          contributions: m.contributions?.length ? m.contributions : [{ ...EMPTY_CONTRIBUTION }],
        });
        setPhotoPreview(m.photo || '');
        setLoading(false);
      })
      .catch(err => { alert('Failed to load member: ' + err.message); navigate('/admin/members'); });
  }, [id, isEdit, navigate]);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const setContrib = (i, field, val) => {
    const c = [...form.contributions];
    c[i] = { ...c[i], [field]: val };
    setForm(f => ({ ...f, contributions: c }));
  };

  const addContrib = () => setForm(f => ({ ...f, contributions: [...f.contributions, { ...EMPTY_CONTRIBUTION }] }));
  const removeContrib = (i) => setForm(f => ({ ...f, contributions: f.contributions.filter((_, idx) => idx !== i) }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.role.trim()) e.role = 'Role is required';
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.faculty.trim()) e.faculty = 'Faculty is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.joinDate) e.joinDate = 'Join date is required';
    if (!form.expiryDate) e.expiryDate = 'Expiry date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await api.updateMember(id, form);
      } else {
        await api.createMember(form);
      }
      navigate('/admin/members');
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border-light)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ padding: '36px 40px', maxWidth: 860 }} className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link to="/admin/members" style={{ fontSize: '0.82rem', color: 'var(--slate)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          ← Back to Members
        </Link>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy)' }}>
          {isEdit ? 'Edit Member' : 'Add New Member'}
        </h1>
        <p style={{ color: 'var(--slate)', fontSize: '0.9rem', marginTop: 4 }}>
          {isEdit ? 'Update member information and contributions' : 'Fill in the details to register a new Enactus UTAS member'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>

          {/* Section: Basic Info */}
          <div style={{ gridColumn: '1 / -1', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 16, marginTop: 8 }}>
              Personal Information
            </h2>
          </div>

          <Field label="Full Name" required>
            <input value={form.name} onChange={e => set('name', e.target.value)} style={{ ...inputStyle, borderColor: errors.name ? 'var(--red)' : 'var(--border-light)' }} placeholder="e.g. Aisha Mohammed Salifu" />
            {errors.name && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.name}</p>}
          </Field>

          <Field label="Role / Position" required>
            <input value={form.role} onChange={e => set('role', e.target.value)} style={{ ...inputStyle, borderColor: errors.role ? 'var(--red)' : 'var(--border-light)' }} placeholder="e.g. President" />
            {errors.role && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.role}</p>}
          </Field>

          <Field label="Department" required>
            <input value={form.department} onChange={e => set('department', e.target.value)} style={{ ...inputStyle, borderColor: errors.department ? 'var(--red)' : 'var(--border-light)' }} placeholder="e.g. Business Administration" />
            {errors.department && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.department}</p>}
          </Field>

          <Field label="Faculty" required>
            <select
              value={form.faculty}
              onChange={e => set('faculty', e.target.value)}
              style={{ ...inputStyle, borderColor: errors.faculty ? 'var(--red)' : 'var(--border-light)' }}
            >
              <option value="">Select faculty...</option>
              {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            {errors.faculty && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.faculty}</p>}
          </Field>

          <Field label="Email Address" required>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={{ ...inputStyle, borderColor: errors.email ? 'var(--red)' : 'var(--border-light)' }} placeholder="name@utas.edu.gh" />
            {errors.email && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.email}</p>}
          </Field>

          <Field label="Phone Number" required>
            <input
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              style={{ ...inputStyle, borderColor: errors.phone ? 'var(--red)' : 'var(--border-light)' }}
              placeholder="+233 24 000 0000"
            />
            {errors.phone && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.phone}</p>}
          </Field>

          {/* Photo */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Photo URL (Imgur or any direct image link)" hint="Paste a direct image URL e.g. https://i.imgur.com/xxxxx.jpeg">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <input
                  value={form.photo}
                  onChange={e => { set('photo', e.target.value); setPhotoPreview(e.target.value); }}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="https://i.imgur.com/..."
                />
                {photoPreview && (
                  <img src={photoPreview} alt="Preview"
                    onError={e => { e.target.style.display = 'none'; }}
                    style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border-light)', flexShrink: 0 }} />
                )}
              </div>
            </Field>
          </div>

          {/* Status & Dates */}
          <div style={{ gridColumn: '1 / -1', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border-light)', marginTop: 8 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 0 }}>
              Membership Details
            </h2>
          </div>

          <Field label="Membership Status">
            <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>

          <div /> {/* spacer */}

          <Field label="Join Date" required>
            <input type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} style={{ ...inputStyle, borderColor: errors.joinDate ? 'var(--red)' : 'var(--border-light)' }} />
            {errors.joinDate && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.joinDate}</p>}
          </Field>

          <Field label="Membership Expiry Date" required>
            <input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} style={{ ...inputStyle, borderColor: errors.expiryDate ? 'var(--red)' : 'var(--border-light)' }} />
            {errors.expiryDate && <p style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: 3 }}>{errors.expiryDate}</p>}
          </Field>

          {/* President Remark */}
          <div style={{ gridColumn: '1 / -1', marginTop: 8, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
              President's Remark
            </h2>
            <Field label="Overall Remark by the President" hint="This will appear publicly on the member's verification page">
              <textarea
                value={form.presidentRemark}
                onChange={e => set('presidentRemark', e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="Write a personal note about this member's contributions and character..."
              />
            </Field>
          </div>

          {/* Contributions */}
          <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>
                Projects & Contributions
              </h2>
              <button type="button" onClick={addContrib} style={{
                padding: '7px 14px', background: 'var(--navy)', color: 'white',
                border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600,
              }}>
                + Add Project
              </button>
            </div>

            {form.contributions.map((c, i) => (
              <div key={i} style={{
                padding: '20px', background: 'var(--off-white)',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)',
                marginBottom: 12, position: 'relative',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Project {i + 1}
                  </span>
                  {form.contributions.length > 1 && (
                    <button type="button" onClick={() => removeContrib(i)} style={{
                      background: '#fee2e2', color: 'var(--red)', border: 'none',
                      borderRadius: 6, padding: '3px 9px', fontSize: '0.75rem', fontWeight: 600,
                    }}>
                      Remove
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0 16px' }}>
                  <Field label="Project Name">
                    <input value={c.project} onChange={e => setContrib(i, 'project', e.target.value)} style={inputStyle} placeholder="AgriTech Market Linkage" />
                  </Field>
                  <Field label="Your Role">
                    <input value={c.role} onChange={e => setContrib(i, 'role', e.target.value)} style={inputStyle} placeholder="Team Lead" />
                  </Field>
                  <Field label="Year">
                    <input value={c.year} onChange={e => setContrib(i, 'year', e.target.value)} style={inputStyle} placeholder="2024" maxLength={4} />
                  </Field>
                </div>
                <Field label="Impact Summary">
                  <input value={c.impact} onChange={e => setContrib(i, 'impact', e.target.value)} style={inputStyle} placeholder="e.g. Connected 120 smallholder farmers to urban markets" />
                </Field>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-light)' }}>
          <button type="submit" disabled={saving} style={{
            padding: '13px 32px',
            background: saving ? 'var(--slate)' : 'var(--navy)',
            color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Syne, sans-serif',
            boxShadow: 'var(--shadow-md)', transition: 'transform 0.15s',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {saving && <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
            {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Member')}
          </button>
          <Link to="/admin/members" style={{
            padding: '13px 24px', background: 'white', color: 'var(--slate)',
            border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)',
            fontWeight: 500, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center',
          }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
