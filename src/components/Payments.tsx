"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Wallet, CreditCard, Workflow, WalletMinimal, Coins, Receipt, Nfc, SquareTerminal, BadgeIndianRupee, ReceiptEuro, ReceiptCent, ShoppingBag, ReceiptIndianRupee } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'bank';
  last4: string;
  brand?: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  type: 'charge' | 'payout' | 'refund';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: string;
  taskId?: string;
  fees: number;
}

interface EarningsData {
  available: number;
  pending: number;
  held: number;
  currency: string;
}

export default function Payments() {
  const [activeTab, setActiveTab] = useState('payment');
  const [userRole, setUserRole] = useState<'user' | 'helper'>('user');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earnings, setEarnings] = useState<EarningsData>({
    available: 0,
    pending: 0,
    held: 0,
    currency: 'USD'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    taskId: '',
    promoCode: '',
    confirmPayment: false
  });

  // Refund form state
  const [refundForm, setRefundForm] = useState({
    transactionId: '',
    reason: '',
    amount: ''
  });

  // Payout form state
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    method: '',
    schedule: 'manual'
  });

  useEffect(() => {
    // Mock data initialization
    setPaymentMethods([
      { id: '1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
      { id: '2', type: 'wallet', last4: 'wallet', isDefault: false }
    ]);

    setTransactions([
      {
        id: 'txn_1',
        type: 'charge',
        amount: 85.00,
        currency: 'USD',
        status: 'completed',
        description: 'House cleaning service',
        date: '2024-01-15',
        taskId: 'task_123',
        fees: 3.50
      },
      {
        id: 'txn_2',
        type: 'payout',
        amount: 72.50,
        currency: 'USD',
        status: 'pending',
        description: 'Weekly payout',
        date: '2024-01-14',
        fees: 2.25
      }
    ]);

    setEarnings({
      available: 245.75,
      pending: 72.50,
      held: 0,
      currency: 'USD'
    });
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Payment processed successfully');
      setPaymentForm({ amount: '', taskId: '', promoCode: '', confirmPayment: false });
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Refund processed successfully');
      setShowRefundModal(false);
      setRefundForm({ transactionId: '', reason: '', amount: '' });
    } catch (error) {
      toast.error('Refund processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayout = async () => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Payout request submitted');
      setShowPayoutModal(false);
      setPayoutForm({ amount: '', method: '', schedule: 'manual' });
    } catch (error) {
      toast.error('Payout request failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateFees = (amount: number) => {
    return (amount * 0.029 + 0.30).toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'charge': return <Receipt className="h-4 w-4" />;
      case 'payout': return <Coins className="h-4 w-4" />;
      case 'refund': return <ReceiptCent className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Switcher */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Tabs value={userRole} onValueChange={(value) => setUserRole(value as 'user' | 'helper')}>
          <TabsList>
            <TabsTrigger value="user">User View</TabsTrigger>
            <TabsTrigger value="helper">Helper View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {userRole === 'user' ? (
        /* USER VIEW */
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payment">Make Payment</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="space-y-6">
            {/* Payment Flow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Secure Payment
                </CardTitle>
                <CardDescription>
                  Complete your payment securely. Funds are held in escrow until task completion.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskId">Task ID</Label>
                    <Input
                      id="taskId"
                      placeholder="task_123"
                      value={paymentForm.taskId}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, taskId: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex items-center gap-2">
                            {method.type === 'card' ? <CreditCard className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                            {method.brand} •••• {method.last4}
                            {method.isDefault && <Badge variant="secondary">Default</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                  <Input
                    id="promoCode"
                    placeholder="Enter code"
                    value={paymentForm.promoCode}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, promoCode: e.target.value }))}
                  />
                </div>

                {/* Fee Breakdown */}
                {paymentForm.amount && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${paymentForm.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Fee</span>
                          <span>${calculateFees(parseFloat(paymentForm.amount))}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${(parseFloat(paymentForm.amount) + parseFloat(calculateFees(parseFloat(paymentForm.amount)))).toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="confirm" 
                    checked={paymentForm.confirmPayment}
                    onCheckedChange={(checked) => setPaymentForm(prev => ({ ...prev, confirmPayment: checked }))}
                  />
                  <Label htmlFor="confirm" className="text-sm">
                    I confirm this payment and authorize the charge
                  </Label>
                </div>

                <Button 
                  onClick={handlePayment} 
                  disabled={!paymentForm.confirmPayment || isProcessing || !selectedPaymentMethod}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Workflow className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay $${paymentForm.amount || '0.00'}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods" className="space-y-6">
            {/* Payment Methods */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payment Methods</h3>
              <Button onClick={() => setShowAddPayment(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Add Method
              </Button>
            </div>

            <div className="grid gap-4">
              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {method.type === 'card' ? <CreditCard className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                        <div>
                          <p className="font-medium">{method.brand} •••• {method.last4}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.type === 'card' ? 'Credit Card' : 'Digital Wallet'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && <Badge>Default</Badge>}
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="refunds" className="space-y-6">
            {/* Refunds */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Refunds & Disputes</h3>
              <Button onClick={() => setShowRefundModal(true)}>
                <ReceiptCent className="mr-2 h-4 w-4" />
                Request Refund
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Refund Eligibility</CardTitle>
                <CardDescription>
                  Refunds are automatically processed for cancelled tasks within 24 hours of payment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">House cleaning - Task #123</p>
                      <p className="text-sm text-muted-foreground">Paid $85.00 • Eligible for instant refund</p>
                    </div>
                    <Button size="sm">Refund</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Transaction History */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Transaction History</h3>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="charge">Charges</SelectItem>
                    <SelectItem value="refund">Refunds</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Receipt className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(txn.type)}
                          {txn.type}
                        </div>
                      </TableCell>
                      <TableCell>{txn.description}</TableCell>
                      <TableCell>${txn.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(txn.status)}>{txn.status}</Badge>
                      </TableCell>
                      <TableCell>{txn.date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* HELPER VIEW */
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="space-y-6">
            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${earnings.available.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Ready for payout</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    ${earnings.pending.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Processing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">On Hold</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${earnings.held.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Temporary hold</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Payout</CardTitle>
                <CardDescription>
                  Request instant payout to your connected bank account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payoutAmount">Amount</Label>
                  <Input
                    id="payoutAmount"
                    type="number"
                    placeholder="0.00"
                    max={earnings.available}
                  />
                </div>
                <Button onClick={() => setShowPayoutModal(true)} className="w-full">
                  <Coins className="mr-2 h-4 w-4" />
                  Request Payout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            {/* Payout Methods */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payout Methods</h3>
              <Button variant="outline">
                <WalletMinimal className="mr-2 h-4 w-4" />
                Add Bank Account
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bank Account</CardTitle>
                <CardDescription>Primary payout method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <WalletMinimal className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Chase Bank •••• 1234</p>
                      <p className="text-sm text-muted-foreground">Checking Account</p>
                    </div>
                  </div>
                  <Badge>Verified</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automatic Payouts</CardTitle>
                <CardDescription>
                  Set up automatic transfers when your balance reaches a threshold
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="autopayout" />
                  <Label htmlFor="autopayout">Enable automatic payouts</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Minimum Amount</Label>
                    <Input placeholder="$50.00" />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Earnings Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Track your earnings performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>30 Days</span>
                    <span className="font-semibold">$1,245.50</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>90 Days</span>
                    <span className="font-semibold">$3,678.25</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>365 Days</span>
                    <span className="font-semibold">$12,890.75</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fee Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Platform Fee (5%)</span>
                    <span>$64.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Processing</span>
                    <span>$18.75</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Fees</span>
                    <span>$83.25</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Helper Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All your earnings and payout transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(txn.type)}
                            {txn.type}
                          </div>
                        </TableCell>
                        <TableCell>{txn.description}</TableCell>
                        <TableCell>${txn.amount.toFixed(2)}</TableCell>
                        <TableCell>${txn.fees.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(txn.status)}>{txn.status}</Badge>
                        </TableCell>
                        <TableCell>{txn.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Refund Modal */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              Submit a refund request for a completed transaction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                placeholder="txn_123456"
                value={refundForm.transactionId}
                onChange={(e) => setRefundForm(prev => ({ ...prev, transactionId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                placeholder="0.00"
                value={refundForm.amount}
                onChange={(e) => setRefundForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Refund</Label>
              <Textarea
                id="reason"
                placeholder="Please describe why you're requesting a refund..."
                value={refundForm.reason}
                onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Submit Refund Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Modal */}
      <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Transfer your available balance to your bank account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payoutAmountModal">Amount</Label>
              <Input
                id="payoutAmountModal"
                type="number"
                placeholder="0.00"
                max={earnings.available}
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm(prev => ({ ...prev, amount: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Available: ${earnings.available.toFixed(2)}
              </p>
            </div>
            <div>
              <Label>Payout Method</Label>
              <Select value={payoutForm.method} onValueChange={(value) => setPayoutForm(prev => ({ ...prev, method: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payout method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank1">Chase Bank •••• 1234</SelectItem>
                  <SelectItem value="bank2">Wells Fargo •••• 5678</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayout} disabled={isProcessing || !payoutForm.method}>
              {isProcessing ? 'Processing...' : 'Request Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}