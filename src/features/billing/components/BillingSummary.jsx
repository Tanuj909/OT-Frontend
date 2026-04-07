import React from "react";

const BillingSummary = ({ isOpen, onClose, data }) => {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const roomCharges = data.roomCharges?.rooms || [];
  const itemCharges = data.itemCharges?.items || [];
  const payments = data.payments || [];
  
  const totalPages = 3;

  const PageHeader = ({ pageNum, title }) => (
    <div className="page-header">
      <div className="ph-top">
        <div>
          <div className="hospital-name">Apollo Medicity Hospital</div>
          <div className="hospital-sub">123, Medical Campus Road, Sector 7, New Delhi – 110001 &nbsp;|&nbsp; +91-11-2600-0000</div>
        </div>
        <div className="report-meta">
          <strong>Ref ID:</strong> {data.operationReference}<br />
          <strong>Billing ID:</strong> #{data.billingMasterId} &nbsp;&nbsp; <strong>Status:</strong> {data.paymentStatus}<br />
          <strong>Billing Date:</strong> {formatDate(data.billingDate)}
        </div>
      </div>
      <div className="ph-title">{title || "OT Billing Summary"}
        <div style={{ fontSize: '7pt', color: '#666', marginTop: '3px' }}>Page {pageNum} of {totalPages}</div>
      </div>
    </div>
  );

  const PageFooter = ({ pageNum }) => (
    <div className="page-footer">
      <span>OT Billing System &nbsp;|&nbsp; Ref: {data.operationReference}</span>
      <span>Computer generated statement &nbsp;|&nbsp; {formatDate(new Date())}</span>
      <span>Page {pageNum} / {totalPages}</span>
    </div>
  );

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
          padding: 15mm 15mm 15mm 15mm;
          box-shadow: 0 2px 14px rgba(0,0,0,.22);
          display: flex;
          flex-direction: column;
          color: #0f0f0f;
          font-size: 9.5pt;
          line-height: 1.55;
          position: relative;
        }

        /* ══ PAGE HEADER ══ */
        .page-header {
          border-bottom: 2px solid #0f0f0f;
          padding-bottom: 8px;
          margin-bottom: 12px;
          flex-shrink: 0;
        }
        .ph-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .hospital-name {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 14pt;
          font-weight: 700;
          letter-spacing: .3px;
        }
        .hospital-sub {
          font-size: 8pt;
          color: #6b6b6b;
          margin-top: 2px;
        }
        .report-meta {
          text-align: right;
          font-size: 8pt;
          color: #6b6b6b;
          line-height: 1.65;
        }
        .report-meta strong { color: #3a3a3a; }
        .ph-title {
          text-align: center;
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 11pt;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #3a3a3a;
          margin-top: 8px;
        }

        /* ══ CONTENT ══ */
        .page-content { flex: 1; }

        /* ══ PAGE FOOTER ══ */
        .page-footer {
          border-top: 1px solid #c8c8c8;
          margin-top: auto;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 7.5pt;
          color: #6b6b6b;
          flex-shrink: 0;
        }

        /* ══ SECTION ══ */
        .section { margin-bottom: 15px; }
        .section-title {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 10pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .8px;
          color: #0f0f0f;
          background: #f8f9fa;
          border-left: 3px solid #0f0f0f;
          padding: 5px 12px;
          margin-bottom: 10px;
        }

        /* ══ KV GRID ══ */
        .kv-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px 20px;
        }
        .kv-grid.col2 { grid-template-columns: repeat(2, 1fr); }
        .kv-grid.col4 { grid-template-columns: repeat(4, 1fr); }
        .kv {
          display: flex;
          flex-direction: column;
          border-bottom: 1px dotted #e4e4e4;
          padding-bottom: 5px;
        }
        .kv-label {
          font-size: 7.5pt;
          font-weight: 600;
          color: #6b6b6b;
          text-transform: uppercase;
          letter-spacing: .4px;
        }
        .kv-value {
          font-size: 10pt;
          color: #0f0f0f;
        }
        .kv-value.highlight {
            font-weight: 700;
            color: #2563eb;
        }

        /* ══ TABLES ══ */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9pt;
          margin-top: 8px;
        }
        .data-table th {
          background: #f0f0f0;
          font-weight: 700;
          text-align: left;
          padding: 8px 10px;
          border: 1px solid #c8c8c8;
          text-transform: uppercase;
          font-size: 8pt;
          color: #3a3a3a;
        }
        .data-table td {
          padding: 6px 10px;
          border: 1px solid #e4e4e4;
          vertical-align: middle;
          color: #0f0f0f;
        }
        .data-table tr.total-row td {
            background: #f8f9fa;
            font-weight: 700;
            border-top: 2px solid #333;
        }
        .text-right { text-align: right; }
        
        .summary-box {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
            margin-top: 18px;
        }
        
        .billing-card {
            border: 1px solid #e4e4e4;
            padding: 15px;
            border-radius: 6px;
        }
        
        .billing-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .billing-row:last-child {
            border-bottom: none;
            margin-top: 8px;
            padding-top: 10px;
            border-top: 2px solid #000;
            font-weight: 800;
            font-size: 12pt;
        }

        /* ══ SIGS ══ */
        .sigs { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 30px; }
        .sig-line {
          border-top: 1.5px solid #0f0f0f;
          width: 180px;
          text-align: center;
          padding-top: 8px;
          font-size: 9pt;
          color: #3a3a3a;
          font-weight: 600;
        }

        @media print {
          body * { visibility: hidden; }
          .report-modal-overlay, .report-modal-overlay * { visibility: visible; }
          .report-modal-overlay { 
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; 
            background: white !important; overflow: visible; z-index: 99999;
          }
          .modal-controls { display: none !important; }
          .report-print-container { background: white !important; margin: 0 !important; width: 210mm !important; }
          .page {
            width: 210mm !important; height: 296mm !important; margin: 0 !important; box-shadow: none !important;
            page-break-after: always !important; page-break-inside: avoid !important;
            border: none !important; padding: 15mm 15mm 15mm 15mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .page:last-child { page-break-after: auto !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <div className="modal-controls">
        <button className="control-btn print-btn" onClick={() => window.print()}>
          <i className="fa-solid fa-print"></i> Print Invoice
        </button>
        <button className="control-btn close-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i> Close
        </button>
      </div>

      <div className="report-print-container">
        {/* ══ PAGE 1: OVERVIEW & ROOM CHARGES ══ */}
        <div className="page">
          <PageHeader pageNum={1} title="OT Billing: Overview & Facility Charges" />

          <div className="page-content">
            <div className="section">
              <div className="section-title">1. Patient & Operation Information</div>
              <div className="kv-grid col4">
                <div className="kv"><span className="kv-label">Operation ID</span><span className="kv-value">OT-{data.operationExternalId?.toString().padStart(3, '0')}</span></div>
                <div className="kv"><span className="kv-label">Patient ID</span><span className="kv-value">PX-{data.patientExternalId?.toString().padStart(3, '0')}</span></div>
                <div className="kv"><span className="kv-label">Payment Status</span><span className="kv-value highlight">{(data.paymentStatus || 'PENDING').replace(/_/g, ' ')}</span></div>
                <div className="kv"><span className="kv-label">Billing Date</span><span className="kv-value">{formatDate(data.billingDate).split(',')[0]}</span></div>
              </div>
            </div>

            <div className="section">
              <div className="section-title">2. Financial Summary</div>
              <div className="summary-box">
                <div className="billing-card">
                  <div className="billing-row"><span>Gross Amount</span><span>{formatCurrency(data.grossAmount)}</span></div>
                  <div className="billing-row"><span>Total GST</span><span>{formatCurrency(data.totalGstAmount)}</span></div>
                  <div className="billing-row"><span>Total Discount</span><span style={{ color: '#dc2626' }}>- {formatCurrency(data.totalDiscountAmount)}</span></div>
                  <div className="billing-row"><span>Net Payable</span><span>{formatCurrency(data.totalAmount)}</span></div>
                </div>
                <div className="billing-card">
                  <div className="billing-row"><span>Total Balance</span><span>{formatCurrency(data.totalAmount)}</span></div>
                  <div className="billing-row"><span>Total Paid</span><span style={{ color: '#16a34a' }}>{formatCurrency(data.totalPaid)}</span></div>
                  <div className="billing-row"><span>Total Refunded</span><span>{formatCurrency(data.totalRefunded)}</span></div>
                  <div className="billing-row"><span>Due Amount</span><span style={{ color: '#dc2626' }}>{formatCurrency(data.due)}</span></div>
                </div>
              </div>
            </div>

            {roomCharges.length > 0 && (
                <div className="section">
                    <div className="section-title">3. Room & Facility Charges</div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Room / Facility Details</th>
                                <th>Duration</th>
                                <th>Rate/Hr</th>
                                <th className="text-right">GST</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roomCharges.map((room, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <strong>{room.roomName}</strong><br />
                                        <small style={{ color: '#666' }}>{formatDate(room.startTime).split(',')[0]} (Room #{room.roomNumber})</small>
                                    </td>
                                    <td>{room.durationMinutes} min ({(room.totalHours || 0).toFixed(2)}h)</td>
                                    <td>{formatCurrency(room.ratePerHour)}</td>
                                    <td className="text-right">{formatCurrency(room.gstAmount)} ({room.gstPercent || 0}%)</td>
                                    <td className="text-right">{formatCurrency(room.totalAmount)}</td>
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td colSpan="4" className="text-right">Subtotal Room Charges</td>
                                <td className="text-right">{formatCurrency(data.roomCharges.totalAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
          </div>

          <PageFooter pageNum={1} />
        </div>

        {/* ══ PAGE 2: ITEMISED CLINICAL CHARGES ══ */}
        <div className="page">
          <PageHeader pageNum={2} title="OT Billing: Itemized Clinical Charges" />

          <div className="page-content">
            {itemCharges.length > 0 ? (
                <div className="section">
                    <div className="section-title">4. Itemized Clinical Charges (Consumables & Implants)</div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th>Category</th>
                                <th>Qty x Unit Price</th>
                                <th className="text-right">GST</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemCharges.map((item, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <strong>{item.itemName}</strong><br />
                                        <small style={{ color: '#666' }}>{item.itemCode || 'Code: N/A'}</small>
                                    </td>
                                    <td><span style={{ fontSize: '7.5pt', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>{(item.itemType || 'ITEM').replace(/_/g, ' ')}</span></td>
                                    <td>{item.quantity} {item.unit || 'Units'} x {formatCurrency(item.unitPrice)}</td>
                                    <td className="text-right">{formatCurrency(item.gstAmount)} ({item.gstPercent || 0}%)</td>
                                    <td className="text-right">{formatCurrency(item.totalAmount)}</td>
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td colSpan="4" className="text-right">Subtotal Item Charges</td>
                                <td className="text-right">{formatCurrency(data.itemCharges.totalAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style={{ marginTop: '20px', fontSize: '8pt', color: '#666' }}>
                        * This includes all surgical consumables, implants, and anesthesia related medications used during the procedure.
                    </div>
                </div>
            ) : (
                <div style={{ padding: '50px', textAlign: 'center', color: '#999' }}>No itemized clinical charges applied.</div>
            )}
          </div>

          <PageFooter pageNum={2} />
        </div>

        {/* ══ PAGE 3: PAYMENT ACKNOWLEDGEMENT & SIGS ══ */}
        <div className="page">
          <PageHeader pageNum={3} title="OT Billing: Payment Acknowledgement" />

          <div className="page-content">
            {payments.length > 0 ? (
                <div className="section">
                    <div className="section-title">5. Payment History & Acknowledgement</div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Transaction Reference</th>
                                <th>Mode</th>
                                <th>Type</th>
                                <th>Payment Date</th>
                                <th className="text-right">Amount Received</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((pay, idx) => (
                                <tr key={idx}>
                                    <td>{pay.referenceNumber}</td>
                                    <td>{pay.paymentMode}</td>
                                    <td>{pay.paymentType}</td>
                                    <td>{formatDate(pay.paidAt)}</td>
                                    <td className="text-right" style={{ color: '#16a34a', fontWeight: '700' }}>{formatCurrency(pay.amount)}</td>
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td colSpan="4" className="text-right">Total Amount Settled Till Date</td>
                                <td className="text-right" style={{ color: '#16a34a' }}>{formatCurrency(data.totalPaid)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ padding: '50px', textAlign: 'center', color: '#999' }}>No payment records found for this statement.</div>
            )}

            <div className="section" style={{ marginTop: '30px' }}>
                <div className="section-title">Terms & Conditions</div>
                <ul style={{ fontSize: '8pt', color: '#555', paddingLeft: '20px' }}>
                    <li>This is a computer-generated invoice and does not require a physical signature if validated by the billing system.</li>
                    <li>All charges are based on the hospital's clinical protocols and approved rate-lists.</li>
                    <li>Any discrepancies must be reported within 24 hours of discharge.</li>
                    <li>GST is applied as per current healthcare taxation norms in India.</li>
                </ul>
            </div>
          </div>

          <div className="section" style={{ marginTop: 'auto', paddingBottom: '30px' }}>
            <div className="sigs">
               <div className="sig-line">Billing Executive<br /><small>Corporate Accounts</small></div>
               <div className="sig-line">Patient / Attendant<br /><small>(Acknowledgement)</small></div>
               <div className="sig-line">Authorised Signatory<br /><small>(Hospital Seal)</small></div>
            </div>
          </div>

          <PageFooter pageNum={3} />
        </div>
      </div>
    </div>
  );
};

export default BillingSummary;
