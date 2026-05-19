export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
        };
      };
      couples: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string | null;
          start_date: string | null;
          theme: 'rose' | 'lilac' | 'wine';
          plan: 'free' | 'premium';
          created_at: string;
        };
        Insert: {
          id?: string;
          user1_id: string;
          user2_id?: string | null;
          start_date?: string | null;
          theme?: 'rose' | 'lilac' | 'wine';
          plan?: 'free' | 'premium';
          created_at?: string;
        };
        Update: {
          user2_id?: string | null;
          start_date?: string | null;
          theme?: 'rose' | 'lilac' | 'wine';
          plan?: 'free' | 'premium';
        };
      };
      couple_invites: {
        Row: {
          id: string;
          couple_id: string;
          inviter_id: string;
          token: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          inviter_id: string;
          token: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          accepted_at?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          couple_id: string;
          creator_id: string;
          title: string;
          description: string | null;
          start_at: string;
          end_at: string;
          type: 'personal' | 'couple' | 'anniversary' | 'travel';
          color: string;
          visibility: 'private' | 'shared';
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          creator_id: string;
          title: string;
          description?: string | null;
          start_at: string;
          end_at: string;
          type?: 'personal' | 'couple' | 'anniversary' | 'travel';
          color?: string;
          visibility?: 'private' | 'shared';
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          start_at?: string;
          end_at?: string;
          type?: 'personal' | 'couple' | 'anniversary' | 'travel';
          color?: string;
          visibility?: 'private' | 'shared';
        };
      };
      memories: {
        Row: {
          id: string;
          couple_id: string;
          creator_id: string;
          title: string;
          description: string | null;
          photo_url: string | null;
          date: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          creator_id: string;
          title: string;
          description?: string | null;
          photo_url?: string | null;
          date: string;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          photo_url?: string | null;
          date?: string;
          tags?: string[];
        };
      };
      capsules: {
        Row: {
          id: string;
          couple_id: string;
          creator_id: string;
          message: string;
          reveal_at: string;
          revealed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          creator_id: string;
          message: string;
          reveal_at: string;
          revealed_at?: string | null;
          created_at?: string;
        };
        Update: {
          revealed_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          couple_id: string;
          sender_id: string;
          event_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          sender_id: string;
          event_id?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
      };
      message_reactions: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at?: string;
        };
        Update: never;
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          notify_events: boolean;
          notify_messages: boolean;
          notify_capsules: boolean;
          notify_invites: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          notify_events?: boolean;
          notify_messages?: boolean;
          notify_capsules?: boolean;
          notify_invites?: boolean;
          created_at?: string;
        };
        Update: {
          notify_events?: boolean;
          notify_messages?: boolean;
          notify_capsules?: boolean;
          notify_invites?: boolean;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          couple_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: 'free' | 'premium';
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: 'free' | 'premium';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_end?: string | null;
          created_at?: string;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: 'free' | 'premium';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_end?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
