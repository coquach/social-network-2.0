/**
 * Optimized icon imports from lucide-react
 * 
 * This file centralizes all icon imports to improve build performance
 * by avoiding barrel imports from 'lucide-react' which can slow down
 * development builds and increase cold start times.
 * 
 * Usage:
 * import { IconName } from '@/lib/icons';
 */

// Re-export commonly used icons
export {
  // Navigation & UI
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Home as HomeIcon,
  X,
  XIcon,
  XCircle,
  Check,
  CheckIcon,
  CheckCircle,
  CheckCircle2,
  MoreHorizontal,
  Ellipsis,
  
  // Media & Content
  Image,
  Video,
  FileText,
  Download,
  Play,
  
  // Communication
  MessageCircle,
  MessageCirclePlus,
  Send,
  SendHorizonal,
  Mail,
  Bell,
  BellRing,
  
  // User & Social
  User,
  Users,
  UsersRound,
  UserPlus,
  UserCircle,
  UserCircle2,
  UserRound,
  UserX,
  ContactRound,
  
  // Actions
  Search,
  SearchIcon,
  Edit,
  Edit3,
  Pencil,
  PencilLine,
  Trash,
  Trash2,
  Share2,
  Copy,
  Flag,
  Pin,
  Reply,
  Repeat2,
  
  // Status & Feedback
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
  RefreshCw,
  RefreshCcw,
  RotateCcw,
  ThumbsUp,
  
  // Security & Privacy
  Lock,
  LockKeyhole,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  ShieldOff,
  Eye,
  EyeOff,
  BadgeCheck,
  
  // Settings & Config
  Settings,
  SlidersHorizontal,
  Workflow,
  Gauge,
  Timer,
  
  // Time & Calendar
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  Clock3,
  ClipboardClock,
  History,
  
  // Visibility & Access
  Globe,
  Globe2,
  
  // Data & Storage
  Database,
  Archive,
  CloudDownload,
  ServerCog,
  
  // Activity & Monitoring
  Activity,
  ActivitySquare,
  TrendingUp,
  
  // Layout & Structure
  LayoutDashboard,
  ListChecks,
  CircleIcon,
  SquarePlay,
  
  // Theme & Appearance
  Moon,
  Sun,
  Sparkles,
  
  // Groups & Organization
  PlusCircle,
  Compass,
  
  // Admin & Moderation
  UserCheck,
  Megaphone,
  Languages,
  Smartphone,
  
  // Special Purpose
  LogOut,
  Save,
  
  // Type exports
  type LucideIcon,
} from 'lucide-react';

// Export renamed icons for convenience
export { Image as ImageIcon } from 'lucide-react';
export { Video as VideoIcon } from 'lucide-react';
export { Star as StarIcon } from 'lucide-react';
