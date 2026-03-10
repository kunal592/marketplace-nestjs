import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ticket, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CouponsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Promotional Coupons</h1>
                    <p className="text-muted-foreground mt-1">Create logic thresholds increasing cart sizes through sales.</p>
                </div>
                <Dialog>
                    <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                        <Plus className="mr-2 h-4 w-4" /> Create Coupon
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Coupon</DialogTitle>
                            <DialogDescription>
                                Generate a new promotional code for your customers.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Coupon Code</Label>
                                <Input id="code" placeholder="SUMMER26" className="uppercase" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discount">Discount Percentage (%)</Label>
                                <Input id="discount" type="number" placeholder="20" />
                            </div>
                        </div>
                        <Button type="submit">Save Coupon</Button>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Discounts</CardTitle>
                    <CardDescription>Monitor live redemption rates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2].map((i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Ticket className="h-4 w-4 text-muted-foreground" />
                                            SUMMER{20 + i}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">PERCENTAGE</TableCell>
                                    <TableCell>{i * 10}% Off</TableCell>
                                    <TableCell>{12 * i} / {50 * i}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400">
                                            Active
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
