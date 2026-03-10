import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">Manage and fulfill your customer orders.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Orders</CardTitle>
                            <CardDescription>Track state and fulfillment tracking.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full max-w-xs">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="search" placeholder="Search order ID..." className="pl-8 bg-zinc-50 dark:bg-zinc-900" />
                            </div>
                            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium whitespace-nowrap">EXT-ORD-{10000 + i}</TableCell>
                                    <TableCell className="text-muted-foreground">Mar {10 + i}, 2026</TableCell>
                                    <TableCell>customer_{i}@example.com</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            i === 1 ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-400' :
                                                i === 2 ? 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400' :
                                                    'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400'
                                        }>
                                            {i === 1 ? 'CREATED' : i === 2 ? 'PROCESSING' : 'SHIPPED'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${(120.50 * i).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
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
