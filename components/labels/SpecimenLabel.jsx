import React from 'react';

export default function SpecimenLabel({
  patientName,
  patientDob,
  patientAge,
  mrn,
  specimenId,
  specimenType,
  collectionDate,
  collectorName,
  tests,
  physician,
  labName = 'PathLIMS Laboratory',
  qrCodeUrl,
  barcode,
  priority = 'ROUTINE',
  labelSize = 'tube' // 'tube' | 'bag' | 'page'
}) {
  const getPriorityColor = () => {
    switch (priority?.toUpperCase()) {
      case 'STAT': return '#dc2626'; // red
      case 'URGENT': return '#f97316'; // orange
      case 'ROUTINE': default: return '#16a34a'; // green
    }
  };

  if (labelSize === 'bag') {
    return (
      <div className="specimen-label-print-root" style={{ width: '192px', height: '384px', backgroundColor: 'white', border: '1px solid #ccc', position: 'relative', overflow: 'hidden', padding: '8px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .specimen-label-print-root, .specimen-label-print-root * { visibility: visible; }
            .specimen-label-print-root { position: absolute; left: 0; top: 0; border: none; margin: 0; padding: 0; }
          }
        `}</style>
        
        <div style={{ textAlign: 'center', borderBottom: '1px solid black', paddingBottom: '4px', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
          {labName}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" style={{ width: '80px', height: '80px', marginBottom: '4px' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', border: '1px solid #eee', marginBottom: '4px' }} />
          )}
          {barcode && <div style={{ fontFamily: 'monospace', fontSize: '10px' }}>{barcode}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
          <div>
            <div style={{ color: '#555', fontSize: '7px' }}>Name</div>
            <div style={{ fontWeight: 'bold' }}>{patientName || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#555', fontSize: '7px' }}>MRN</div>
            <div>{mrn || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#555', fontSize: '7px' }}>DOB | Age</div>
            <div>{patientDob || '-'} | {patientAge || '-'}</div>
          </div>
          <div>
            <div style={{ color: '#555', fontSize: '7px' }}>Specimen</div>
            <div>{specimenId || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#555', fontSize: '7px' }}>Type</div>
            <div style={{ fontWeight: 'bold' }}>{specimenType || 'N/A'}</div>
          </div>
          <div>
            <div style={{ color: '#555', fontSize: '7px' }}>Collected</div>
            <div>{collectionDate || 'N/A'}</div>
          </div>
        </div>

        <div style={{ fontSize: '9px', marginBottom: '8px' }}>
          <div style={{ color: '#555', fontSize: '7px' }}>Tests</div>
          <div>{tests || 'N/A'}</div>
        </div>

        <div style={{ fontSize: '9px' }}>
          <div style={{ color: '#555', fontSize: '7px' }}>Physician</div>
          <div>{physician || 'N/A'}</div>
        </div>

        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '16px', backgroundColor: getPriorityColor(), color: 'white', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', lineHeight: '16px' }}>
          {priority?.toUpperCase()}
        </div>
      </div>
    );
  }

  if (labelSize === 'page') {
    return (
      <div className="specimen-label-print-root" style={{ width: '100%', height: '100%', backgroundColor: 'white', padding: '40px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .specimen-label-print-root, .specimen-label-print-root * { visibility: visible; }
            .specimen-label-print-root { position: absolute; left: 0; top: 0; width: 100vw; height: 100vh; padding: 20px; }
          }
        `}</style>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{labName}</h1>
            <h2 style={{ margin: '0', fontSize: '18px', color: '#555' }}>Specimen Requisition Form</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" style={{ width: '120px', height: '120px', marginBottom: '10px' }} />
            ) : (
              <div style={{ width: '120px', height: '120px', border: '1px solid #ccc', marginBottom: '10px' }} />
            )}
            {barcode && <div style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '2px' }}>{barcode}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          <div style={{ border: '1px solid #ccc', padding: '15px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>PATIENT INFORMATION</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '14px' }}>
              <div style={{ color: '#555' }}>Name:</div><div style={{ fontWeight: 'bold' }}>{patientName || 'N/A'}</div>
              <div style={{ color: '#555' }}>MRN:</div><div>{mrn || 'N/A'}</div>
              <div style={{ color: '#555' }}>DOB:</div><div>{patientDob || '-'} (Age: {patientAge || '-'})</div>
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>SPECIMEN DETAILS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '14px' }}>
              <div style={{ color: '#555' }}>Specimen ID:</div><div style={{ fontWeight: 'bold' }}>{specimenId || 'N/A'}</div>
              <div style={{ color: '#555' }}>Type:</div><div>{specimenType || 'N/A'}</div>
              <div style={{ color: '#555' }}>Collection Date:</div><div>{collectionDate || 'N/A'}</div>
              <div style={{ color: '#555' }}>Collected By:</div><div>{collectorName || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>CLINICAL INFORMATION</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '14px' }}>
            <div style={{ color: '#555' }}>Physician:</div><div>{physician || 'N/A'}</div>
            <div style={{ color: '#555' }}>Tests Ordered:</div><div style={{ fontWeight: 'bold' }}>{tests || 'N/A'}</div>
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: getPriorityColor(), color: 'white', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px' }}>
          PRIORITY: {priority?.toUpperCase()}
        </div>
      </div>
    );
  }

  // Default: tube
  return (
    <div className="specimen-label-print-root" style={{ width: '240px', height: '96px', backgroundColor: 'white', border: '1px solid #ccc', position: 'relative', overflow: 'hidden', display: 'flex', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .specimen-label-print-root, .specimen-label-print-root * { visibility: visible; }
          .specimen-label-print-root { position: absolute; left: 0; top: 0; border: none; margin: 0; padding: 0; }
        }
      `}</style>
      
      <div style={{ width: '80px', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px dashed #ccc' }}>
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code" style={{ width: '40px', height: '40px', marginBottom: '2px' }} />
        ) : (
          <div style={{ width: '40px', height: '40px', border: '1px solid #eee', marginBottom: '2px' }} />
        )}
        {barcode && <div style={{ fontFamily: 'monospace', fontSize: '6px' }}>{barcode}</div>}
      </div>

      <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '9px', fontWeight: 'bold', lineHeight: '1.2' }}>{patientName || 'N/A'}</div>
          <div style={{ fontSize: '7px', color: '#555', lineHeight: '1.2' }}>{patientDob || '-'} | {patientAge || '-'}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: '8px', fontWeight: 'bold', lineHeight: '1.2' }}>{specimenId || 'N/A'}</div>
          <div style={{ fontSize: '7px', lineHeight: '1.2' }}>{specimenType || 'N/A'}</div>
          <div style={{ fontSize: '7px', color: '#555', lineHeight: '1.2' }}>{collectionDate || 'N/A'}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '8px', backgroundColor: getPriorityColor() }} />
    </div>
  );
}
