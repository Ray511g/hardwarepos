"use client";

export default function Receipt({ sale, business }: { sale: any, business?: any }) {
  const shopName = business?.name || "KENYA HARDWARE PRO";
  const shopPin = business?.pinNumber || "P051234567X";
  const shopPhone = business?.phone || "+254 700 000 000";

  return (
    <div style={{ 
      width: '300px', 
      padding: '20px', 
      background: 'white', 
      color: 'black', 
      fontFamily: 'monospace', 
      fontSize: '12px',
      margin: '0 auto',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>{shopName}</h2>
        <div>{business?.address || "Main Street, Nairobi, Kenya"}</div>
        <div>Tel: {shopPhone}</div>
        <div>PIN: {shopPin}</div>
        <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />
        <div style={{ fontWeight: 'bold' }}>TAX INVOICE</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Invoice: #2045</span>
        <span>Date: 2024-03-01</span>
      </div>
      <div>Customer: John Kamau</div>
      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      <table style={{ width: '100%', marginBottom: '10px' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cement Bags</td>
            <td>4</td>
            <td>950</td>
            <td style={{ textAlign: 'right' }}>3,800</td>
          </tr>
          <tr>
            <td>Nails (Kg)</td>
            <td>2</td>
            <td>150</td>
            <td style={{ textAlign: 'right' }}>300</td>
          </tr>
        </tbody>
      </table>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>SUBTOTAL:</span>
        <span>Kes 3,534.48</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>VAT (16%):</span>
        <span>Kes 565.52</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
        <span>TOTAL:</span>
        <span>Kes 4,100.00</span>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '10px 0' }} />
      
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '5px' }}>Payment Method: M-PESA</div>
        <div style={{ marginBottom: '10px' }}>Ref: SDK9842JK</div>
        
        <div style={{ background: '#eee', padding: '10px', fontSize: '10px' }}>
          CU Invoice #: KRA-98234123<br/>
          Signed for KRA eTIMS
        </div>
        
        <div style={{ marginTop: '10px' }}>*** Thank You ***</div>
        <div>Goods once sold aren't returnable</div>
      </div>
    </div>
  );
}
