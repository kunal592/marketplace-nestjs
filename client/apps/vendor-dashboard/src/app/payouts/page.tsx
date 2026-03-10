import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PayoutsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payout Management</h1>
                    <p className="text-muted-foreground mt-1">Withdraw available funds to your linked bank account securely.</p>
                </div>
                <Dialog>
                    <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                        <Wallet className="mr-2 h-4 w-4" /> Request Payout
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Request Payout</DialogTitle>
                            <DialogDescription>
                                Enter the amount you wish to withdraw to your linked bank account.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount ($)</Label>
                                <Input id="amount" type="number" defaultValue="1240.50" />
                            </div>
                        </div>
                        <Button type="submit">Confirm Withdrawal</Button>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-primary text-primary-foreground border-transparent">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-90">Available for Payout</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">$1,240.50</div>
                        <p className="text-sm mt-1 opacity-80">Ready to transfer to bank ending in ****4592</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Clearance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">$540.00</div>
                        <p className="text-sm mt-1 text-muted-foreground">Awaiting delivery verification</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        <CardTitle>Transfer History</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3].map((i) => (
                                <TableRow key={i}>
                                    <TableCell className="text-muted-foreground">Mar {15 - i}, 2026</TableCell>
                                    <TableCell className="font-medium">${(400 * i).toFixed(2)}</TableCell>
                                    <TableCell className="text-muted-foreground">Bank Account (****4592)</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            i === 1 ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-400' :
                                                'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400'
                                        }>
                                            {i === 1 ? 'Processing' : 'Completed'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
