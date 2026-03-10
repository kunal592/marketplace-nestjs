import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ticket, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CouponsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Promotional Coupons</h1>
                    <p className="text-muted-foreground mt-1">Create logic thresholds increasing cart sizes through sales.</p>
                </div>
                <Button><Plus className="mr-2 h-4 w-4" /> Create Coupon</Button>
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
