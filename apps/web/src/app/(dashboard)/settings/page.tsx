'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, Bell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';

export default function SettingsPage() {
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [body, setBody] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [targetRole, setTargetRole] = useState<'customer' | 'office_admin' | ''>('');
  const [success, setSuccess] = useState('');

  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ['notification-history'],
    queryFn: () => adminApi.getNotificationHistory(1, 5),
  });

  const sendNotification = useMutation({
    mutationFn: () =>
      adminApi.sendNotification({
        title,
        body,
        titleAr: titleAr || undefined,
        bodyAr: bodyAr || undefined,
        targetRole: targetRole || undefined,
      }),
    onSuccess: (data) => {
      setSuccess(`Notification sent to ${data.data.sent} users`);
      setTitle('');
      setTitleAr('');
      setBody('');
      setBodyAr('');
      refetchHistory();
      setTimeout(() => setSuccess(''), 3000);
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && body) {
      sendNotification.mutate();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Platform settings and notifications
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mass Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
            <CardDescription>
              Send push notifications to all users or specific roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Title (English)</label>
                  <Input
                    placeholder="Notification title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Title (Arabic)</label>
                  <Input
                    placeholder="عنوان الإشعار"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Message (English)</label>
                  <textarea
                    placeholder="Notification message"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message (Arabic)</label>
                  <textarea
                    placeholder="نص الإشعار"
                    value={bodyAr}
                    onChange={(e) => setBodyAr(e.target.value)}
                    className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    dir="rtl"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as 'customer' | 'office_admin' | '')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Users</option>
                  <option value="customer">Customers Only</option>
                  <option value="office_admin">Offices Only</option>
                </select>
              </div>
              {success && (
                <p className="text-sm text-green-600">{success}</p>
              )}
              <Button
                type="submit"
                disabled={sendNotification.isPending || !title || !body}
              >
                <Send className="mr-2 h-4 w-4" />
                {sendNotification.isPending ? 'Sending...' : 'Send Notification'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>Last 5 sent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {historyData?.data.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notifications sent yet
              </p>
            ) : (
              <div className="space-y-3">
                {historyData?.data.items.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="font-medium">{notification.title}</span>
                        {notification.targetRole && (
                          <Badge variant="outline" className="text-xs">
                            {notification.targetRole === 'customer'
                              ? 'Customers'
                              : 'Offices'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {notification.body}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{notification.sentCount} sent</div>
                      <div>{formatDate(notification.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>Configure platform-wide settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">
                  Disable access for all users except admins
                </p>
              </div>
              <Button variant="outline" size="sm">
                Disabled
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">New Registrations</p>
                <p className="text-sm text-muted-foreground">
                  Allow new user sign-ups
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">CV Unlock Price</p>
                <p className="text-sm text-muted-foreground">
                  Default price for unlocking CVs
                </p>
              </div>
              <span className="font-medium">99 AED</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
