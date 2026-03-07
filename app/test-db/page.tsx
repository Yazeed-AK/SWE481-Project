'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDbPage() {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Attempting to fetch data from Supabase (movies table)...');
        
        // Fetch 5 rows from the 'movies' table
        const { data: fetchedData, error: sbError } = await supabase
          .from('movies')
          .select('*')
          .limit(5);

        if (sbError) {
          // Log the exact error object to the console
          console.error('Supabase fetch error:', sbError);
          setError(sbError);
        } else {
          // Log the data array to the console
          console.log('Supabase fetch success. Data:', fetchedData);
          setData(fetchedData);
        }
      } catch (err) {
        console.error('Unexpected error during Supabase fetch:', err);
        setError({ message: 'An unexpected error occurred', details: err });
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="container py-5 min-vh-100">
      <h2 className="text-white mb-4 border-bottom border-secondary pb-3">Database Connection Test</h2>

      {loading ? (
        <div className="text-warning">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          <span>Testing database connection...</span>
        </div>
      ) : (
        <>
          {/* Error State */}
          {error && (
            <div className="alert alert-danger shadow-sm border-0">
              <h4 className="alert-heading fw-bold">Connection Error</h4>
              <hr />
              <p className="mb-2"><strong>Message:</strong> {error.message || 'Unknown error occurred'}</p>
              <p className="mb-2"><strong>Code:</strong> <code>{error.code || 'N/A'}</code></p>
              <p className="mb-0"><strong>Details:</strong> {error.details || 'N/A'}</p>
              {error.hint && <p className="mb-0 mt-2 text-muted"><strong>Hint:</strong> {error.hint}</p>}
            </div>
          )}

          {/* Success State */}
          {!error && data && (
            <div>
              <div className="alert alert-success shadow-sm border-0 mb-4 bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Successfully connected to Supabase and fetched {data.length} rows.
                </h5>
              </div>
              
              <h5 className="text-warning mb-3">Raw Data from `movies` table:</h5>
              <pre 
                className="bg-dark text-white p-3 rounded border border-secondary"
                style={{ overflowX: 'auto', whiteSpace: 'pre-wrap' }}
              >
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
