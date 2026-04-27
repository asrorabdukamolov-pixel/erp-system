import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ShowroomPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get('/partners');
        setPartners(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div style={{ padding: '40px', color: 'white' }}>
      <h1>Hamkorlar Test Sahifasi</h1>
      {loading && <p>Yuklanmoqda...</p>}
      {error && <p style={{ color: 'red' }}>Xatolik: {error}</p>}
      {!loading && !error && (
        <div>
          <p>Jami hamkorlar: {partners.length}</p>
          <ul style={{ marginTop: '20px' }}>
            {partners.map(p => (
              <li key={p._id} style={{ marginBottom: '10px', border: '1px solid #333', padding: '10px', borderRadius: '8px' }}>
                {p.firm || p.name} - {p.phone}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShowroomPartners;
