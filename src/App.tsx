import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ALL_UNIQUE_VEHICLE_IMAGE_URLS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  FACEBOOK_CONTACT_URL,
  isVehicleId,
  peso,
  VEHICLE_COLOR_IMAGES,
  VEHICLE_COLOR_OPTIONS,
  VEHICLE_DEFAULT_COLOR,
  VehicleColorKey,
  VehicleId,
  VEHICLES,
} from './data/vehicles';
import { VehicleColorShowcase } from './components/VehicleColorShowcase';
import { VehicleAssistant } from './components/VehicleAssistant';

type SortOption = 'default' | 'priceLow' | 'priceHigh' | 'dpLow' | 'dpHigh';

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidPhone(v: string): boolean {
  return /^[0-9+\-\s()]{7,15}$/.test(v);
}

function getColorName(key: VehicleColorKey): string {
  return VEHICLE_COLOR_OPTIONS.find((c) => c.key === key)?.name ?? 'White';
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOption>('default');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  // Per-model active color across all 11 VinFast vehicles
  const [vehicleColors, setVehicleColors] = useState<
    Record<VehicleId, VehicleColorKey>
  >({ ...VEHICLE_DEFAULT_COLOR });

  // Modals
  const [detailVehicleId, setDetailVehicleId] = useState<string | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Budget calculator
  const [budgetInput, setBudgetInput] = useState('');
  const [maxDpInput, setMaxDpInput] = useState('');
  const [calcSubmitted, setCalcSubmitted] = useState(false);

  // Test Drive form
  const [tdName, setTdName] = useState('');
  const [tdPhone, setTdPhone] = useState('');
  const [tdVehicle, setTdVehicle] = useState('');
  const [tdColor, setTdColor] = useState<VehicleColorKey>('white');
  const [tdDate, setTdDate] = useState('');
  const [tdTime, setTdTime] = useState('');
  const [tdNotes, setTdNotes] = useState('');
  const [tdErrors, setTdErrors] = useState<Record<string, boolean>>({});
  const [tdStatus, setTdStatus] = useState<{
    type: 'ok' | 'warn';
    message: string;
    draft?: string;
  } | null>(null);

  // Inquiry form
  const [iqName, setIqName] = useState('');
  const [iqPhone, setIqPhone] = useState('');
  const [iqEmail, setIqEmail] = useState('');
  const [iqVehicle, setIqVehicle] = useState('');
  const [iqColor, setIqColor] = useState<VehicleColorKey>('white');
  const [iqDp, setIqDp] = useState('');
  const [iqBudget, setIqBudget] = useState('');
  const [iqMsg, setIqMsg] = useState('');
  const [iqConsent, setIqConsent] = useState(false);
  const [iqErrors, setIqErrors] = useState<Record<string, boolean>>({});
  const [iqStatus, setIqStatus] = useState<{
    type: 'ok' | 'warn';
    message: string;
    draft?: string;
  } | null>(null);

  const [copiedBanner, setCopiedBanner] = useState<string | null>(null);

  // Preload all unique model color images on mount so crossfades never flicker
  useEffect(() => {
    ALL_UNIQUE_VEHICLE_IMAGE_URLS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Close modal on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDetailVehicleId(null);
        setCompareModalOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }

  function handleSelectVehicleColor(
    vehicleId: VehicleId,
    color: VehicleColorKey
  ) {
    setVehicleColors((prev) => ({ ...prev, [vehicleId]: color }));
    if (iqVehicle === vehicleId) {
      setIqColor(color);
    }
    if (tdVehicle === vehicleId) {
      setTdColor(color);
    }
  }

  function handleInquireVehicle(id: string) {
    setIqVehicle(id);
    if (isVehicleId(id)) {
      setIqColor(vehicleColors[id]);
    }
    scrollToSection('contact');
  }

  function handleBookTestDrive(id: string) {
    setTdVehicle(id);
    if (isVehicleId(id)) {
      setTdColor(vehicleColors[id]);
    }
    scrollToSection('testdrive');
  }

  function toggleCompare(id: string) {
    setCompareNotice(null);
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleOpenCompare() {
    if (compareIds.length < 2) {
      setCompareNotice(
        'Select at least 2 vehicles (checkbox on each card) to compare.'
      );
      return;
    }
    setCompareNotice(null);
    setCompareModalOpen(true);
  }

  function copyDraftText(text: string) {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedBanner(
        'Message copied to clipboard — paste and send to Jhon Lee Pama on Facebook.'
      );
      window.setTimeout(() => setCopiedBanner(null), 4000);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  }

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = VEHICLES.filter((v) => v.name.toLowerCase().includes(q));
    if (sortOrder === 'priceLow') return [...list].sort((a, b) => a.srp - b.srp);
    if (sortOrder === 'priceHigh') return [...list].sort((a, b) => b.srp - a.srp);
    if (sortOrder === 'dpLow') return [...list].sort((a, b) => a.dp - b.dp);
    if (sortOrder === 'dpHigh') return [...list].sort((a, b) => b.dp - a.dp);
    return list;
  }, [searchQuery, sortOrder]);

  const calcResult = useMemo(() => {
    if (!calcSubmitted) return null;
    const budget = parseFloat(budgetInput);
    const maxDp = parseFloat(maxDpInput);
    if (isNaN(budget) || budget <= 0) {
      return {
        error: 'Please enter a valid monthly budget.',
        matches: [],
      };
    }
    const matches = VEHICLES.filter(
      (v) =>
        v.monthly <= budget && (isNaN(maxDp) || maxDp <= 0 || v.dp <= maxDp)
    );
    return { error: null, matches };
  }, [calcSubmitted, budgetInput, maxDpInput]);

  function handleTestDriveSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = {
      tdName: tdName.trim().length === 0,
      tdPhone: !isValidPhone(tdPhone.trim()),
      tdVehicle: tdVehicle === '',
      tdDate: tdDate === '',
      tdTime: tdTime === '',
    };
    setTdErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setTdStatus({
        type: 'warn',
        message: 'Please fix the highlighted fields above.',
      });
      return;
    }
    const vName = VEHICLES.find((v) => v.id === tdVehicle)?.name || tdVehicle;
    const colorLine = isVehicleId(tdVehicle)
      ? `\nPreferred Color: ${getColorName(tdColor)}`
      : '';
    const draft = `Test Drive Request\nName: ${tdName}\nPhone: ${tdPhone}\nVehicle: ${vName}${colorLine}\nDate: ${tdDate}\nTime: ${tdTime}\nNotes: ${tdNotes}`;
    setTdStatus({
      type: 'ok',
      message:
        'Your test drive request has been prepared — it is NOT yet booked. Click below to send it to Jhon Lee Pama on Facebook so the dealership can confirm your date and time.',
      draft,
    });
  }

  function handleInquirySubmit(e: FormEvent) {
    e.preventDefault();
    const errors = {
      iqName: iqName.trim().length === 0,
      iqPhone: !isValidPhone(iqPhone.trim()),
      iqEmail: !isValidEmail(iqEmail.trim()),
      iqVehicle: iqVehicle === '',
      iqConsent: !iqConsent,
    };
    setIqErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setIqStatus({
        type: 'warn',
        message: 'Please fix the highlighted fields above.',
      });
      return;
    }
    const vName = VEHICLES.find((v) => v.id === iqVehicle)?.name || iqVehicle;
    const colorLine = isVehicleId(iqVehicle)
      ? `\nExterior Color: ${getColorName(iqColor)}`
      : '';
    const draft = `Vehicle Inquiry\nName: ${iqName}\nPhone: ${iqPhone}\nEmail: ${iqEmail}\nVehicle: ${vName}${colorLine}\nPreferred DP: ${
      iqDp || '-'
    }\nMonthly Budget: ${iqBudget || '-'}\nMessage: ${iqMsg}`;
    setIqStatus({
      type: 'warn',
      message:
        'No live backend is connected yet, so this form cannot auto-send to Facebook. Click below to open Facebook — your inquiry details have been copied so you can paste and send them yourself to Jhon Lee Pama.',
      draft,
    });
  }

  const detailVehicle = detailVehicleId
    ? VEHICLES.find((v) => v.id === detailVehicleId) ?? null
    : null;

  const compareVehicles = VEHICLES.filter((v) => compareIds.includes(v.id));

  return (
    <div>
      {/* Header */}
      <header className="vf-header">
        <div className="navbar">
          <div className="brand">🚗 VinFast Pampanga</div>
          <nav className="links">
            <button type="button" onClick={() => scrollToSection('home')}>
              Home
            </button>
            <button type="button" onClick={() => scrollToSection('vehicles')}>
              Our Vehicles
            </button>
            <button type="button" onClick={() => scrollToSection('promo')}>
              Low DP Promo
            </button>
            <button type="button" onClick={() => scrollToSection('about')}>
              About Jhon
            </button>
            <button type="button" onClick={() => scrollToSection('contact')}>
              Contact
            </button>
            <a
              className="fb-nav"
              href={FACEBOOK_CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              📘 Facebook
            </a>
          </nav>
          <button
            type="button"
            className="hamburger"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <button type="button" onClick={() => scrollToSection('home')}>
            Home
          </button>
          <button type="button" onClick={() => scrollToSection('vehicles')}>
            Our Vehicles
          </button>
          <button type="button" onClick={() => scrollToSection('promo')}>
            Low DP Promo
          </button>
          <button type="button" onClick={() => scrollToSection('about')}>
            About Jhon
          </button>
          <button type="button" onClick={() => scrollToSection('contact')}>
            Contact
          </button>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <p className="kicker">VinFast Pampanga · Paylite financing</p>
            <h1>Own an EV for less than your phone plan&apos;s down payment.</h1>
            <p>
              Eleven VinFast models, down payments from ₱54,600, and a sale
              ambassador who answers on Facebook — not a call center.
            </p>
            <div className="hero-ctas">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => scrollToSection('vehicles')}
              >
                Explore Our Vehicles
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => scrollToSection('promo')}
              >
                See Low DP Offers
              </button>
              <a
                className="btn btn-fb"
                href={FACEBOOK_CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                📘 Chat on Facebook
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="spec">
              <b>₱54.6K</b>
              <span>lowest all-in down payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section id="vehicles" className="vf-section wrap">
        <h2 className="sec-title">Our Vehicles</h2>
        <p className="sec-sub">
          Search, sort and compare all 11 VinFast models. Customize every
          VinFast model in White, Green, Grey, or Yellow.
        </p>

        <div className="toolbar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle model..."
            aria-label="Search vehicles"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOption)}
            aria-label="Sort vehicles"
          >
            <option value="default">Sort: Default</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="dpLow">Down Payment: Low to High</option>
            <option value="dpHigh">Down Payment: High to Low</option>
          </select>
          <button
            type="button"
            className="btn btn-sec"
            onClick={() => {
              setSearchQuery('');
              setSortOrder('default');
            }}
          >
            View All 11 Vehicles
          </button>
          <button
            type="button"
            className="btn btn-sec"
            onClick={handleOpenCompare}
          >
            Compare Selected ({compareIds.length})
          </button>
        </div>

        {compareNotice && (
          <div className="msg warn mb-4" role="status">
            {compareNotice}
          </div>
        )}

        <div className="grid">
          {filteredVehicles.map((v) => {
            const activeColorKey = vehicleColors[v.id];
            const activeColorMeta =
              VEHICLE_COLOR_OPTIONS.find((c) => c.key === activeColorKey) ??
              VEHICLE_COLOR_OPTIONS[0];
            const colorMap = VEHICLE_COLOR_IMAGES[v.id];
            const accentColor = activeColorMeta.hex;

            return (
              <div
                key={v.id}
                className="card"
                data-id={v.id}
                style={{
                  borderTopColor:
                    activeColorMeta.key === 'white' ? '#0A1830' : accentColor,
                }}
              >
                <div className="thumb">
                  {VEHICLE_COLOR_OPTIONS.map((opt) => (
                    <img
                      key={opt.key}
                      src={colorMap[opt.key]}
                      alt={`${v.name} in ${opt.name}`}
                      referrerPolicy="no-referrer"
                      className="vf3-stage-img"
                      style={{
                        opacity: activeColorKey === opt.key ? 1 : 0,
                        zIndex: activeColorKey === opt.key ? 2 : 1,
                      }}
                    />
                  ))}
                </div>

                <div className="body">
                  <h3>
                    <span
                      className="dot"
                      style={{ background: accentColor }}
                    />
                    {v.name}
                  </h3>

                  <div
                    className="price"
                    style={{
                      background:
                        activeColorMeta.key === 'white'
                          ? '#E2E8F0'
                          : `${accentColor}22`,
                      color: 'var(--navy)',
                    }}
                  >
                    {peso(v.dp)} DP
                  </div>

                  <div className="sub">
                    SRP {peso(v.srp)} • Monthly {peso(v.monthly)} (5 yrs)
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2 rounded-md border border-[#E2E7EF] bg-[#F8FAFC] px-2.5 py-1.5">
                    <span className="text-[11px] font-medium text-[#5B6B80]">
                      Color:{' '}
                      <strong className="text-[#0A1830]">
                        {activeColorMeta.name}
                      </strong>
                    </span>
                    <div
                      className="flex items-center gap-1.5"
                      aria-label={`${v.name} quick color switcher`}
                    >
                      {VEHICLE_COLOR_OPTIONS.map((opt) => {
                        const selected = activeColorKey === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            aria-label={`${v.name} ${opt.name}`}
                            title={opt.name}
                            onClick={() =>
                              handleSelectVehicleColor(v.id, opt.key)
                            }
                            className="h-4 w-4 rounded-full cursor-pointer transition-transform"
                            style={{
                              backgroundColor: opt.hex,
                              border: selected
                                ? '2px solid #1877f2'
                                : `1px solid ${opt.borderHex}`,
                              transform: selected ? 'scale(1.15)' : 'scale(1)',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <label className="mt-0.5 flex items-center gap-1.5 text-[0.78rem] text-[#5B6B80] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compareIds.includes(v.id)}
                      onChange={() => toggleCompare(v.id)}
                    />
                    Add to compare
                  </label>

                  <div className="actions">
                    <button
                      type="button"
                      className="viewBtn"
                      onClick={() => setDetailVehicleId(v.id)}
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      className="inquireBtn"
                      onClick={() => handleInquireVehicle(v.id)}
                    >
                      Inquire Now
                    </button>
                    <button
                      type="button"
                      className="budgetBtn"
                      onClick={() => {
                        setMaxDpInput(String(v.dp));
                        scrollToSection('promo');
                      }}
                    >
                      Calculate Budget
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Low DP Promo + Budget Calculator */}
      <section id="promo" className="vf-section wrap">
        <h2 className="sec-title">
          Low DP Promo — Paylite Program{' '}
          <span className="badge">FREE INCLUSIONS</span>
        </h2>
        <p className="sec-sub">
          Insurance • 3 Yrs LTO Registration • Chattel Mortgage Fee • 1-Yr
          Battery Subscription • EWD / Tire Repair Kit / Tow Hook • Charger —
          all free. Figures below are promotional estimates, not a guarantee of
          financing approval.
        </p>

        <div className="calc">
          <h3 className="mt-0 mb-4 text-lg">Monthly Budget Calculator</h3>
          <div className="field">
            <label htmlFor="budgetInput">Your Monthly Budget (₱)</label>
            <input
              type="number"
              id="budgetInput"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="e.g. 25000"
              min="0"
            />
          </div>
          <div className="field">
            <label htmlFor="maxDpInput">Maximum Down Payment (₱)</label>
            <input
              type="number"
              id="maxDpInput"
              value={maxDpInput}
              onChange={(e) => setMaxDpInput(e.target.value)}
              placeholder="e.g. 90000"
              min="0"
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCalcSubmitted(true)}
          >
            Calculate Budget
          </button>

          {calcResult && (
            <div className="mt-4">
              {calcResult.error ? (
                <div className="msg warn">{calcResult.error}</div>
              ) : calcResult.matches.length === 0 ? (
                <div className="msg warn">
                  No vehicles currently match that budget/down payment
                  combination. Try raising your monthly budget or down payment,
                  or message Jhon directly for other financing options.
                </div>
              ) : (
                <>
                  <p className="text-[0.85rem] text-[#5B6B80] mb-2.5">
                    {calcResult.matches.length} vehicle(s) match your budget
                    (estimates only):
                  </p>
                  {calcResult.matches.map((v) => (
                    <div key={v.id} className="result-card">
                      <div>
                        <strong>{v.name}</strong>
                        <br />
                        <span className="text-[0.85rem] text-[#5B6B80]">
                          DP {peso(v.dp)} • Monthly {peso(v.monthly)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                        onClick={() => handleInquireVehicle(v.id)}
                      >
                        Inquire About This Vehicle
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Book a Test Drive */}
      <section id="testdrive" className="vf-section wrap">
        <h2 className="sec-title">Book a Test Drive</h2>
        <p className="sec-sub">
          A request, not a confirmed booking — our team follows up to confirm
          date and time.
        </p>

        <form className="formbox" onSubmit={handleTestDriveSubmit} noValidate>
          <div className={`field ${tdErrors.tdName ? 'invalid' : ''}`}>
            <label htmlFor="tdName">Customer Name *</label>
            <input
              id="tdName"
              value={tdName}
              onChange={(e) => setTdName(e.target.value)}
              required
            />
            {tdErrors.tdName && (
              <div className="err">Please enter your name.</div>
            )}
          </div>

          <div className={`field ${tdErrors.tdPhone ? 'invalid' : ''}`}>
            <label htmlFor="tdPhone">Contact Number *</label>
            <input
              id="tdPhone"
              value={tdPhone}
              onChange={(e) => setTdPhone(e.target.value)}
              required
            />
            {tdErrors.tdPhone && (
              <div className="err">Please enter a valid mobile number.</div>
            )}
          </div>

          <div className={`field ${tdErrors.tdVehicle ? 'invalid' : ''}`}>
            <label htmlFor="tdVehicle">Preferred Vehicle *</label>
            <select
              id="tdVehicle"
              value={tdVehicle}
              onChange={(e) => {
                const val = e.target.value;
                setTdVehicle(val);
                if (isVehicleId(val)) {
                  setTdColor(vehicleColors[val]);
                }
              }}
              required
            >
              <option value="">Select a vehicle</option>
              {VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {tdErrors.tdVehicle && (
              <div className="err">Please select a vehicle.</div>
            )}
          </div>

          {isVehicleId(tdVehicle) && (
            <div className="field">
              <label htmlFor="tdColor">Preferred Exterior Color</label>
              <select
                id="tdColor"
                value={tdColor}
                onChange={(e) => {
                  const col = e.target.value as VehicleColorKey;
                  setTdColor(col);
                  handleSelectVehicleColor(tdVehicle, col);
                }}
              >
                {VEHICLE_COLOR_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.name} ({opt.finish})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={`field ${tdErrors.tdDate ? 'invalid' : ''}`}>
            <label htmlFor="tdDate">Preferred Date *</label>
            <input
              type="date"
              id="tdDate"
              value={tdDate}
              onChange={(e) => setTdDate(e.target.value)}
              required
            />
            {tdErrors.tdDate && (
              <div className="err">Please pick a date.</div>
            )}
          </div>

          <div className={`field ${tdErrors.tdTime ? 'invalid' : ''}`}>
            <label htmlFor="tdTime">Preferred Time *</label>
            <input
              type="time"
              id="tdTime"
              value={tdTime}
              onChange={(e) => setTdTime(e.target.value)}
              required
            />
            {tdErrors.tdTime && (
              <div className="err">Please pick a time.</div>
            )}
          </div>

          <div className="field">
            <label htmlFor="tdNotes">Additional Notes</label>
            <textarea
              id="tdNotes"
              rows={3}
              value={tdNotes}
              onChange={(e) => setTdNotes(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" type="submit">
            Request Test Drive
          </button>

          {tdStatus && (
            <div>
              <div className={`msg ${tdStatus.type}`}>{tdStatus.message}</div>
              {tdStatus.draft && (
                <a
                  className="btn btn-fb mt-2.5"
                  href={FACEBOOK_CONTACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => copyDraftText(tdStatus.draft!)}
                >
                  📘 Send Request on Facebook
                </a>
              )}
            </div>
          )}
        </form>
      </section>

      {/* About Jhon */}
      <section id="about" className="vf-section wrap">
        <h2 className="sec-title">About Your Sale Ambassador</h2>
        <div className="amb">
          <div className="photo">JP</div>
          <div>
            <h3 className="m-0 mb-1">Jhon Lee Pama</h3>
            <p className="m-0 text-[#5B6B80]">
              Sale Ambassador, VinFast Pampanga. Helping you find the right
              VinFast EV with the lowest down payment and a monthly plan that
              fits your budget.
            </p>
            <a
              className="btn btn-fb mt-2.5"
              href={FACEBOOK_CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              📘 Message Jhon on Facebook
            </a>
            <div className="contact-chips">
              <a href={`mailto:${CONTACT_EMAIL}`} className="chip">
                ✉️ {CONTACT_EMAIL}
              </a>
              <a href="tel:+639605809638" className="chip">
                📞 {CONTACT_PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Send an Inquiry */}
      <section id="contact" className="vf-section wrap">
        <h2 className="sec-title">Send an Inquiry</h2>
        <p className="sec-sub">
          Submitting this form prepares your inquiry details (including your
          selected vehicle and color) to send to Jhon Lee Pama on Facebook.
        </p>

        <form className="formbox" onSubmit={handleInquirySubmit} noValidate>
          <div className={`field ${iqErrors.iqName ? 'invalid' : ''}`}>
            <label htmlFor="iqName">Full Name *</label>
            <input
              id="iqName"
              value={iqName}
              onChange={(e) => setIqName(e.target.value)}
              required
            />
            {iqErrors.iqName && (
              <div className="err">Please enter your full name.</div>
            )}
          </div>

          <div className={`field ${iqErrors.iqPhone ? 'invalid' : ''}`}>
            <label htmlFor="iqPhone">Mobile Number *</label>
            <input
              id="iqPhone"
              value={iqPhone}
              onChange={(e) => setIqPhone(e.target.value)}
              required
            />
            {iqErrors.iqPhone && (
              <div className="err">Please enter a valid mobile number.</div>
            )}
          </div>

          <div className={`field ${iqErrors.iqEmail ? 'invalid' : ''}`}>
            <label htmlFor="iqEmail">Email Address *</label>
            <input
              type="email"
              id="iqEmail"
              value={iqEmail}
              onChange={(e) => setIqEmail(e.target.value)}
              required
            />
            {iqErrors.iqEmail && (
              <div className="err">Please enter a valid email address.</div>
            )}
          </div>

          <div className={`field ${iqErrors.iqVehicle ? 'invalid' : ''}`}>
            <label htmlFor="iqVehicle">Selected Vehicle *</label>
            <select
              id="iqVehicle"
              value={iqVehicle}
              onChange={(e) => {
                const val = e.target.value;
                setIqVehicle(val);
                if (isVehicleId(val)) {
                  setIqColor(vehicleColors[val]);
                }
              }}
              required
            >
              <option value="">Select a vehicle</option>
              {VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {iqErrors.iqVehicle && (
              <div className="err">Please select a vehicle.</div>
            )}
          </div>

          {isVehicleId(iqVehicle) && (
            <div className="field">
              <label htmlFor="iqColor">Selected Exterior Color</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {VEHICLE_COLOR_OPTIONS.map((opt) => {
                  const active = iqColor === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setIqColor(opt.key);
                        handleSelectVehicleColor(iqVehicle, opt.key);
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium cursor-pointer ${
                        active
                          ? 'border-[#1877f2] bg-blue-50/60 text-[#0A1830] font-semibold ring-1 ring-[#1877f2]'
                          : 'border-[#E2E7EF] bg-white text-[#5B6B80]'
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: opt.hex }}
                      />
                      {opt.name}
                    </button>
                  );
                })}
              </div>
              <input
                type="hidden"
                id="iqColor"
                name="iqColor"
                value={getColorName(iqColor)}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="iqDp">Preferred Down Payment (₱)</label>
            <input
              type="number"
              id="iqDp"
              value={iqDp}
              onChange={(e) => setIqDp(e.target.value)}
              min="0"
            />
          </div>

          <div className="field">
            <label htmlFor="iqBudget">Monthly Budget (₱)</label>
            <input
              type="number"
              id="iqBudget"
              value={iqBudget}
              onChange={(e) => setIqBudget(e.target.value)}
              min="0"
            />
          </div>

          <div className="field">
            <label htmlFor="iqMsg">Inquiry Message</label>
            <textarea
              id="iqMsg"
              rows={3}
              value={iqMsg}
              onChange={(e) => setIqMsg(e.target.value)}
              placeholder="Tell us anything else..."
            />
          </div>

          <div className="checkline">
            <input
              type="checkbox"
              id="iqConsent"
              checked={iqConsent}
              onChange={(e) => setIqConsent(e.target.checked)}
              required
            />
            <label
              htmlFor="iqConsent"
              className={iqErrors.iqConsent ? 'text-[#D8303C]' : ''}
            >
              I consent to the processing of my personal information for this
              inquiry. *
            </label>
          </div>

          <button className="btn btn-primary" type="submit">
            Send Inquiry via Facebook
          </button>

          {iqStatus && (
            <div>
              <div className={`msg ${iqStatus.type}`}>{iqStatus.message}</div>
              {iqStatus.draft && (
                <div className="mt-3 rounded-lg border border-[#E2E7EF] bg-[#F8FAFC] p-3 text-xs text-[#0A1830]">
                  <pre className="m-0 whitespace-pre-wrap font-sans">
                    {iqStatus.draft}
                  </pre>
                  <a
                    className="btn btn-fb mt-2.5"
                    href={FACEBOOK_CONTACT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => copyDraftText(iqStatus.draft!)}
                  >
                    📘 Open Facebook &amp; Send
                  </a>
                </div>
              )}
            </div>
          )}
        </form>
      </section>

      {/* Footer */}
      <footer id="footerFb" className="vf-footer">
        <div className="wrap">
          <div>
            <div>© VinFast Pampanga — Sale Ambassador Jhon Lee Pama</div>
            <div className="contact-chips" style={{ marginTop: 8 }}>
              <a href={`mailto:${CONTACT_EMAIL}`} className="chip chip-footer">
                ✉️ {CONTACT_EMAIL}
              </a>
              <a href="tel:+639605809638" className="chip chip-footer">
                📞 {CONTACT_PHONE}
              </a>
            </div>
          </div>
          <a
            className="footer-fb"
            href={FACEBOOK_CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            📘 Facebook Contact
          </a>
        </div>
      </footer>

      {/* Floating Facebook FAB */}
      <a
        className="fab"
        href={FACEBOOK_CONTACT_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        📘 Chat with Jhon
      </a>

      {/* Vehicle Assistant */}
      <VehicleAssistant
        onInquireVehicle={handleInquireVehicle}
        onScrollTo={scrollToSection}
      />

      {/* Clipboard toast */}
      {copiedBanner && (
        <div
          role="status"
          className="fixed top-20 right-4 z-[120] rounded-lg bg-[#0A1830] px-4 py-2.5 text-xs font-medium text-white shadow-lg border border-[#00C9A7]"
        >
          {copiedBanner}
        </div>
      )}

      {/* Vehicle Details Modal */}
      {detailVehicle && (
        <div
          className="modal-bg"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailVehicleId(null);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detailModalTitle"
          >
            <button
              type="button"
              className="close"
              onClick={() => setDetailVehicleId(null)}
              aria-label="Close"
            >
              ✕
            </button>

            <VehicleColorShowcase
              vehicleId={detailVehicle.id}
              vehicleName={detailVehicle.name}
              selectedColor={vehicleColors[detailVehicle.id]}
              onSelectColor={(c) =>
                handleSelectVehicleColor(detailVehicle.id, c)
              }
            />

            <div className="flex items-center justify-between gap-2 mb-1">
              <h2 id="detailModalTitle" className="m-0 text-xl font-bold">
                {detailVehicle.name}
              </h2>
              <span className="rounded-md bg-[#0A1830] px-2.5 py-1 text-xs font-semibold text-white">
                {getColorName(vehicleColors[detailVehicle.id])}
              </span>
            </div>

            <p className="text-[0.85rem] text-[#5B6B80] m-0 mb-3.5">
              All figures are promotional estimates from the current Low DP
              Paylite promo, not a financing guarantee.
            </p>

            <table className="cmp">
              <tbody>
                <tr>
                  <th>SRP</th>
                  <td>{peso(detailVehicle.srp)}</td>
                </tr>
                <tr>
                  <th>All-in Down Payment</th>
                  <td>{peso(detailVehicle.dp)}</td>
                </tr>
                <tr>
                  <th>Monthly (5 yrs)</th>
                  <td>{peso(detailVehicle.monthly)}</td>
                </tr>
                <tr>
                  <th>Selected Exterior Color</th>
                  <td className="font-semibold">
                    {getColorName(vehicleColors[detailVehicle.id])}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary flex-1 min-w-[180px]"
                onClick={() => {
                  const id = detailVehicle.id;
                  setDetailVehicleId(null);
                  handleInquireVehicle(id);
                }}
              >
                Inquire About This Vehicle
              </button>
              <button
                type="button"
                className="btn btn-sec flex-1 min-w-[150px]"
                onClick={() => {
                  const id = detailVehicle.id;
                  setDetailVehicleId(null);
                  handleBookTestDrive(id);
                }}
              >
                Book a Test Drive
              </button>
            </div>

            <div className="mt-2.5">
              <a
                className="btn btn-fb w-full"
                href={FACEBOOK_CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const colorTxt = ` in ${getColorName(
                    vehicleColors[detailVehicle.id]
                  )}`;
                  copyDraftText(
                    `Hi Jhon Lee Pama, I'm interested in the VinFast ${detailVehicle.name}${colorTxt} (SRP ${peso(
                      detailVehicle.srp
                    )}, All-in DP ${peso(detailVehicle.dp)}).`
                  );
                }}
              >
                📘 Message Jhon on Facebook
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {compareModalOpen && (
        <div
          className="modal-bg"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCompareModalOpen(false);
          }}
        >
          <div
            className="modal"
            style={{ maxWidth: 700 }}
            role="dialog"
            aria-modal="true"
            aria-label="Compare Vehicles"
          >
            <button
              type="button"
              className="close"
              onClick={() => setCompareModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="mt-0 mb-4 text-xl font-bold">Compare Vehicles</h2>
            <div className="overflow-x-auto">
              <table className="cmp">
                <thead>
                  <tr>
                    <th />
                    {compareVehicles.map((v) => (
                      <th key={v.id}>{v.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>SRP</th>
                    {compareVehicles.map((v) => (
                      <td key={v.id}>{peso(v.srp)}</td>
                    ))}
                  </tr>
                  <tr>
                    <th>All-in DP</th>
                    {compareVehicles.map((v) => (
                      <td key={v.id}>{peso(v.dp)}</td>
                    ))}
                  </tr>
                  <tr>
                    <th>Monthly (5yrs)</th>
                    {compareVehicles.map((v) => (
                      <td key={v.id}>{peso(v.monthly)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
