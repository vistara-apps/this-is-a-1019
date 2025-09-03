import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { FileText, Download, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '../../services/supabase';

const BillingHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showError } = useUI();

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch invoices from Supabase
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('userId', user.id)
          .order('created', { ascending: false });
        
        if (error) throw error;
        
        setInvoices(data || []);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        showError('Failed to load billing history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, [user, showError]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return (amount / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            Paid
          </span>
        );
      case 'open':
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            Pending
          </span>
        );
      case 'uncollectible':
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-white/20 text-white/70 text-xs rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Billing History</h1>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/10 rounded-full p-3 inline-flex mb-4">
              <FileText size={24} className="text-white/70" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No billing history</h3>
            <p className="text-white/70">
              You don't have any invoices yet. They will appear here once you subscribe to a paid plan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-white font-medium">Description</th>
                  <th className="text-left py-3 px-4 text-white font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-white font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-white font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/10">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-white/50 mr-2" />
                        <span className="text-white">{formatDate(invoice.created)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <CreditCard size={16} className="text-white/50 mr-2" />
                        <span className="text-white">{invoice.description || 'Subscription Payment'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white font-medium">
                      {formatAmount(invoice.amount)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {invoice.invoiceUrl && (
                        <a
                          href={invoice.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                        >
                          <Download size={16} className="mr-1" />
                          PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingHistory;

