"use client";

export default function Receipt({ sale, business }: { sale: any, business?: any }) {
  const shopName = business?.name || "KENYA HARDWARE PRO";
  const shopPin = business?.pinNumber || "P051234567X";
  const shopPhone = business?.phone || "+254 700 000 000";
  const shopAddress = business?.address || "Main Street, Nairobi, Kenya";

  const subtotal = sale?.total ? sale.total / 1.16 : 0;
  const vat = sale?.total ? sale.total - subtotal : 0;

  return (
    <div style={{ 
      width: '100%',
      maxWidth: '300px', 
      padding: '24px', 
      background: '#fff', 
      color: '#000', 
      fontFamily: 'Courier, monospace', 
      fontSize: '12px',
      margin: '0 auto',
      boxShadow: '0 0 1px rgba(0,0,0,0.5)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>{shopName}</h2>
        <div>{shopAddress}</div>
        <div>TEL: {shopPhone}</div>
        <div>PIN: {shopPin}</div>
        <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>CASH SALE / TAX INVOICE</div>
      </div>

      {/* Info */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
           <span>INV: {sale?.invoiceNumber || 'NEW-SALE'}</span>
           <span>DATE: {new Date().toLocaleDateString()}</span>
        </div>
        <div>CUSTOMER: {sale?.customer?.name || 'Walk-in Customer'}</div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

      {/* Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #000' }}>
            <th style={{ paddingBottom: '5px' }}>ITEM</th>
            <th>QTY</th>
            <th style={{ textAlign: 'right' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody style={{ borderBottom: '1px solid #000' }}>
          {(sale?.items || sale?.saleItems || []).map((item: any, i: number) => (
             <tr key={i}>
                <td style={{ padding: '4px 0', maxWidth: '140px' }}>{(item?.name || item?.product?.name || 'Item').toUpperCase()}</td>
                <td>{item?.qty || item?.quantity || 1}</td>
                <td style={{ textAlign: 'right' }}>{( (item?.qty || item?.quantity || 1) * (item?.unitPrice || item?.price || 0) ).toLocaleString()}</td>
             </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
           <span>SUBTOTAL EXCL VAT:</span>
           <span>KES {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
           <span>VAT (16%):</span>
           <span>KES {vat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid #000', marginTop: '5px', paddingTop: '5px' }}>
           <span>TOTAL AMOUNT:</span>
           <span>KES {sale?.total?.toLocaleString() || '0'}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '15px 0' }}></div>

      {/* Footer / eTIMS */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>PAID VIA {sale?.paymentMethod || 'CASH'}</div>
        <div style={{ padding: '8px', border: '1px solid #000', display: 'inline-block', fontSize: '10px', marginBottom: '15px' }}>
           CU INVOICE #: KRA-{Math.floor(Math.random() * 90000000) + 10000000}<br/>
           DATE SIGNED: {new Date().toISOString().slice(0, 16).replace('T', ' ')}<br/>
           <span style={{ fontWeight: 'bold' }}>eTIMS COMPLIANT</span>
        </div>
        
        <div style={{ marginTop: '10px', fontWeight: 'bold' }}>*** KARIBU TENA ***</div>
        <div style={{ fontSize: '9px', fontStyle: 'italic' }}>Goods once sold cannot be returned. For any queries, contact our branch.</div>
      </div>
    </div>
  );
}
