import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface Doctor {
  id: string;
  name: string;
  department: string;
  experience: string;
  fee: string;
  availability?: string;
  photo?: string;
}

interface Props { onBack?: () => void; onBook?: (doctorId: string, doctorName?: string) => void }

const DoctorDirectory: React.FC<Props> = ({ onBack, onBook }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API= "https://aura-health-ai.onrender.com"; 

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try { 
      const res = await axios.get(`${API}/doctors`);
      setDoctors(res.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Unable to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <section className="py-12 px-6 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white mb-6">Doctor Directory</h2>
          <button onClick={onBack} className="text-sm text-cyan-400">← Back to Home</button>
        </div>
        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-rose-400 mb-4">{error} <button onClick={() => fetchDoctors()} className="ml-2 text-cyan-400">Retry</button></div>}
        {doctors.length === 0 && !loading && !error && (
          <div className="bg-dark-900 border border-white/5 rounded-lg p-6 text-gray-400">No doctors found.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((d) => (
            <motion.div key={d.id} className="bg-dark-900 border border-white/5 rounded-lg p-4 flex flex-col items-start gap-3">
              <div className="w-full flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500">Photo</div>
                <div>
                  <h3 className="font-bold text-white">{d.name}</h3>
                  <div className="text-sm text-gray-300">{d.department}</div>
                </div>
              </div>
              <div className="text-sm text-gray-300">Experience: {d.experience}</div>
              <div className="text-sm text-gray-300">Fee: {d.fee}</div>
              {/** Treat missing availability as available by default */}
              {(() => {
                const isUnavailable = typeof d.availability === 'string' && d.availability.toLowerCase() === 'unavailable';
                const isAvailable = !isUnavailable; // default available when field missing
                const availText = d.availability || (isAvailable ? 'Available' : 'Unavailable');

                return (
                  <>
                    <div className="text-sm text-gray-400">{availText}</div>
                    <div className="w-full flex justify-end">
                      <button
                        onClick={() => onBook && onBook(d.id, d.name)}
                        disabled={!isAvailable}
                        className={`px-3 py-2 rounded ${isAvailable ? 'bg-cyan-500 text-dark-950' : 'bg-white/5 text-gray-400 cursor-not-allowed'}`}
                      >{isAvailable ? 'Book Appointment' : 'Unavailable'}</button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorDirectory;
