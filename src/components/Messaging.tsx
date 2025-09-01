"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  MessageSquare, 
  MessageSquarePlus, 
  MessageSquareMore,
  MessageSquareDot,
  MessagesSquare,
  MessageCircleMore,
  MessageCircleOff,
  MessageSquareLock,
  MessageSquareText,
  MessageSquareHeart,
  MessageSquareShare,
  Speech
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'voice';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  reactions?: Array<{
    emoji: string;
    userId: string;
  }>;
  edited?: boolean;
  editedAt?: Date;
}

interface Conversation {
  id: string;
  type: 'direct' | 'support' | 'group';
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'user' | 'helper' | 'admin';
    online: boolean;
    lastSeen?: Date;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  pinned: boolean;
  muted: boolean;
  title?: string;
}

interface Notification {
  id: string;
  type: 'task_update' | 'payment' | 'dispute' | 'message' | 'system';
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface MessagingProps {
  className?: string;
  currentUserId: string;
  currentUserRole: 'user' | 'helper' | 'admin';
  onConversationSelect?: (conversationId: string) => void;
  onNotificationClick?: (notification: Notification) => void;
}

export default function Messaging({
  className = "",
  currentUserId,
  currentUserRole,
  onConversationSelect,
  onNotificationClick
}: MessagingProps) {
  const [activeTab, setActiveTab] = useState<'conversations' | 'notifications'>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    taskUpdates: true,
    payments: true,
    disputes: true,
    sounds: true,
    desktop: true
  });

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - in real app, this would come from API/WebSocket
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      type: 'direct',
      participants: [
        { id: '1', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', role: 'helper', online: true },
        { id: currentUserId, name: 'You', role: currentUserRole, online: true }
      ],
      unreadCount: 2,
      pinned: true,
      muted: false,
      lastMessage: {
        id: '1',
        senderId: '1',
        content: 'I can help with your cleaning task this weekend. What time works best for you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: 'text',
        status: 'delivered'
      }
    },
    {
      id: '2',
      type: 'support',
      participants: [
        { id: 'admin1', name: 'Support Team', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', role: 'admin', online: true },
        { id: currentUserId, name: 'You', role: currentUserRole, online: true }
      ],
      unreadCount: 0,
      pinned: false,
      muted: false,
      title: 'Payment Issue #12345',
      lastMessage: {
        id: '2',
        senderId: 'admin1',
        content: 'Your payment has been processed successfully. Is there anything else we can help with?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        type: 'text',
        status: 'read'
      }
    }
  ]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        senderId: '1',
        content: 'Hi! I saw your cleaning task posting. I have 5+ years of experience and great reviews.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        type: 'text',
        status: 'read'
      },
      {
        id: '2',
        senderId: currentUserId,
        content: 'That sounds great! Can you tell me more about your availability?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: 'text',
        status: 'read'
      },
      {
        id: '3',
        senderId: '1',
        content: 'I can help with your cleaning task this weekend. What time works best for you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: 'text',
        status: 'delivered'
      }
    ],
    '2': [
      {
        id: '4',
        senderId: currentUserId,
        content: 'I have an issue with my payment not going through.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        type: 'text',
        status: 'read'
      },
      {
        id: '5',
        senderId: 'admin1',
        content: 'I understand your concern. Let me check your payment details.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
        type: 'text',
        status: 'read'
      },
      {
        id: '6',
        senderId: 'admin1',
        content: 'Your payment has been processed successfully. Is there anything else we can help with?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        type: 'text',
        status: 'read'
      }
    ]
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'task_update',
      title: 'Task Accepted',
      content: 'Sarah Chen accepted your cleaning task for this Saturday',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      priority: 'high',
      actionUrl: '/tasks/123'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Processed',
      content: 'Your payment of $85 has been successfully processed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      content: 'You have a new message from Sarah Chen',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true,
      priority: 'low'
    }
  ]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation, scrollToBottom]);

  // Typing indicator simulation
  useEffect(() => {
    if (messageInput.length > 0 && !isTyping) {
      setIsTyping(true);
      // Simulate websocket emit for typing
      const timer = setTimeout(() => setIsTyping(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [messageInput, isTyping]);

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      content: messageInput.trim(),
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };

    // Optimistic update
    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMessage]
    }));

    setMessageInput('');
    setIsTyping(false);

    // Simulate API call
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedConversation]: prev[selectedConversation].map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      }));
    }, 500);

    // Update conversation last message
    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation
        ? { ...conv, lastMessage: { ...newMessage, status: 'sent' } }
        : conv
    ));
  }, [messageInput, selectedConversation, currentUserId]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || !selectedConversation) return;

    Array.from(files).forEach(file => {
      // Validate file type and size
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/', 'application/pdf', 'text/', 'audio/'];
      
      if (file.size > maxSize) {
        toast.error('File size too large. Maximum 10MB allowed.');
        return;
      }

      if (!allowedTypes.some(type => file.type.startsWith(type))) {
        toast.error('File type not supported.');
        return;
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: currentUserId,
        content: `Sent ${file.type.startsWith('image/') ? 'an image' : 'a file'}`,
        timestamp: new Date(),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        status: 'sending',
        attachments: [{
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        }]
      };

      setMessages(prev => ({
        ...prev,
        [selectedConversation]: [...(prev[selectedConversation] || []), newMessage]
      }));

      // Simulate upload
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [selectedConversation]: prev[selectedConversation].map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
          )
        }));
      }, 1000);
    });

    setShowAttachmentDialog(false);
  }, [selectedConversation, currentUserId]);

  const handleVoiceRecord = useCallback(async () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info('Recording started...');
      
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false);
        if (selectedConversation) {
          const newMessage: Message = {
            id: Date.now().toString(),
            senderId: currentUserId,
            content: 'Voice message',
            timestamp: new Date(),
            type: 'voice',
            status: 'sending'
          };

          setMessages(prev => ({
            ...prev,
            [selectedConversation]: [...(prev[selectedConversation] || []), newMessage]
          }));

          setTimeout(() => {
            setMessages(prev => ({
              ...prev,
              [selectedConversation]: prev[selectedConversation].map(msg =>
                msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
              )
            }));
          }, 500);
        }
        toast.success('Voice message sent!');
      }, 3000);
    } else {
      setIsRecording(false);
      toast.info('Recording cancelled');
    }
  }, [isRecording, selectedConversation, currentUserId]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  }, []);

  const markConversationAsRead = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  }, []);

  const filteredConversations = conversations.filter(conv =>
    searchQuery === '' ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const totalUnreadMessages = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = selectedConversation ? messages[selectedConversation] || [] : [];

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return formatTime(date);
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  return (
    <div className={`bg-card border border-border rounded-lg h-[600px] flex flex-col ${className}`}>
      <div className="p-4 border-b border-border">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4" />
              Messages
              {totalUnreadMessages > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                  {totalUnreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <MessageSquareDot className="h-4 w-4" />
              Notifications
              {unreadNotificationsCount > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                  {unreadNotificationsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="conversations" className="flex-1 flex flex-col m-0">
        <div className="flex flex-1 min-h-0">
          {/* Conversations List */}
          <div className="w-80 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" variant="outline">
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
                  return (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                        selectedConversation === conversation.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => {
                        setSelectedConversation(conversation.id);
                        markConversationAsRead(conversation.id);
                        onConversationSelect?.(conversation.id);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={otherParticipant?.avatar} />
                            <AvatarFallback>
                              {(conversation.title || otherParticipant?.name || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {otherParticipant?.online && (
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-card" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">
                                {conversation.title || otherParticipant?.name || 'Unknown'}
                              </h4>
                              {conversation.pinned && (
                                <MessageSquareLock className="h-3 w-3 text-muted-foreground" />
                              )}
                              {conversation.type === 'support' && (
                                <Badge variant="secondary" className="text-xs">Support</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {conversation.lastMessage && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(conversation.lastMessage.timestamp)}
                                </span>
                              )}
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-5 text-xs ml-1">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conversation.lastMessage.senderId === currentUserId && 'You: '}
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Chat View */}
          <div className="flex-1 flex flex-col">
            {selectedConversation && selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedConv.participants.find(p => p.id !== currentUserId)?.avatar} />
                        <AvatarFallback>
                          {(selectedConv.title || selectedConv.participants.find(p => p.id !== currentUserId)?.name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {selectedConv.title || selectedConv.participants.find(p => p.id !== currentUserId)?.name || 'Unknown'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {selectedConv.participants.find(p => p.id !== currentUserId)?.online ? (
                            <span className="text-green-600">Online</span>
                          ) : (
                            <span>Last seen {formatDate(selectedConv.participants.find(p => p.id !== currentUserId)?.lastSeen || new Date())}</span>
                          )}
                          {typingUsers.length > 0 && (
                            <span className="text-primary">typing...</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MessageCircleMore className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
                        <DropdownMenuItem>Pin Conversation</DropdownMenuItem>
                        <Separator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setShowReportDialog(true)}
                        >
                          Report User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {conversationMessages.map((message) => {
                      const isOwnMessage = message.senderId === currentUserId;
                      const sender = selectedConv.participants.find(p => p.id === message.senderId);

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isOwnMessage && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={sender?.avatar} />
                                <AvatarFallback className="text-xs">
                                  {sender?.name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div className={`rounded-lg px-3 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {message.type === 'voice' ? (
                                <div className="flex items-center gap-2">
                                  <Speech className="h-4 w-4" />
                                  <span className="text-sm">Voice message</span>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                    ▶
                                  </Button>
                                </div>
                              ) : message.attachments ? (
                                <div className="space-y-2">
                                  {message.attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center gap-2">
                                      {attachment.type.startsWith('image/') ? (
                                        <img
                                          src={attachment.url}
                                          alt={attachment.name}
                                          className="max-w-full max-h-48 rounded"
                                        />
                                      ) : (
                                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                          <MessageSquareText className="h-4 w-4" />
                                          <span className="text-sm">{attachment.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {message.content !== `Sent ${message.type === 'image' ? 'an image' : 'a file'}` && (
                                    <p className="text-sm">{message.content}</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm">{message.content}</p>
                              )}

                              <div className={`flex items-center justify-between mt-1 text-xs ${
                                isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                              }`}>
                                <span>{formatTime(message.timestamp)}</span>
                                {isOwnMessage && (
                                  <div className="flex items-center gap-1">
                                    {message.edited && <span>edited</span>}
                                    <span className="capitalize">{message.status}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea
                        ref={messageInputRef}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="min-h-[40px] max-h-[120px] resize-none"
                        rows={1}
                      />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MessageSquareMore className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Attachment</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full"
                              variant="outline"
                            >
                              <MessageSquareText className="h-4 w-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => handleFileUpload(e.target.files)}
                              accept="image/*,.pdf,.doc,.docx,.txt"
                            />
                            <p className="text-sm text-muted-foreground">
                              Supported formats: Images, PDF, Documents. Max size: 10MB
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant={isRecording ? "destructive" : "ghost"}
                        size="sm"
                        onClick={handleVoiceRecord}
                      >
                        <Speech className="h-4 w-4" />
                      </Button>

                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        size="sm"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div className="space-y-3">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="font-medium">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="notifications" className="flex-1 flex flex-col m-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Notifications</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Settings</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notification Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Messages</label>
                    <Switch
                      checked={notificationSettings.messages}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, messages: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Task Updates</label>
                    <Switch
                      checked={notificationSettings.taskUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, taskUpdates: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Payments</label>
                    <Switch
                      checked={notificationSettings.payments}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, payments: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Disputes</label>
                    <Switch
                      checked={notificationSettings.disputes}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, disputes: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Sound Notifications</label>
                    <Switch
                      checked={notificationSettings.sounds}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, sounds: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Desktop Notifications</label>
                    <Switch
                      checked={notificationSettings.desktop}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, desktop: checked }))
                      }
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  !notification.read ? 'border-primary/50 bg-primary/5' : ''
                }`}
                onClick={() => {
                  markNotificationAsRead(notification.id);
                  onNotificationClick?.(notification);
                  if (notification.actionUrl) {
                    // Handle navigation
                    toast.info('Navigation would occur here');
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      notification.priority === 'critical' ? 'bg-destructive/10 text-destructive' :
                      notification.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                      notification.priority === 'medium' ? 'bg-blue-100 text-blue-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {notification.type === 'task_update' && <MessageSquare className="h-4 w-4" />}
                      {notification.type === 'payment' && <MessageSquareHeart className="h-4 w-4" />}
                      {notification.type === 'message' && <MessageCircle className="h-4 w-4" />}
                      {notification.type === 'dispute' && <MessageCircleOff className="h-4 w-4" />}
                      {notification.type === 'system' && <MessageSquareShare className="h-4 w-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for reporting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam or unwanted messages</SelectItem>
                <SelectItem value="harassment">Harassment or abuse</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="scam">Scam or fraud</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Please provide additional details..."
              className="min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  toast.success('Report submitted successfully');
                  setShowReportDialog(false);
                }}
              >
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}