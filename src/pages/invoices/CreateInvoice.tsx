import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Save, Send, ChevronLeft,
  Calculator, User, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { invoicesApi, leadsApi } from '@/services/api';
import { toast } from 'sonner';
import type { Lead } from '@/types';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export function CreateInvoice() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [invoice, setInvoice] = useState({
    customer: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
    leadId: '',
    items: [
      { description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 },
    ] as InvoiceItem[],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    currency: 'USD',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms: '',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [invoice.items, invoice.discount]);

  const fetchLeads = async () => {
    try {
      const response = await leadsApi.getLeads({ status: 'won' });
      setLeads(response.data.data?.leads || []);
    } catch (error) {
      toast.error('Failed to load leads');
    }
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((acc, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = itemTotal * (item.discount / 100);
      const itemTax = (itemTotal - itemDiscount) * (item.tax / 100);
      item.total = itemTotal - itemDiscount + itemTax;
      return acc + item.total;
    }, 0);

    const discountAmount = subtotal * (invoice.discount / 100);
    const total = subtotal - discountAmount;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      total,
    }));
  };

  const handleAddItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find(l => l._id === leadId);
    if (lead) {
      setInvoice(prev => ({
        ...prev,
        leadId: lead._id,
        customer: {
          name: lead.name,
          email: lead.email || '',
          phone: lead.phone || '',
          address: {
            street: lead.address?.street || prev.customer.address.street,
            city: lead.address?.city || prev.customer.address.city,
            state: lead.address?.state || prev.customer.address.state,
            zipCode: lead.address?.zipCode || prev.customer.address.zipCode,
            country: lead.address?.country || prev.customer.address.country,
          },
        },
      }));
    }
  };

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    if (invoice.items.length === 0 || !invoice.items[0].description) {
      toast.error('Please add at least one item');
      return;
    }
    if (!invoice.customer.name) {
      toast.error('Please select a customer');
      return;
    }

    try {
      setLoading(true);
      await invoicesApi.createInvoice({ ...invoice, status });
      toast.success(status === 'draft' ? 'Invoice saved as draft' : 'Invoice sent successfully');
      navigate('/invoices');
    } catch (error) {
      toast.error('Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/invoices')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Invoice</h1>
            <p className="text-gray-500">Create a new invoice for your customer</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button onClick={() => handleSave('sent')} disabled={loading}>
            <Send className="mr-2 h-4 w-4" />
            Send Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Lead/Customer</Label>
                <Select value={invoice.leadId} onValueChange={handleLeadSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead._id} value={lead._id}>
                        {lead.name} - {lead.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input 
                    value={invoice.customer.name}
                    onChange={(e) => setInvoice(prev => ({ 
                      ...prev, 
                      customer: { ...prev.customer, name: e.target.value }
                    }))}
                    placeholder="Customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={invoice.customer.email}
                    onChange={(e) => setInvoice(prev => ({ 
                      ...prev, 
                      customer: { ...prev.customer, email: e.target.value }
                    }))}
                    placeholder="customer@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={invoice.customer.phone}
                    onChange={(e) => setInvoice(prev => ({ 
                      ...prev, 
                      customer: { ...prev.customer, phone: e.target.value }
                    }))}
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Item #{index + 1}</span>
                    {invoice.items.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (%)</Label>
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax (%)</Label>
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        value={item.tax}
                        onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm text-gray-500">Item Total: </span>
                    <span className="font-medium">${item.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={handleAddItem} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={invoice.notes}
                  onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the customer..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea 
                  value={invoice.terms}
                  onChange={(e) => setInvoice(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Payment terms and conditions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input 
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => setInvoice(prev => ({ ...prev, issueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={invoice.currency} 
                  onValueChange={(value) => setInvoice(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Discount</span>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    value={invoice.discount}
                    onChange={(e) => setInvoice(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-20"
                  />
                  <span>%</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${invoice.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
