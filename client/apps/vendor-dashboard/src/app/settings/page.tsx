import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Store, User, CreditCard, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your store preferences, payouts, and notifications.</p>
            </div>

            <Tabs defaultValue="store" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
                    <TabsTrigger value="store" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 data-[state=active]:bg-transparent">
                        <Store className="h-4 w-4 mr-2" /> Store Details
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 data-[state=active]:bg-transparent">
                        <User className="h-4 w-4 mr-2" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="payouts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 data-[state=active]:bg-transparent">
                        <CreditCard className="h-4 w-4 mr-2" /> Payout Methods
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 data-[state=active]:bg-transparent">
                        <Bell className="h-4 w-4 mr-2" /> Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="store" className="pt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Store Information</CardTitle>
                            <CardDescription>Update your public-facing storefront details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="storeName">Store Name</Label>
                                <Input id="storeName" defaultValue="Spider Knits Studio" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="storeUrl">Store URL Slug</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm bg-zinc-100 dark:bg-zinc-900 border px-3 py-2 rounded-md">spiderknits.com/vendors/</span>
                                    <Input id="storeUrl" defaultValue="spider-knits-studio" className="flex-1" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="storeDesc">Store Description</Label>
                                <textarea
                                    id="storeDesc"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    defaultValue="Premium streetwear and accessories sourced globally."
                                />
                            </div>
                            <Button>Save Store Changes</Button>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Temporarily pause your store or permanently delete your vendor account. This action cannot be undone.</p>
                            <div className="flex gap-4">
                                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">Pause Store</Button>
                                <Button variant="destructive">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profile" className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Manage your contact and login credentials.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" defaultValue="Kunal" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" defaultValue="Designer" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue="kunal@example.com" disabled />
                                <p className="text-xs text-muted-foreground">Contact support to change your primary email.</p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input id="password" type="password" />
                            </div>
                            <Button>Update Profile</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payouts" className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bank Account Integration</CardTitle>
                            <CardDescription>Where should we send your money?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="border p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">CH</div>
                                    <div>
                                        <p className="font-medium">Chase Checkings</p>
                                        <p className="text-sm text-muted-foreground">**** **** **** 4592</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                            </div>
                            <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Add New Bank Account</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Control what alerts you receive.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">New Order Alerts</p>
                                        <p className="text-sm text-muted-foreground">Receive emails when a customer places an order.</p>
                                    </div>
                                    <div className="h-6 w-11 rounded-full bg-primary flex items-center justify-end px-1 cursor-pointer">
                                        <div className="h-4 w-4 rounded-full bg-white shadow-sm"></div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Payout Confirmations</p>
                                        <p className="text-sm text-muted-foreground">Get notified when a bank transfer completes.</p>
                                    </div>
                                    <div className="h-6 w-11 rounded-full bg-primary flex items-center justify-end px-1 cursor-pointer">
                                        <div className="h-4 w-4 rounded-full bg-white shadow-sm"></div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Low Stock Warnings</p>
                                        <p className="text-sm text-muted-foreground">Daily digest of products running low on inventory.</p>
                                    </div>
                                    <div className="h-6 w-11 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-start px-1 cursor-pointer">
                                        <div className="h-4 w-4 rounded-full bg-white shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Dummy standard component for inline error resolution in snippet
function Plus({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
}
