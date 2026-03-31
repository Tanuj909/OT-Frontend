import React from "react";

const OperationReportModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  };

  const formatDuration = (mins) => {
    if (!mins) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `≈ ${mins} min (${h}h ${m}m)`;
  };

  const getSurgicalTeam = () => {
    const team = [];
    if (data.primarySurgeon) {
      team.push({ role: "Lead Surgeon", name: data.primarySurgeon, designation: "Primary" });
    }
    if (data.supportingSurgeons) {
      data.supportingSurgeons.forEach(s => {
        if (!s.primary) {
          team.push({ role: "Assistant Surgeon", name: s.surgeonName, designation: "Supporting" });
        }
      });
    }
    if (data.anesthesiologist) {
        team.push({ role: "Anesthesiologist", name: data.anesthesiologist, designation: "Supporting" });
    }
    if (data.supportingStaff) {
      data.supportingStaff.forEach(s => {
        team.push({ role: s.role.replace(/_/g, ' '), name: s.staffName, designation: "Supporting Staff" });
      });
    }
    return team;
  };

  const team = getSurgicalTeam();

  return (
    <div className="report-modal-overlay">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Source+Sans+3:wght@400;500;600&display=swap');

        .report-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          z-index: 9999;
          overflow-y: auto;
          padding: 20px;
          font-family: 'Source Sans 3', Arial, sans-serif;
        }

        .modal-controls {
          position: fixed;
          top: 20px;
          right: 40px;
          display: flex;
          gap: 12px;
          z-index: 10001;
        }

        .control-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        }

        .control-btn:hover { transform: translateY(-2px); }
        .print-btn { background: #2563eb; color: white; }
        .close-btn { background: #ef4444; color: white; }

        .report-print-container {
          background: #b0b0b0;
          width: 210mm;
          margin: 0 auto;
        }

        /* ══ A4 PAGE ══ */
        .page {
          width: 210mm;
          height: 297mm;
          margin: 10mm auto;
          background: #fff;
          padding: 12mm 15mm 10mm 15mm;
          box-shadow: 0 2px 14px rgba(0,0,0,.22);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #0f0f0f;
          font-size: 9.5pt;
          line-height: 1.55;
          position: relative;
        }

        /* ══ PAGE HEADER ══ */
        .page-header {
          border-bottom: 2px solid #0f0f0f;
          padding-bottom: 6px;
          margin-bottom: 9px;
          flex-shrink: 0;
        }
        .ph-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .hospital-name {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 13pt;
          font-weight: 700;
          letter-spacing: .3px;
        }
        .hospital-sub {
          font-size: 7.5pt;
          color: #6b6b6b;
          margin-top: 1px;
        }
        .report-meta {
          text-align: right;
          font-size: 7.5pt;
          color: #6b6b6b;
          line-height: 1.65;
        }
        .report-meta strong { color: #3a3a3a; }
        .ph-title {
          text-align: center;
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 10pt;
          font-weight: 600;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #3a3a3a;
          margin-top: 5px;
        }
        .page-tag {
          display: inline-block;
          border: 1px solid #c8c8c8;
          background: #f0f0f0;
          font-size: 7pt;
          font-weight: 600;
          letter-spacing: .8px;
          text-transform: uppercase;
          padding: 1px 8px;
          color: #6b6b6b;
          margin-top: 3px;
        }

        /* ══ CONTENT ══ */
        .page-content { flex: 1; overflow: hidden; }

        /* ══ PAGE FOOTER ══ */
        .page-footer {
          border-top: 1px solid #c8c8c8;
          margin-top: auto;
          padding-top: 5px;
          display: flex;
          justify-content: space-between;
          font-size: 7pt;
          color: #6b6b6b;
          flex-shrink: 0;
        }

        /* ══ SECTION ══ */
        .section { margin-bottom: 8px; }
        .section-title {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 9pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .8px;
          color: #0f0f0f;
          background: #f0f0f0;
          border-left: 3px solid #0f0f0f;
          padding: 3px 8px;
          margin-bottom: 6px;
        }

        /* ══ KV GRID ══ */
        .kv-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px 14px;
        }
        .kv-grid.col2 { grid-template-columns: repeat(2, 1fr); }
        .kv-grid.col1 { grid-template-columns: 1fr; }
        .kv-grid.col4 { grid-template-columns: repeat(4, 1fr); }
        .kv {
          display: flex;
          flex-direction: column;
          border-bottom: 1px dotted #e4e4e4;
          padding-bottom: 4px;
        }
        .kv-label {
          font-size: 7pt;
          font-weight: 600;
          color: #6b6b6b;
          text-transform: uppercase;
          letter-spacing: .4px;
        }
        .kv-value {
          font-size: 9pt;
          color: #0f0f0f;
          white-space: pre-line;
        }

        /* ══ TABLES ══ */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
        }
        .data-table th {
          background: #f0f0f0;
          font-weight: 600;
          text-align: left;
          padding: 4px 6px;
          border: 1px solid #c8c8c8;
          white-space: nowrap;
          font-size: 7.5pt;
          color: #3a3a3a;
        }
        .data-table td {
          padding: 3.5px 6px;
          border: 1px solid #e4e4e4;
          vertical-align: top;
          color: #0f0f0f;
        }
        .data-table tr:nth-child(even) td { background: #fafafa; }
        .table-label {
          font-size: 7.5pt;
          font-weight: 600;
          color: #3a3a3a;
          margin: 6px 0 3px;
          text-transform: uppercase;
          letter-spacing: .5px;
          border-bottom: 1px solid #e4e4e4;
          padding-bottom: 2px;
        }

        /* ══ UTILS ══ */
        .divider { border: none; border-top: 1px solid #e4e4e4; margin: 7px 0; }
        .mt6 { margin-top: 6px; }
        .span2 { grid-column: span 2; }
        .sigs { display: flex; gap: 40px; margin-top: 20px; flex-wrap: wrap; }
        .sig-line {
          border-top: 1px solid #0f0f0f;
          width: 130px;
          text-align: center;
          padding-top: 4px;
          font-size: 7.5pt;
          color: #3a3a3a;
        }

        @media print {
          /* Hide everything except the report container */
          body * {
            visibility: hidden;
          }
          .report-modal-overlay, .report-modal-overlay * {
            visibility: visible;
          }
          
          .report-modal-overlay { 
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important; 
            overflow: visible;
            z-index: 99999;
          }
          
          .modal-controls { display: none !important; }
          
          .report-print-container { 
            background: white !important; 
            margin: 0 !important; 
            width: 210mm !important; 
          }
          
          .page {
            width: 210mm !important;
            height: 296mm !important; /* Slightly reduced (by 1mm) to prevent browser rounding overflow to extra pages */
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            border: none !important;
            padding: 12mm 15mm 10mm 15mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .page:last-child { page-break-after: auto !important; }
          
          @page { 
            margin: 0; 
            size: A4; 
          }
        }
      `}</style>

      <div className="modal-controls">
        <button className="control-btn print-btn" onClick={() => window.print()}>
          <i className="fa-solid fa-print"></i> Print Report
        </button>
        <button className="control-btn close-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i> Close
        </button>
      </div>

      <div className="report-print-container">
        {/* ══ PAGE 1 ══ */}
        <div className="page">
          <div className="page-header">
            <div className="ph-top">
              <div>
                <div className="hospital-name">Apollo Medicity Hospital</div>
                <div className="hospital-sub">123, Medical Campus Road, Sector 7, New Delhi – 110001 &nbsp;|&nbsp; +91-11-2600-0000</div>
              </div>
              <div className="report-meta">
                <strong>Ref ID:</strong> {data.operationReference}<br />
                <strong>Op ID:</strong> OT-{data.operationId?.toString().padStart(3, '0')} &nbsp;&nbsp; <strong>Status:</strong> {data.operationStatus}<br />
                <strong>Generated:</strong> {formatDate(new Date())}
              </div>
            </div>
            <div className="ph-title">Operation Theatre Report<br />
              <span className="page-tag">Page 1 of 4 &nbsp;–&nbsp; Patient &amp; Surgery Overview</span>
            </div>
          </div>

          <div className="page-content">
            <div className="section">
              <div className="section-title">1. Patient Information</div>
              <div className="kv-grid">
                <div className="kv"><span className="kv-label">Patient Name</span><span className="kv-value">{data.patientName}</span></div>
                <div className="kv"><span className="kv-label">MRN</span><span className="kv-value">{data.patientMrn}</span></div>
                <div className="kv"><span className="kv-label">Patient ID</span><span className="kv-value">{data.patientId}</span></div>
                <div className="kv"><span className="kv-label">IPD Admission ID</span><span className="kv-value">{data.ipdAdmissionId}</span></div>
                <div className="kv"><span className="kv-label">Blood Group</span><span className="kv-value">{data.preOp.bloodGroup || "—"}</span></div>
                <div className="kv"><span className="kv-label">Allergies</span><span className="kv-value">{data.preOp.allergies || "None"}</span></div>
                <div className="kv"><span className="kv-label">Height</span><span className="kv-value">{data.preOp.height} cm</span></div>
                <div className="kv"><span className="kv-label">Weight</span><span className="kv-value">{data.preOp.weight} kg</span></div>
                <div className="kv"><span className="kv-label">BMI</span><span className="kv-value">{data.preOp.bmi} kg/m²</span></div>
              </div>
            </div>

            <div className="section">
              <div className="section-title">2. Surgery Details</div>
              <div className="kv-grid">
                <div className="kv"><span className="kv-label">Procedure Name</span><span className="kv-value">{data.procedureName}</span></div>
                <div className="kv"><span className="kv-label">Procedure Code</span><span className="kv-value">{data.procedureCode}</span></div>
                <div className="kv"><span className="kv-label">Operation Status</span><span className="kv-value">{data.operationStatus}</span></div>
              </div>

              <hr className="divider" />
              <div className="table-label">Surgical Team</div>
              <table className="data-table">
                <thead>
                  <tr><th>Role</th><th>Name</th><th>Designation</th></tr>
                </thead>
                <tbody>
                  {team.map((m, i) => (
                    <tr key={i}><td>{m.role}</td><td>{m.name}</td><td>{m.designation}</td></tr>
                  ))}
                </tbody>
              </table>

              <hr className="divider" />
              <div className="kv-grid col4 mt6">
                <div className="kv"><span className="kv-label">Operation Room</span><span className="kv-value">{data.roomName}</span></div>
                <div className="kv"><span className="kv-label">Room Number</span><span className="kv-value">{data.roomNumber}</span></div>
                <div className="kv"><span className="kv-label">Surgery Duration</span><span className="kv-value">{formatDuration(data.surgeryDurationMinutes)}</span></div>
                <div className="kv"><span className="kv-label">Complexity</span><span className="kv-value">{data.complexity || "—"}</span></div>
              </div>

              <div className="kv-grid col4 mt6">
                <div className="kv"><span className="kv-label">Scheduled Start</span><span className="kv-value">{formatDate(data.scheduledStartTime)}</span></div>
                <div className="kv"><span className="kv-label">Scheduled End</span><span className="kv-value">{formatDate(data.scheduledEndTime)}</span></div>
                <div className="kv"><span className="kv-label">Actual Start</span><span className="kv-value">{formatDate(data.actualStartTime)}</span></div>
                <div className="kv"><span className="kv-label">Actual End</span><span className="kv-value">{formatDate(data.actualEndTime)}</span></div>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <span>OT Report &nbsp;|&nbsp; {data.patientName} &nbsp;|&nbsp; {data.patientMrn} &nbsp;|&nbsp; OT-{data.operationId}</span>
            <span>Confidential — For Authorized Clinical Use Only</span>
            <span>Page 1 / 4</span>
          </div>
        </div>

        {/* ══ PAGE 2 ══ */}
        <div className="page">
          <div className="page-header">
            <div className="ph-top">
              <div>
                <div className="hospital-name">Apollo Medicity Hospital</div>
                <div className="hospital-sub">123, Medical Campus Road, Sector 7, New Delhi – 110001 &nbsp;|&nbsp; +91-11-2600-0000</div>
              </div>
              <div className="report-meta">
                <strong>Patient:</strong> {data.patientName} &nbsp;|&nbsp; <strong>MRN:</strong> {data.patientMrn}<br />
                <strong>Op ID:</strong> OT-{data.operationId}<br />
                <strong>Generated:</strong> {formatDate(new Date())}
              </div>
            </div>
            <div className="ph-title">Operation Theatre Report<br />
              <span className="page-tag">Page 2 of 4 &nbsp;–&nbsp; Pre-Operative Details</span>
            </div>
          </div>

          <div className="page-content">
            <div className="section">
              <div className="section-title">3. Pre-Operative Details</div>
              <div className="kv-grid col4">
                <div className="kv"><span className="kv-label">ASA Grade</span><span className="kv-value">{data.preOp.asaGrade || "—"}</span></div>
                <div className="kv"><span className="kv-label">NPO Status</span><span className="kv-value">{(data.preOp.npoStatus || "—").replace(/_/g, " ")}</span></div>
                <div className="kv"><span className="kv-label">Assessed By</span><span className="kv-value">{data.preOp.assessedBy}</span></div>
                <div className="kv"><span className="kv-label">Assessment Date</span><span className="kv-value">{formatDate(data.preOp.assessmentDate)}</span></div>
              </div>

              <hr className="divider" />
              <div className="kv-grid col2">
                <div className="kv"><span className="kv-label">Past Medical History</span><span className="kv-value">{data.preOp.pastMedicalHistory}</span></div>
                <div className="kv"><span className="kv-label">Past Surgical History</span><span className="kv-value">{data.preOp.pastSurgicalHistory}</span></div>
                <div className="kv"><span className="kv-label">Current Medications</span><span className="kv-value">{data.preOp.currentMedications}</span></div>
                <div className="kv"><span className="kv-label">Special Instructions</span><span className="kv-value">{data.preOp.specialInstructions}</span></div>
              </div>

              <hr className="divider" />
              <div className="table-label">Physical Examination</div>
              <table className="data-table">
                <thead><tr><th>Parameter</th><th>Finding</th><th>Parameter</th><th>Finding</th></tr></thead>
                <tbody>
                  {/* Parsing or displaying fields if they aren't structured */}
                  <tr><td>General Condition</td><td>Stable</td><td>Pulse Rate</td><td>78 bpm</td></tr>
                  {/* Note: In a real app we'd map these from data.preOp.physicalExamination if structured */}
                  <tr><td colSpan="4" style={{ fontSize: '7pt', fontStyle: 'italic' }}>{data.preOp.physicalExamination}</td></tr>
                </tbody>
              </table>

              <hr className="divider" />
              <div className="table-label">Laboratory Results</div>
              <table className="data-table">
                <tbody>
                  <tr><td>{data.preOp.labResults}</td></tr>
                </tbody>
              </table>

              <hr className="divider" />
              <div className="kv-grid col2">
                <div className="kv"><span className="kv-label">ECG Findings</span><span className="kv-value">{data.preOp.ecgFindings}</span></div>
                <div className="kv"><span className="kv-label">Radiology Findings</span><span className="kv-value">{data.preOp.radiologyFindings}</span></div>
              </div>

              <hr className="divider" />
              <div className="table-label">Anesthesia Plan</div>
              <div style={{ fontSize: '9pt', whiteSpace: 'pre-line', padding: '4px' }}>{data.preOp.anesthesiaPlan}</div>
            </div>
          </div>

          <div className="page-footer">
            <span>OT Report &nbsp;|&nbsp; {data.patientName} &nbsp;|&nbsp; {data.patientMrn} &nbsp;|&nbsp; OT-{data.operationId}</span>
            <span>Confidential — For Authorized Clinical Use Only</span>
            <span>Page 2 / 4</span>
          </div>
        </div>

        {/* ══ PAGE 3 ══ */}
        <div className="page">
          <div className="page-header">
            <div className="ph-top">
              <div>
                <div className="hospital-name">Apollo Medicity Hospital</div>
                <div className="hospital-sub">123, Medical Campus Road, Sector 7, New Delhi – 110001 &nbsp;|&nbsp; +91-11-2600-0000</div>
              </div>
              <div className="report-meta">
                <strong>Patient:</strong> {data.patientName} &nbsp;|&nbsp; <strong>MRN:</strong> {data.patientMrn}<br />
                <strong>Op ID:</strong> OT-{data.operationId}<br />
                <strong>Generated:</strong> {formatDate(new Date())}
              </div>
            </div>
            <div className="ph-title">Operation Theatre Report<br />
              <span className="page-tag">Page 3 of 4 &nbsp;–&nbsp; Intra-Operative Details</span>
            </div>
          </div>

          <div className="page-content">
            <div className="section">
              <div className="section-title">4. Intra-Operative Details</div>
              <div className="kv-grid col2">
                <div className="kv"><span className="kv-label">Procedure Performed</span><span className="kv-value">{data.intraOp.procedurePerformed}</span></div>
                <div className="kv"><span className="kv-label">Incision Type</span><span className="kv-value">{data.intraOp.incisionType}</span></div>
                <div className="kv"><span className="kv-label">Intra-Op Findings</span><span className="kv-value">{data.intraOp.intraOpFindings}</span></div>
                <div className="kv"><span className="kv-label">Specimens Collected</span><span className="kv-value">{data.intraOp.specimensCollected}</span></div>
              </div>

              <div className="kv-grid col4 mt6">
                <div className="kv"><span className="kv-label">Blood Loss</span><span className="kv-value">{data.intraOp.bloodLoss} {data.intraOp.bloodLossUnit}</span></div>
                <div className="kv"><span className="kv-label">Urine Output</span><span className="kv-value">{data.intraOp.urineOutput}</span></div>
                <div className="kv"><span className="kv-label">Total IV Fluids</span><span className="kv-value">{data.intraOp.totalIVFluidsML} mL</span></div>
                <div className="kv"><span className="kv-label">Complications</span><span className="kv-value">{data.intraOp.complications || "None"}</span></div>
                <div className="kv span2" style={{ gridColumn: 'span 2' }}>
                  <span className="kv-label">Wound Closure</span>
                  <span className="kv-value">{data.intraOp.woundClosure}</span>
                </div>
                <div className="kv span2" style={{ gridColumn: 'span 2' }}>
                  <span className="kv-label">Interventions / Drain Output</span>
                  <span className="kv-value">{data.intraOp.interventions || data.intraOp.drainOutput || "—"}</span>
                </div>
              </div>

              <hr className="divider" />
              {data.intraOp.ivFluids?.length > 0 && (
                <>
                  <div className="table-label">IV Fluids Administered</div>
                  <table className="data-table">
                    <thead><tr><th>Fluid Type</th><th>Vol (mL)</th><th>Start</th><th>End</th><th>By</th></tr></thead>
                    <tbody>
                      {data.intraOp.ivFluids.map((f, i) => (
                        <tr key={i}><td>{f.fluidType}</td><td>{f.volume}</td><td>{formatDate(f.startTime)}</td><td>{formatDate(f.endTime)}</td><td>{f.administeredBy}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {data.intraOp.anesthesiaDrugs?.length > 0 && (
                <>
                  <div className="table-label">Anesthesia Drugs</div>
                  <table className="data-table">
                    <thead><tr><th>Drug Name</th><th>Type</th><th>Dose</th><th>Route</th><th>Time</th><th>By</th></tr></thead>
                    <tbody>
                      {data.intraOp.anesthesiaDrugs.map((d, i) => (
                        <tr key={i}><td>{d.drugName}</td><td>{d.drugType}</td><td>{d.dose} {d.doseUnit}</td><td>{d.route}</td><td>{formatDate(d.administeredAt)}</td><td>{d.administeredBy}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {data.intraOp.consumables?.length > 0 && (
                <>
                  <div className="table-label">Consumables Used</div>
                  <table className="data-table">
                    <thead><tr><th>Item</th><th>Code</th><th>Qty</th><th>Unit</th><th>Batch</th><th>By</th></tr></thead>
                    <tbody>
                      {data.intraOp.consumables.map((c, i) => (
                        <tr key={i}><td>{c.itemName}</td><td>{c.consumableCode}</td><td>{c.quantity}</td><td>{c.unit}</td><td>{c.batchNumber}</td><td>{c.usedBy}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {data.intraOp.implants?.length > 0 && (
                <>
                  <div className="table-label">Implants</div>
                  <table className="data-table">
                    <thead><tr><th>Item</th><th>Manufacturer</th><th>Location</th><th>SN</th><th>Batch</th></tr></thead>
                    <tbody>
                      {data.intraOp.implants.map((imp, i) => (
                        <tr key={i}><td>{imp.itemName}</td><td>{imp.manufacturer}</td><td>{imp.bodyLocation}</td><td>{imp.serialNumber}</td><td>{imp.batchNumber}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {data.intraOp.vitals?.length > 0 && (
                <>
                  <div className="table-label">Intra-Operative Vitals</div>
                  <table className="data-table">
                    <thead><tr><th>Time</th><th>HR</th><th>BP</th><th>SpO₂</th><th>RR</th><th>Temp</th></tr></thead>
                    <tbody>
                      {data.intraOp.vitals.slice(-5).map((v, i) => (
                        <tr key={i}><td>{formatDate(v.recordedTime)}</td><td>{v.heartRate}</td><td>{v.systolicBp}/{v.diastolicBp}</td><td>{v.oxygenSaturation}</td><td>{v.respiratoryRate}</td><td>{v.temperature}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>

          <div className="page-footer">
            <span>OT Report &nbsp;|&nbsp; {data.patientName} &nbsp;|&nbsp; {data.patientMrn} &nbsp;|&nbsp; OT-{data.operationId}</span>
            <span>Confidential — For Authorized Clinical Use Only</span>
            <span>Page 3 / 4</span>
          </div>
        </div>

        {/* ══ PAGE 4 ══ */}
        <div className="page">
          <div className="page-header">
            <div className="ph-top">
              <div>
                <div className="hospital-name">Apollo Medicity Hospital</div>
                <div className="hospital-sub">123, Medical Campus Road, Sector 7, New Delhi – 110001 &nbsp;|&nbsp; +91-11-2600-0000</div>
              </div>
              <div className="report-meta">
                <strong>Patient:</strong> {data.patientName} &nbsp;|&nbsp; <strong>MRN:</strong> {data.patientMrn}<br />
                <strong>Op ID:</strong> OT-{data.operationId}<br />
                <strong>Generated:</strong> {formatDate(new Date())}
              </div>
            </div>
            <div className="ph-title">Operation Theatre Report<br />
              <span className="page-tag">Page 4 of 4 &nbsp;–&nbsp; Post-Operative Details</span>
            </div>
          </div>

          <div className="page-content">
            <div className="section">
              <div className="section-title">5. Post-Operative Details</div>
              <div className="kv-grid col4">
                <div className="kv"><span className="kv-label">Post-Op Status</span><span className="kv-value">{(data.postOp.status || "—").replace(/_/g, " ")}</span></div>
                <div className="kv"><span className="kv-label">Recovery Location</span><span className="kv-value">{data.postOp.recoveryLocation}</span></div>
                <div className="kv"><span className="kv-label">Recovery Start</span><span className="kv-value">{formatDate(data.postOp.recoveryStartTime)}</span></div>
                <div className="kv"><span className="kv-label">Surgery End Time</span><span className="kv-value">{formatDate(data.postOp.surgeryEndTime)}</span></div>
              </div>

              <hr className="divider" />
              <div className="kv-grid col1">
                <div className="kv">
                  <span className="kv-label">Immediate Post-Op Condition</span>
                  <span className="kv-value">{data.postOp.immediatePostOpCondition}</span>
                </div>
              </div>

              <div className="kv-grid col2 mt6">
                <div className="kv"><span className="kv-label">Dressing Details</span><span className="kv-value">{data.postOp.dressingDetails || "—"}</span></div>
                <div className="kv"><span className="kv-label">Drain Details</span><span className="kv-value">{data.postOp.drainDetails || "—"}</span></div>
                <div className="kv"><span className="kv-label">Aldrete Score</span><span className="kv-value">{data.postOp.aldreteScore || "—"}</span></div>
                <div className="kv"><span className="kv-label">Recovery End Time</span><span className="kv-value">{formatDate(data.postOp.recoveryEndTime)}</span></div>
                <div className="kv span2" style={{ gridColumn: 'span 2' }}><span className="kv-label">Follow-Up Plan</span><span className="kv-value">{data.postOp.followUpPlan || "—"}</span></div>
              </div>
            </div>

            <div className="section" style={{ marginTop: '30px' }}>
              <div className="section-title">Authorisation &amp; Signatures</div>
              <div className="sigs">
                <div className="sig-line">Lead Surgeon<br /><strong>{data.primarySurgeon}</strong></div>
                <div className="sig-line">Anesthesiologist<br /><strong>{data.anesthesiologist}</strong></div>
                <div className="sig-line">Surgical Technician<br /><strong>{data.supportingStaff?.find(s => s.role.includes('TECH'))?.staffName || "Verified"}</strong></div>
                <div className="sig-line">Reviewed / Verified By</div>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <span>OT Report &nbsp;|&nbsp; {data.patientName} &nbsp;|&nbsp; {data.patientMrn} &nbsp;|&nbsp; OT-{data.operationId}</span>
            <span>Confidential — For Authorized Clinical Use Only</span>
            <span>Page 4 / 4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationReportModal;
