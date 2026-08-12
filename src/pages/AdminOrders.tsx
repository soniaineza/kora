import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n';
import { getApiBase } from '../lib/api';

type Order = {
  tx_ref: string;
  phone_number: string;
  package_key: string;
  amount_rwf: number;
  status: string;
  created_at: string;
};

export function AdminOrders() {
  const { language } = useLanguage();
  const apiBase = getApiBase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const t = {
    title: language === 'rw' ? 'Amagakururu' : language === 'fr' ? 'Commandes' : 'Orders',
    pending: language === 'rw' ? 'Adategereje gushyirwa' : language === 'fr' ? 'En attente' : 'Pending',
    all: language === 'rw' ? 'Yose' : language === 'fr' ? 'Tous' : 'All',
    ref: language === 'rw' ? 'Umubare' : language === 'fr' ? 'Référence' : 'Reference',
    phone: language === 'rw' ? 'Telefone' : language === 'fr' ? 'Téléphone' : 'Phone',
    package: language === 'rw' ? 'Paketi' : language === 'fr' ? 'Forfait' : 'Package',
    amount: language === 'rw' ? 'Amafaranga' : language === 'fr' ? 'Montant' : 'Amount',
    date: language === 'rw' ? 'Igihe' : language === 'fr' ? 'Date' : 'Date',
    status: language === 'rw' ? 'Ibyerekanwa' : language === 'fr' ? 'Statut' : 'Status',
    activate: language === 'rw' ? 'Yemeza' : language === 'fr' ? 'Activer' : 'Activate',
    cancel: language === 'rw' ? 'Kuraho' : language === 'fr' ? 'Annuler' : 'Cancel',
    activating: language === 'rw' ? 'Bikorwa...' : language === 'fr' ? 'Activation...' : 'Activating...',
    noData: language === 'rw' ? 'Nta magakururu ahari' : language === 'fr' ? 'Aucune commande' : 'No orders',
    hint:
      language === 'rw'
        ? 'Yemeza agakururu nyuma yuko umukiriya ashishyuye. Paketi izabona ako kanya.'
        : language === 'fr'
          ? 'Activez une commande une fois le client payé. Le forfait se débloque immédiatement.'
          : 'Activate an order once the customer has paid. The package is unlocked instantly.',
  };

  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  async function fetchOrders() {
    try {
      const token = localStorage.getItem('kora-jwt');
      if (!token) { setError('Not authenticated'); return; }

      const q = filter === 'pending' ? '?status=pending' : '';
      const res = await fetch(`${apiBase}/api/admin/payments/orders${q}`, {
        headers: { Authorization: `Bearer ${token}`, 'x-admin-demo': '1' }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setOrders(json.orders || []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, filter]);

  async function runAction(txRef: string, action: 'activate' | 'cancel') {
    setBusy(txRef);
    setError(null);
    try {
      const token = localStorage.getItem('kora-jwt');
      const res = await fetch(`${apiBase}/api/admin/payments/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-admin-demo': '1'
        },
        body: JSON.stringify({ txRef })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Action failed (${res.status})`);
      await fetchOrders();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.hint}</p>
        </div>
        <div className="inline-flex rounded-full border border-border bg-background p-1 text-sm">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-1.5 rounded-full font-medium transition-colors ${filter === 'pending' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.pending}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full font-medium transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.all}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-20">Loading...</div>
      ) : (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="p-4 font-medium">{t.ref}</th>
                <th className="p-4 font-medium">{t.phone}</th>
                <th className="p-4 font-medium">{t.package}</th>
                <th className="p-4 font-medium text-right">{t.amount}</th>
                <th className="p-4 font-medium">{t.date}</th>
                <th className="p-4 font-medium">{t.status}</th>
                <th className="p-4 font-medium text-right">{t.activate}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.tx_ref} className={`border-t ${i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                  <td className="p-4 font-mono text-xs">{o.tx_ref}</td>
                  <td className="p-4">{o.phone_number}</td>
                  <td className="p-4 font-medium">{o.package_key}</td>
                  <td className="p-4 text-right font-mono">{o.amount_rwf?.toLocaleString()}</td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {o.created_at ? new Date(o.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      o.status === 'successful'
                        ? 'bg-green-500/15 text-green-500'
                        : o.status === 'cancelled' || o.status === 'failed'
                          ? 'bg-red-500/15 text-red-500'
                          : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {o.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => runAction(o.tx_ref, 'cancel')}
                          disabled={busy === o.tx_ref}
                          className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {t.cancel}
                        </button>
                        <button
                          onClick={() => runAction(o.tx_ref, 'activate')}
                          disabled={busy === o.tx_ref}
                          className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          {busy === o.tx_ref ? t.activating : t.activate}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    {t.noData}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}