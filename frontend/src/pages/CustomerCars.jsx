import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CustomerCars = () => {
  const [allCars, setAllCars] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingCar, setBookingCar] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [calendarBase, setCalendarBase] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [bookedDates, setBookedDates] = useState([]);
  // Filters
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) fetchCars();
  }, [token]);

  useEffect(() => {
    applyFilters();
  }, [allCars, filterCategory, filterBrand, filterMaxPrice, showAvailableOnly]);

  const fetchCars = async (dateStart, dateEnd) => {
    try {
      let url = '/cars/browse';
      const params = [];
      if (dateStart && dateEnd) {
        params.push(`start_date=${dateStart}`, `end_date=${dateEnd}`);
      }
      if (params.length > 0) url += '?' + params.join('&');
      const response = await api.get(url);
      setAllCars(response.data.cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allCars];
    if (filterCategory) filtered = filtered.filter(c => c.category === filterCategory);
    if (filterBrand) filtered = filtered.filter(c => c.brand === filterBrand);
    if (filterMaxPrice) filtered = filtered.filter(c => parseFloat(c.price_per_day) <= parseFloat(filterMaxPrice));
    if (showAvailableOnly) filtered = filtered.filter(c => c.available_for_dates);
    setCars(filtered);
  };

  const handleDateFilter = () => {
    if (filterDateStart && filterDateEnd) {
      fetchCars(filterDateStart, filterDateEnd);
    }
  };

  const clearFilters = () => {
    setFilterDateStart('');
    setFilterDateEnd('');
    setFilterCategory('');
    setFilterBrand('');
    setFilterMaxPrice('');
    setShowAvailableOnly(false);
    fetchCars();
  };

  const brands = [...new Set(allCars.map(c => c.brand))].sort();
  const categories = [...new Set(allCars.map(c => c.category).filter(Boolean))].sort();

  const openBookingModal = async (car) => {
    setBookingCar(car);
    setStartDate('');
    setEndDate('');
    try {
      const response = await api.get(`/bookings/car/${car.id}/booked-dates`);
      setBookedDates(response.data.booked_dates.map(b => ({
        start: new Date(b.start_date),
        end: new Date(b.end_date)
      })));
    } catch (error) {
      setBookedDates([]);
    }
  };

  const handleBook = async () => {
    if (!startDate || !endDate) return;
    try {
      await api.post('/bookings', { car_id: bookingCar.id, start_date: startDate, end_date: endDate });
      setMessage('Booking created successfully!');
      setBookingCar(null);
      setStartDate('');
      setEndDate('');
      setBookedDates([]);
      fetchCars();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Booking failed');
    }
  };

  const toDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isInRange = (day, s, e) => s && e && day > s && day < e;

  const isDayBooked = (day) => {
    return bookedDates.some(b => day >= b.start && day < b.end);
  };

  const isRangeOverlapping = (start, end) => {
    return bookedDates.some(b => start < b.end && end > b.start);
  };

  const handleDayClick = (day) => {
    const today = new Date(); today.setHours(0,0,0,0);
    if (day < today || isDayBooked(day)) return;
    const sd = startDate ? new Date(startDate + 'T00:00:00') : null;
    if (!sd || endDate || day < sd) {
      setStartDate(toDateStr(day));
      setEndDate('');
    } else {
      // Check if the range would overlap any booked dates
      if (isRangeOverlapping(sd, day)) {
        // Reset and start from this day instead
        setStartDate(toDateStr(day));
        setEndDate('');
      } else {
        setEndDate(toDateStr(day));
      }
    }
  };

  const getMonthDays = (year, month) => {
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks = [];
    let week = new Array(startDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(new Date(year, month, d));
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week); }
    return weeks;
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayHeaders = ['S','M','T','W','T','F','S'];

  const renderMonth = (baseDate) => {
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();
    const weeks = getMonthDays(y, m);
    const sd = startDate ? new Date(startDate + 'T00:00:00') : null;
    const ed = endDate ? new Date(endDate + 'T00:00:00') : null;
    const today = new Date(); today.setHours(0,0,0,0);

    return (
      <div style={{ flex: 1 }}>
        <p style={{ textAlign: 'center', fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>{monthNames[m]} {y}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0', textAlign: 'center' }}>
          {dayHeaders.map((dh, i) => (
            <div key={i} style={{ padding: '4px 0', fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>{dh}</div>
          ))}
          {weeks.flat().map((day, i) => {
            if (!day) return <div key={`e${i}`} style={{ padding: '8px 0' }} />;
            const isPast = day < today;
            const booked = isDayBooked(day);
            const isStart = sd && isSameDay(day, sd);
            const isEnd = ed && isSameDay(day, ed);
            const inRange = isInRange(day, sd, ed);
            const isSelected = isStart || isEnd;
            const disabled = isPast || booked;

            return (
              <div key={i} style={{ padding: '2px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                {inRange && <div style={{ position: 'absolute', top: '2px', bottom: '2px', left: 0, right: 0, backgroundColor: '#f1f5f9' }} />}
                {isStart && ed && <div style={{ position: 'absolute', top: '2px', bottom: '2px', left: '50%', right: 0, backgroundColor: '#f1f5f9' }} />}
                {isEnd && sd && <div style={{ position: 'absolute', top: '2px', bottom: '2px', left: 0, right: '50%', backgroundColor: '#f1f5f9' }} />}
                {booked && <div style={{ position: 'absolute', top: '2px', bottom: '2px', left: 0, right: 0, backgroundColor: '#fee2e2', borderRadius: '4px' }} />}
                <button
                  onClick={() => !disabled && handleDayClick(day)}
                  style={{
                    position: 'relative', zIndex: 1, width: '36px', height: '36px', borderRadius: '50%', border: 'none', fontSize: '14px', fontWeight: isSelected ? 700 : 500, cursor: disabled ? 'default' : 'pointer',
                    backgroundColor: isSelected ? '#0f172a' : 'transparent',
                    color: isSelected ? 'white' : booked ? '#dc2626' : isPast ? '#d1d5db' : '#0f172a',
                    textDecoration: booked ? 'line-through' : 'none',
                    outline: isSameDay(day, today) && !isSelected ? '2px solid #cbd5e1' : 'none', outlineOffset: '-2px'
                  }}
                >
                  {day.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const leftMonth = calendarBase;
  const rightMonth = new Date(calendarBase.getFullYear(), calendarBase.getMonth() + 1, 1);
  const prevMonth = () => setCalendarBase(new Date(calendarBase.getFullYear(), calendarBase.getMonth() - 1, 1));
  const nextMonth = () => setCalendarBase(new Date(calendarBase.getFullYear(), calendarBase.getMonth() + 1, 1));
  const canGoPrev = calendarBase > new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getCarImage = (brand, model) => {
    const map = {
      'toyota camry': '/cars/toyota-camry.png',
      'honda civic': '/cars/honda-civic.png',
      'bmw x5': '/cars/bmw-x5.jpg',
      'mercedes e-class': '/cars/mercedes-e-class.png',
      'ford mustang': '/cars/ford-mustang.jpg',
      'audi a4': '/cars/audi-a4.png',
      'chevrolet tahoe': '/cars/chevrolet-tahoe.jpg',
      'hyundai tucson': '/cars/hyundai-tucson.png',
      'mazda cx-5': '/cars/mazda-cx5.jpg',
      'nissan altima': '/cars/nissan-altima.png',
    };
    return map[`${brand} ${model}`.toLowerCase()] || null;
  };

  const getStatusBadge = (status) => {
    const map = { available: { backgroundColor: '#d1fae5', color: '#065f46' }, rented: { backgroundColor: '#fee2e2', color: '#991b1b' }, maintenance: { backgroundColor: '#fef3c7', color: '#b45309' } };
    return { padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, ...(map[status] || map.available) };
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, system-ui, sans-serif' }}>Loading...</div>;
  }

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Manrope, system-ui, sans-serif', backgroundColor: '#f6f7f7' }}>
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
      </button>
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      {/* Sidebar */}
      <aside className={`app-sidebar${sidebarOpen ? ' open' : ''}`} style={{ width: '256px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#1f3864', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
            </div>
            <div>
              <h1 style={{ color: '#1f3864', fontSize: '18px', fontWeight: 800, margin: 0, lineHeight: 1 }}>DriveEase</h1>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, margin: '2px 0 0 0' }}>Car Rentals</p>
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link to="/customer/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              Dashboard
            </Link>
            <Link to="/customer/cars" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: '#1f3864', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
              Browse Cars
            </Link>
            <Link to="/customer/bookings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
              My Bookings
            </Link>
            <Link to="/customer/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: '#64748b', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              Profile
            </Link>
          </nav>
        </div>
        <div style={{ padding: '0 8px' }}>
          <button onClick={handleLogout} style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.025em' }}>Browse Cars</h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              {cars.filter(c => c.available_for_dates).length} of {cars.length} vehicles available
              {(filterDateStart && filterDateEnd) && <span> for your dates</span>}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="header-user-name" style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{user?.full_name || 'Customer'}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1f3864', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 700 }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          </div>
        </header>

        <div className="app-content" style={{ padding: '24px 32px' }}>
          {message && (
            <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '8px', backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2', color: message.includes('success') ? '#065f46' : '#991b1b' }}>
              {message}
            </div>
          )}

          {/* Filter Bar */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '20px' }}>
            <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
              {/* Date Range */}
              <div className="filter-date-group" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Pick-up Date</label>
                  <input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} min={new Date().toISOString().split('T')[0]}
                    style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#0f172a', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Return Date</label>
                  <input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} min={filterDateStart || new Date().toISOString().split('T')[0]}
                    style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#0f172a', outline: 'none' }} />
                </div>
                <button onClick={handleDateFilter} disabled={!filterDateStart || !filterDateEnd}
                  style={{ padding: '8px 16px', backgroundColor: (!filterDateStart || !filterDateEnd) ? '#94a3b8' : '#1f3864', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: (!filterDateStart || !filterDateEnd) ? 'not-allowed' : 'pointer', height: '38px' }}>
                  Check
                </button>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Type</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#0f172a', outline: 'none', minWidth: '120px', height: '38px', backgroundColor: 'white' }}>
                  <option value="">All Types</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Brand</label>
                <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#0f172a', outline: 'none', minWidth: '120px', height: '38px', backgroundColor: 'white' }}>
                  <option value="">All Brands</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Max Price */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Max $/day</label>
                <input type="number" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} placeholder="Any"
                  style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#0f172a', outline: 'none', width: '80px', height: '38px', boxSizing: 'border-box' }} />
              </div>

              {/* Available Only Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}>
                <input type="checkbox" id="availOnly" checked={showAvailableOnly} onChange={e => setShowAvailableOnly(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#1f3864', cursor: 'pointer' }} />
                <label htmlFor="availOnly" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}>Available only</label>
              </div>

              {/* Clear */}
              {(filterDateStart || filterDateEnd || filterCategory || filterBrand || filterMaxPrice || showAvailableOnly) && (
                <button onClick={clearFilters} style={{ padding: '8px 14px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', height: '38px' }}>
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Car Grid */}
          <div className="car-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {cars.map(car => {
              const isAvail = car.available_for_dates;
              return (
                <div key={car.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: isAvail ? 1 : 0.65, transition: 'opacity 0.2s' }}>
                  <div style={{ height: '180px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {getCarImage(car.brand, car.model) ? (
                      <img src={getCarImage(car.brand, car.model)} alt={`${car.brand} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="#cbd5e1"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                    )}
                    {!isAvail && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '4px 10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>Unavailable</div>
                    )}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{car.brand} {car.model}</h3>
                      <span style={getStatusBadge(isAvail ? 'available' : 'rented')}>{isAvail ? 'Available' : 'Booked'}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 4px 0' }}>{car.year} · {car.plate_number}</p>
                    {car.category && <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0', fontWeight: 600 }}>{car.category}</p>}
                    {!car.category && <div style={{ marginBottom: '16px' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#1f3864' }}>₱{parseFloat(car.price_per_day).toFixed(0)}<span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>/day</span></span>
                      {isAvail ? (
                        <button onClick={() => openBookingModal(car)} style={{ padding: '8px 20px', backgroundColor: '#1f3864', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Book Now</button>
                      ) : (
                        <span style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#94a3b8', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>Not Available</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {cars.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>No cars match your filters</p>
              <button onClick={clearFilters} style={{ marginTop: '8px', padding: '8px 20px', backgroundColor: '#1f3864', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Clear Filters</button>
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal — Dual-Month Calendar */}
      {bookingCar && (
        <>
          <div onClick={() => { setBookingCar(null); setStartDate(''); setEndDate(''); setBookedDates([]); }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          <div className="booking-modal" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '700px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', zIndex: 50, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '24px 24px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Select dates</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>{bookingCar.brand} {bookingCar.model} · ₱{parseFloat(bookingCar.price_per_day).toFixed(0)}/day</p>
                {startDate && endDate && (
                  <p style={{ fontSize: '13px', color: '#1f3864', fontWeight: 600, margin: '4px 0 0 0' }}>
                    {new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
              <button onClick={() => { setBookingCar(null); setStartDate(''); setEndDate(''); }} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginTop: '2px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>

            {/* Calendar Navigation */}
            <div style={{ padding: '20px 24px 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={prevMonth} disabled={!canGoPrev} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: canGoPrev ? 'pointer' : 'default', color: canGoPrev ? '#0f172a' : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
              </button>
              <div style={{ flex: 1 }} />
              <button onClick={nextMonth} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
              </button>
            </div>

            {/* Dual Month Calendars */}
            <div className="calendar-container" style={{ padding: '8px 24px 24px 24px', display: 'flex', gap: '32px' }}>
              {renderMonth(leftMonth)}
              {renderMonth(rightMonth)}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => { setStartDate(''); setEndDate(''); }} style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 600, color: '#64748b', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Clear dates</button>
              <button onClick={handleBook} disabled={!startDate || !endDate} style={{ padding: '12px 32px', backgroundColor: !startDate || !endDate ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: !startDate || !endDate ? 'not-allowed' : 'pointer' }}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerCars;
