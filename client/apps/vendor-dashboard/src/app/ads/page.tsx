import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, Plus } from 'lucide-react';

export default function AdsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Advertising Hub</h1>
                    <p className="text-muted-foreground mt-1">Boost product visibility directly utilizing wallet balances.</p>
                </div>
                <Button><Plus className="mr-2 h-4 w-4" /> New Campaign</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Active Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-zinc-50/50 dark:bg-zinc-900/10 space-y-4">
                            <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center">
                                <Megaphone className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">No active ads running</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mt-1">Deploy campaigns to push your products to the top of category lists natively.</p>
                            </div>
                            <Button variant="outline" className="mt-4">Allocate Budget</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Wallet Balances</CardTitle>
                        <CardDescription>Required for campaign bidding.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Balance</p>
                            <p className="text-4xl font-bold tracking-tight mt-1">$1,240.50</p>
                        </div>
                        <div className="space-y-2 border-t pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Active Ad Spend</span>
                                <span className="font-medium">$0.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pending Payouts</span>
                                <span className="font-medium">$500.00</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
