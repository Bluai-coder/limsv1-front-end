import React from 'react';

export default function WasteLabel({
  wasteBarcode,
  wasteType,
  containerType,
  collectionDate,
  technicianName,
  disposalDeadline,
  qrCodeUrl,
  labelSize = 'bag' // 'bag' | 'page'
}) {
  if (labelSize === 'page') {
    return (
      <div className="waste-label-print-root" style={{ width: '100%', height: '100%', backgroundColor: 'white', padding: '40px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .waste-label-print-root, .waste-label-print-root * { visibility: visible; }
            .waste-label-print-root { position: absolute; left: 0; top: 0; width: 100vw; height: 100vh; padding: 20px; }
          }
        `}</style>
        
        <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '20px', textAlign: 'center', marginBottom: '40px', borderRadius: '8px' }}>
          <div style={{ fontSize: '48px', lineHeight: '1', marginBottom: '10px' }}>☣</div>
          <h1 style={{ margin: '0', fontSize: '32px', letterSpacing: '2px' }}>BIOHAZARD WASTE</h1>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '30px', marginBottom: '40px' }}>
          <div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#555' }}>Waste Container ID</h2>
            <div style={{ fontFamily: 'monospace', fontSize: '36px', fontWeight: 'bold' }}>{wasteBarcode || 'N/A'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" style={{ width: '150px', height: '150px', marginBottom: '10px' }} />
            ) : (
              <div style={{ width: '150px', height: '150px', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No QR</div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <div style={{ border: '2px solid #ccc', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>WASTE DETAILS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', fontSize: '16px' }}>
              <div style={{ color: '#555', fontWeight: 'bold' }}>Type:</div><div>{wasteType || 'N/A'}</div>
              <div style={{ color: '#555', fontWeight: 'bold' }}>Container:</div><div>{containerType || 'N/A'}</div>
            </div>
          </div>

          <div style={{ border: '2px solid #ccc', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>LOGISTICS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', fontSize: '16px' }}>
              <div style={{ color: '#555', fontWeight: 'bold' }}>Collected:</div><div>{collectionDate || 'N/A'}</div>
              <div style={{ color: '#555', fontWeight: 'bold' }}>Technician:</div><div>{technicianName || 'N/A'}</div>
              <div style={{ color: '#555', fontWeight: 'bold' }}>Disposal Deadline:</div><div style={{ color: '#dc2626', fontWeight: 'bold' }}>{disposalDeadline || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div style={{ border: '4px solid #dc2626', padding: '20px', textAlign: 'center', marginTop: '60px' }}>
          <h2 style={{ margin: '0', color: '#dc2626', fontSize: '24px' }}>HANDLE WITH CAUTION — BIOLOGICAL HAZARD</h2>
        </div>
      </div>
    );
  }

  // Default: bag
  return (
    <div className="waste-label-print-root" style={{ width: '192px', height: '384px', backgroundColor: 'white', border: '1px solid #ccc', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .waste-label-print-root, .waste-label-print-root * { visibility: visible; }
          .waste-label-print-root { position: absolute; left: 0; top: 0; border: none; margin: 0; padding: 0; }
        }
      `}</style>
      
      <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px', textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '24px', lineHeight: '1' }}>☣</div>
        <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>BIOHAZARD</div>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '12px', padding: '0 8px' }}>
        <div style={{ color: '#555', fontSize: '8px', textTransform: 'uppercase' }}>Waste Container ID</div>
        <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold' }}>{wasteBarcode || 'N/A'}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code" style={{ width: '80px', height: '80px' }} />
        ) : (
          <div style={{ width: '80px', height: '80px', border: '1px solid #eee' }} />
        )}
      </div>

      <div style={{ padding: '0 12px', fontSize: '10px' }}>
        <div style={{ marginBottom: '6px', borderBottom: '1px dotted #ccc', paddingBottom: '4px' }}>
          <div style={{ color: '#777', fontSize: '8px' }}>Type</div>
          <div style={{ fontWeight: 'bold' }}>{wasteType || 'N/A'}</div>
        </div>
        <div style={{ marginBottom: '6px', borderBottom: '1px dotted #ccc', paddingBottom: '4px' }}>
          <div style={{ color: '#777', fontSize: '8px' }}>Container</div>
          <div>{containerType || 'N/A'}</div>
        </div>
        <div style={{ marginBottom: '6px', borderBottom: '1px dotted #ccc', paddingBottom: '4px' }}>
          <div style={{ color: '#777', fontSize: '8px' }}>Collected</div>
          <div>{collectionDate || 'N/A'}</div>
        </div>
        <div style={{ marginBottom: '6px', borderBottom: '1px dotted #ccc', paddingBottom: '4px' }}>
          <div style={{ color: '#777', fontSize: '8px' }}>Technician</div>
          <div>{technicianName || 'N/A'}</div>
        </div>
        <div style={{ marginBottom: '6px' }}>
          <div style={{ color: '#dc2626', fontSize: '8px', fontWeight: 'bold' }}>Disposal Deadline</div>
          <div style={{ fontWeight: 'bold' }}>{disposalDeadline || 'N/A'}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '8px', borderTop: '2px solid #dc2626', textAlign: 'center' }}>
        <div style={{ color: '#dc2626', fontSize: '8px', fontWeight: 'bold' }}>HANDLE WITH CAUTION</div>
        <div style={{ color: '#dc2626', fontSize: '7px' }}>BIOLOGICAL HAZARD</div>
      </div>
    </div>
  );
}
