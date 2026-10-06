export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface MemberFinancials {
  event_id?: number | null;
  event_fee: number;
  paid: number;
  previous_due: number;
  current_due: number;
  total_due: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | string;
}

export interface Member {
  id: number;
  member_id: string;
  name: string;
  bangla_name?: string | null;
  photo?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  joining_date?: string | null;
  membership_type: string;
  position?: string | null;
  blood_group?: string | null;
  status: 'Active' | 'Inactive' | 'active' | 'inactive' | string;
  is_phone_public?: boolean;
  is_email_public?: boolean;
  is_address_public?: boolean;
  is_financial_public?: boolean;
  financials?: MemberFinancials | null;
  notes?: string | null;
}

export interface EventStats {
  assigned_members: number;
  total_expected: number;
  total_collected: number;
  total_due: number;
  collection_percentage: number;
}

export interface ClubEvent {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  banner_image?: string | null;
  event_date: string;
  start_time?: string | null;
  location: string;
  event_fee: number;
  registration_deadline?: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | string;
  is_published?: boolean;
  stats?: EventStats;
  gallery?: GalleryItem[];
}

export interface EventExpense {
  id: number;
  event_id: number;
  description: string;
  amount: number | string;
  expense_date?: string | null;
  created_at?: string;
  event?: ClubEvent;
}

export interface PaymentTransaction {
  id: number;
  member_id: number;
  event_id?: number | null;
  event_member_fee_id?: number | null;
  amount: number | string;
  payment_date: string;
  payment_method: 'Cash' | 'Bank' | 'bKash' | 'Nagad' | 'Rocket' | 'Other' | string;
  transaction_reference?: string | null;
  received_by?: string | null;
  note?: string | null;
  created_at?: string;
  member?: Member;
  event?: ClubEvent;
}

export interface GalleryItem {
  id: number;
  title: string;
  caption?: string | null;
  type: 'image' | 'video';
  image_path: string;
  category: string;
  event_id?: number | null;
  is_featured: boolean;
  order: number;
  event?: ClubEvent;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ClubSettings {
  club_name: string;
  club_bangla_name: string;
  club_tagline: string;
  club_tagline_en: string;
  established_year: string;
  registration_no: string;
  club_phone: string;
  club_email: string;
  club_address: string;
  club_description: string;
  facebook_url: string;
  youtube_url: string;
  hide_public_phone: boolean;
  hide_public_email: boolean;
  hide_public_address: boolean;
  hide_public_financials: boolean;
}

export interface DashboardStats {
  kpis: {
    total_members: number;
    active_members: number;
    total_collected: number;
    total_due: number;
    today_collection: number;
    month_collection: number;
    paid_members_count: number;
    partial_members_count: number;
    unpaid_members_count: number;
    active_event_title?: string;
    active_event_fee?: number;
    active_event_progress?: number;
    event_card_title?: string;
    latest_event?: {
      id: number;
      title: string;
      date: string;
      status?: string;
      stats: EventStats;
    } | null;
  };
  charts: {
    monthly_trends: { month: string; full_month?: string; amount: number }[];
    status_distribution?: { name: string; value: number; color: string }[];
    events_comparison?: { name: string; full_name: string; expected: number; collected: number; due: number }[];
    payment_methods?: { payment_method: string; total_amount: number; count: number }[];
  };
  recent_transactions: PaymentTransaction[];
  dues_alert?: {
    id: number;
    member_id: string;
    name: string;
    phone?: string;
    total_due: number;
    status: string;
  }[];
  top_due_members?: {
    id: number;
    member_id: string;
    name: string;
    phone?: string;
    total_due: number;
    status: string;
    current_due?: number;
    previous_due?: number;
  }[];
  messages_summary?: {
    unread_count: number;
    recent: ContactMessage[];
  };
}

export interface Journey {
  id: number;
  year: string;
  title: string;
  description: string;
  image?: string | null;
  order?: number;
  created_at?: string;
  updated_at?: string;
}
