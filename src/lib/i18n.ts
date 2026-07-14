// Simple i18n translation system — English & French

export type Locale = "en" | "fr";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Sidebar
    "sidebar.newChat": "New chat",
    "sidebar.chats": "Chats",
    "sidebar.recents": "Recents",
    "sidebar.noConversations": "No conversations yet",
    "sidebar.groupBy": "Group by",
    "sidebar.groupNone": "None",
    "sidebar.groupDate": "Date",
    "sidebar.today": "Today",
    "sidebar.yesterday": "Yesterday",
    "sidebar.thisWeek": "This week",
    "sidebar.older": "Older",
    "sidebar.rename": "Rename",
    "sidebar.delete": "Delete",

    // Chats page
    "chats.title": "Chats",
    "chats.newChat": "New chat",
    "chats.searchPlaceholder": "Search chats...",
    "chats.noMatchingChats": "No matching chats",
    "chats.noConversations": "No conversations yet",
    "chats.today": "Today",
    "chats.yesterday": "Yesterday",
    "chats.daysAgo": "days ago",

    // Search modal
    "search.placeholder": "Search chats...",
    "search.noMatchingChats": "No matching chats",
    "search.noConversations": "No conversations",
    "search.pastMonth": "Past month",
    "search.pastYear": "Past year",

    // User menu
    "menu.settings": "Settings",
    "menu.weeklyLimit": "Weekly limit",
    "menu.agentInfo": "Agent info",
    "menu.logout": "Log out",

    // Welcome screen
    "welcome.morning": "Good morning",
    "welcome.afternoon": "Good afternoon",
    "welcome.evening": "Good evening",
    "welcome.subtitle": "How can I help you today?",
    "welcome.placeholder": "Ask Cody anything...",

    // Chat
    "chat.placeholder": "Write a message...",
    "chat.disclaimer": "Cody is AI and can make mistakes. Please double-check important information.",

    // Settings modal
    "settings.profile": "Profile",
    "settings.avatar": "Avatar",
    "settings.fullName": "Full name",
    "settings.email": "Email",
    "settings.preferences": "Preferences",
    "settings.appearance": "Appearance",
    "settings.language": "Language",
    "settings.namePlaceholder": "Your name",
    "settings.nameRequired": "Full name is required",
    "settings.nameMinLength": "Name must be at least 2 characters",

    // Usage modal
    "usage.title": "Weekly usage",
    "usage.subtitle": "Your message limit resets every week.",
    "usage.messages": "Messages",
    "usage.resetsOn": "Resets on",
    "usage.thisWeek": "This week",
    "usage.messagesSent": "Messages sent",
    "usage.remaining": "Remaining",
    "usage.needMore": "Need more messages? Contact support to extend your weekly limit.",
    "usage.contactSupport": "Contact support",

    // Agent info modal
    "agent.title": "SMARTOVATE AI Agent",
    "agent.status": "Status",
    "agent.model": "Model",
    "agent.region": "Region",
    "agent.tools": "Tools",
    "agent.available": "available",
    "agent.availableTools": "Available Tools",

    // Rate limit
    "rateLimit.reached": "You've reached your",
    "rateLimit.weeklyLimit": "weekly message limit",
    "rateLimit.contactSupport": "Contact support",
    "rateLimit.toExtend": "to extend your limit.",

    // Toast
    "toast.settingsSaved": "Settings saved",
    "toast.settingsFailed": "Failed to save settings",
    "toast.conversationNotFound": "Conversation not found",

    // Errors
    "error.somethingWrong": "Sorry, something went wrong. Please try again.",
  },

  fr: {
    // Sidebar
    "sidebar.newChat": "Nouvelle discussion",
    "sidebar.chats": "Discussions",
    "sidebar.recents": "Récents",
    "sidebar.noConversations": "Aucune conversation",
    "sidebar.groupBy": "Grouper par",
    "sidebar.groupNone": "Aucun",
    "sidebar.groupDate": "Date",
    "sidebar.today": "Aujourd'hui",
    "sidebar.yesterday": "Hier",
    "sidebar.thisWeek": "Cette semaine",
    "sidebar.older": "Plus ancien",
    "sidebar.rename": "Renommer",
    "sidebar.delete": "Supprimer",

    // Chats page
    "chats.title": "Discussions",
    "chats.newChat": "Nouvelle discussion",
    "chats.searchPlaceholder": "Rechercher des discussions...",
    "chats.noMatchingChats": "Aucune discussion correspondante",
    "chats.noConversations": "Aucune conversation",
    "chats.today": "Aujourd'hui",
    "chats.yesterday": "Hier",
    "chats.daysAgo": "jours",

    // Search modal
    "search.placeholder": "Rechercher des discussions...",
    "search.noMatchingChats": "Aucune discussion correspondante",
    "search.noConversations": "Aucune conversation",
    "search.pastMonth": "Mois dernier",
    "search.pastYear": "Année dernière",

    // User menu
    "menu.settings": "Paramètres",
    "menu.weeklyLimit": "Limite hebdomadaire",
    "menu.agentInfo": "Info agent",
    "menu.logout": "Déconnexion",

    // Welcome screen
    "welcome.morning": "Bonjour",
    "welcome.afternoon": "Bon après-midi",
    "welcome.evening": "Bonsoir",
    "welcome.subtitle": "Comment puis-je vous aider aujourd'hui ?",
    "welcome.placeholder": "Demandez quelque chose à Cody...",

    // Chat
    "chat.placeholder": "Écrire un message...",
    "chat.disclaimer": "Cody est une IA et peut faire des erreurs. Veuillez vérifier les informations importantes.",

    // Settings modal
    "settings.profile": "Profil",
    "settings.avatar": "Avatar",
    "settings.fullName": "Nom complet",
    "settings.email": "E-mail",
    "settings.preferences": "Préférences",
    "settings.appearance": "Apparence",
    "settings.language": "Langue",
    "settings.namePlaceholder": "Votre nom",
    "settings.nameRequired": "Le nom est requis",
    "settings.nameMinLength": "Le nom doit contenir au moins 2 caractères",

    // Usage modal
    "usage.title": "Utilisation hebdomadaire",
    "usage.subtitle": "Votre limite de messages se réinitialise chaque semaine.",
    "usage.messages": "Messages",
    "usage.resetsOn": "Réinitialisation le",
    "usage.thisWeek": "Cette semaine",
    "usage.messagesSent": "Messages envoyés",
    "usage.remaining": "Restants",
    "usage.needMore": "Besoin de plus de messages ? Contactez le support pour augmenter votre limite.",
    "usage.contactSupport": "Contacter le support",

    // Agent info modal
    "agent.title": "Agent IA SMARTOVATE",
    "agent.status": "Statut",
    "agent.model": "Modèle",
    "agent.region": "Région",
    "agent.tools": "Outils",
    "agent.available": "disponibles",
    "agent.availableTools": "Outils disponibles",

    // Rate limit
    "rateLimit.reached": "Vous avez atteint votre",
    "rateLimit.weeklyLimit": "limite hebdomadaire",
    "rateLimit.contactSupport": "Contacter le support",
    "rateLimit.toExtend": "pour augmenter votre limite.",

    // Toast
    "toast.settingsSaved": "Paramètres enregistrés",
    "toast.settingsFailed": "Échec de l'enregistrement",
    "toast.conversationNotFound": "Conversation introuvable",

    // Errors
    "error.somethingWrong": "Désolé, une erreur s'est produite. Veuillez réessayer.",
  },
};

export function t(key: string, locale: Locale = "en"): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}
