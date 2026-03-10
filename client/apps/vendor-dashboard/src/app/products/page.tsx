import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function ProductsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your catalog, inventory, and pricing.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                            Bulk Upload
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bulk Upload Products</DialogTitle>
                                <DialogDescription>Upload a CSV file containing your product catalog.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="csv">CSV File</Label>
                                    <Input id="csv" type="file" accept=".csv" />
                                </div>
                            </div>
                            <Button type="submit">Upload CSV</Button>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Product</DialogTitle>
                                <DialogDescription>Create a new product listing in your catalog.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input id="name" placeholder="Oversized Heavy Tee" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price ($)</Label>
                                        <Input id="price" type="number" placeholder="45.99" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input id="stock" type="number" placeholder="100" />
                                    </div>
                                </div>
                            </div>
                            <Button type="submit">Create Product</Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Catalog</CardTitle>
                            <CardDescription>View and manage all your active and pending products.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 max-w-sm w-full">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="search" placeholder="Search products..." className="pl-8 bg-zinc-50 dark:bg-zinc-900" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="w-12 h-12 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                                    </TableCell>
                                    <TableCell className="font-medium">Oversized Heavy Tee - Black</TableCell>
                                    <TableCell className="text-muted-foreground">Apparel</TableCell>
                                    <TableCell>
                                        <Badge variant={i === 2 ? 'secondary' : 'default'} className={i === 2 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'}>
                                            {i === 2 ? 'Pending Review' : 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${(45.99 + i).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{120 - (i * 10)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-muted-foreground">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Edit Product</DropdownMenuItem>
                                                <DropdownMenuItem>Manage Variants</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">Delete Product</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
