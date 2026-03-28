import React, { useState } from 'react';

// Legacy Checkout Component
// - 沒有 Try/Catch 抓非預期錯誤
// - 缺乏 Timeout 機制
// - Axios 不在，直接用原生 fetch 卻沒檢查 response.ok
export default function LegacyCheckoutButton(props) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const handleCheckout = async () => {
        setLoading(true);
        // 這邊假裝發送 API 請求，但 API Endpoint 已經壞了會報 501
        // 注意：原開發者忘了加 try-catch，如果是 501，fetch 其實不會丟出異常 (它只會在網路斷線時 throws)
        // 可是如果遇到真正的 exceptions，loading 狀態也不會解開，導致畫面永久卡死轉圈。
        fetch('/api/v1/legacy-checkout', {
            method: 'POST',
            body: JSON.stringify(props.cartData)
        }).then(res => {
            if (res.status === 501) {
                // 原開發者只印了 console.log，卻沒有解除 loading 狀態，
                // 而是依賴另一個神奇的 EventListener 去攔截 501 並顯示 Error Toast。
                // 這導致按鈕永遠處於 disabled 轉圈狀態。
                console.log("Not Implemented: 501");
                // 故意不 setLoading(false)
                // 觸發全域錯誤 Toast
                window.dispatchEvent(new CustomEvent('SHOW_GLOBAL_ERROR', { detail: { code: 501 }}));
            } else {
                return res.json();
            }
        }).then(data => {
            if(data) {
                setLoading(false);
                window.location.href = '/success';
            }
        });
    };

    return (
        <div className="checkout-container">
            <h3>Total: ${props.total}</h3>
            <button 
                onClick={handleCheckout} 
                disabled={loading}
                className={loading ? 'btn-spinning' : 'btn-primary'}
            >
                {loading ? 'Processing...' : 'Submit Order'}
            </button>
            {/* 注意：這個元件內部根本沒渲染錯誤，錯誤是靠全域監聽器丟在右上角的 */}
        </div>
    );
}
