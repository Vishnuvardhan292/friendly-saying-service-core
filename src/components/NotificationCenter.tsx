import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { 
  Bell, 
  AlertTriangle, 
  CloudRain, 
  Calendar,
  CheckCircle,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  type: 'weather_alert' | 'task_reminder' | 'disease_alert' | 'system' | 'harvest_reminder';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  created_at: string;
  data?: any;
}

const NotificationCenter = () => {
  const { user } = useAuthProtection();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // For now, just show demo notifications until types are generated
      const demoNotifications: Notification[] = [
        {
          id: '1',
          user_id: user?.id || '',
          type: 'weather_alert',
          title: 'Heavy Rain Alert',
          message: 'Heavy rain expected in your area. Consider protecting your crops.',
          severity: 'high',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: '2', 
          user_id: user?.id || '',
          type: 'task_reminder',
          title: 'Fertilizer Application Due',
          message: 'Time to apply fertilizer to your tomato crops.',
          severity: 'medium',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          user_id: user?.id || '',
          type: 'harvest_reminder',
          title: 'Harvest Ready',
          message: 'Your tomatoes are ready for harvest. Check field section A.',
          severity: 'medium',
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        }
      ];
      setNotifications(demoNotifications);
      setUnreadCount(demoNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for high priority notifications
          if (newNotification.severity === 'high' || newNotification.severity === 'critical') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: newNotification.severity === 'critical' ? "destructive" : "default"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback for demo
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Fallback for demo
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      toast({
        title: "Demo Mode",
        description: "All notifications marked as read"
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Fallback for demo
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const getNotificationIcon = (type: string, severity: string) => {
    switch (type) {
      case 'weather_alert':
        return severity === 'critical' ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'task_reminder':
        return <Calendar className="w-5 h-5 text-primary" />;
      case 'disease_alert':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'harvest_reminder':
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-full mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">We'll notify you about important updates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-colors ${!notification.is_read ? 'border-primary bg-primary/5' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type, notification.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={getSeverityColor(notification.severity)} className="text-xs">
                                {notification.severity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;