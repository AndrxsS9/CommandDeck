/**
 * Traducciones centralizadas de CommandDeck (Español / Inglés).
 *
 * Solución ligera sin librerías externas. Los valores estructurados
 * (tool, suggestedRisk) y los comandos de terminal NO se traducen.
 */

import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../auth/validation';

export type Language = 'es' | 'en';

export const LANGUAGE_KEY = 'commanddeck_language';
export const DEFAULT_LANGUAGE: Language = 'es';

const es = {
  header: {
    hotkeyHint: 'Alt + Space para abrir · Ctrl + Alt + Space si no está disponible',
    history: 'Historial',
    languageAria: 'Cambiar idioma a inglés',
    themeLight: 'Modo Claro',
    themeDark: 'Modo Oscuro',
    themeToLightAria: 'Cambiar a modo claro',
    themeToDarkAria: 'Cambiar a modo oscuro',
  },
  workspace: {
    title: 'Asistente IA de Terminal',
    subtitle: 'Genera, analiza el riesgo e inspecciona comandos de infraestructura.',
    compat: 'Compatible con:',
  },
  input: {
    title: '✨ Traductor en Lenguaje Natural',
    subtitle: 'Convierte lo que necesitas en un comando listo para revisar.',
    placeholder: 'Describe lo que quieres hacer en lenguaje natural...',
    ariaLabel: 'Describe tu intención',
    suggestionsLabel: 'Sugerencias:',
    generate: 'Generar comando',
    generating: 'Generando…',
  },
  suggestions: [
    'Mostrar las ramas locales de Git',
    'Listar contenedores Docker activos',
    'Listar los pods de Kubernetes',
    'Crear una carpeta llamada logs',
  ],
  emptyState:
    'Escribe una intención en español o inglés. CommandDeck la convertirá en una propuesta de comando y evaluará su nivel de riesgo antes de cualquier acción.',
  loading: {
    text: 'Analizando intención y construyendo comando...',
    subtext: 'Gemini está procesando la solicitud',
  },
  error: {
    title: 'Error en la generación',
    retry: 'Reintentar',
    notTauri:
      'La app no está corriendo dentro de Tauri. Usa "npm run tauri dev" en vez de "npm run dev".',
    invokeFailed: 'Error al invocar Gemini desde Rust:',
  },
  status: {
    copied: 'Comando copiado al portapapeles.',
  },
  result: {
    label: 'Resultado Generado',
    copy: 'Copiar',
    copied: '¡Copiado!',
    newQuery: 'Nueva consulta',
    paramsBreakdown: 'Desglose de Parámetros',
    platformUnknown: 'Plataforma no determinada',
    shellInferred: 'Shell inferida:',
    shellUnknown: 'Shell no determinada',
    detectedAuto: 'Detectado automáticamente',
  },
  risk: {
    title: 'Nivel de Riesgo',
    labels: {
      read: 'Lectura',
      low: 'Bajo',
      medium: 'Medio',
      critical: 'Crítico',
    },
    messages: {
      read: 'Sin patrones destructivos detectados',
      low: 'Riesgo bajo según análisis local',
      medium: 'Requiere revisión antes de continuar',
      critical: 'Acción crítica',
    },
    /** Motivo añadido cuando la IA sugiere un riesgo mayor que el análisis local. */
    aiHigher: (level: string) =>
      `La IA sugirió un nivel de riesgo superior (${level}) al detectado por el análisis local.`,
    /** Traducción de los motivos del Risk Engine (que se generan en español). */
    reasons: {} as Record<string, string>,
  },
  tools: {
    git: 'Git',
    docker: 'Docker',
    kubernetes: 'Kubernetes',
    system: 'Sistema',
    unknown: 'Desconocido',
  } as Record<string, string>,
  recent: {
    title: 'Recientes',
    saved: 'guardados',
    clear: 'Limpiar',
    clearConfirm: '¿Estás seguro de que quieres limpiar el historial?',
    reuse: 'Reutilizar',
    reuseAria: 'Reutilizar',
    tipTitle: 'Flujo recomendado',
    tipText: 'Describe → Genera → Revisa parámetros y nivel de riesgo antes de copiar el comando.',
    today: 'Hoy',
  },
  history: {
    title: 'Historial',
    entries: 'registros',
    close: 'Cerrar',
    empty: 'Aún no hay comandos en el historial. Genera un comando para que aparezca aquí.',
    intent: 'Intención',
    command: 'Comando',
    risk: 'Riesgo',
    date: 'Fecha',
    locale: 'es-ES',
  },
  auth: {
    welcomeTitle: 'Bienvenido a CommandDeck',
    welcomeSubtitle: 'Inicia sesión para continuar',
    registerTitle: 'Crea tu cuenta',
    registerSubtitle: 'Regístrate para empezar a usar CommandDeck',
    name: 'Nombre',
    namePlaceholder: 'Tu nombre completo',
    email: 'Correo electrónico',
    emailPlaceholder: 'usuario@correo.com',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    passwordHint: `Entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres. Puedes usar letras, números, espacios y símbolos.`,
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    signIn: 'Iniciar sesión',
    signingIn: 'Iniciando sesión...',
    signOut: 'Cerrar sesión',
    signingOut: 'Cerrando sesión...',
    checkingSession: 'Comprobando sesión...',
    configTitle: 'Configuración de Supabase requerida',
    configText: 'Copia .env.example como .env.local y configura tus credenciales de Supabase:',
    createAccount: 'Crear cuenta',
    creatingAccount: 'Creando cuenta...',
    noAccount: '¿No tienes cuenta?',
    haveAccount: '¿Ya tienes cuenta?',
    forgotPasswordLink: '¿Olvidaste tu contraseña?',
    forgotPasswordTitle: 'Recuperar contraseña',
    forgotPasswordSubtitle: 'Ingresa tu correo para recibir instrucciones de recuperación.',
    sendInstructions: 'Enviar instrucciones',
    sendingInstructions: 'Enviando instrucciones...',
    backToLogin: 'Volver al inicio de sesión',
    resetEmailSent: 'Si existe una cuenta asociada a este correo, recibirás un enlace de recuperación.',
    accountCreatedConfirm: 'Cuenta creada. Revisa tu correo electrónico para confirmar tu cuenta.',
    errors: {
      emailRequired: 'Ingresa tu correo electrónico.',
      emailInvalid: 'Ingresa un correo electrónico válido.',
      nameRequired: 'Ingresa tu nombre.',
      nameInvalidChars: 'El nombre debe contener únicamente letras y espacios.',
      nameLength: `El nombre debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.`,
      passwordRequired: 'Ingresa tu contraseña.',
      passwordTooShort: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
      passwordTooLong: `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`,
      passwordMismatch: 'Las contraseñas no coinciden.',
      invalidCredentials: 'Correo o contraseña incorrectos.',
      userExists: 'Ya existe una cuenta asociada a este correo.',
      emailNotConfirmed: 'Debes confirmar tu correo electrónico antes de iniciar sesión.',
      weakPassword: 'La contraseña no cumple la política de seguridad configurada en el servicio.',
      rateLimit: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
      network: 'No fue posible conectar con el servicio de autenticación.',
      notConfigured: 'La autenticación no está configurada.',
      generic: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
    },
  },
};

export type Translations = typeof es;

const en: Translations = {
  header: {
    hotkeyHint: 'Alt + Space to open · Ctrl + Alt + Space if unavailable',
    history: 'History',
    languageAria: 'Switch language to Spanish',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    themeToLightAria: 'Switch to light mode',
    themeToDarkAria: 'Switch to dark mode',
  },
  workspace: {
    title: 'AI Terminal Assistant',
    subtitle: 'Generate, assess risk and inspect infrastructure commands.',
    compat: 'Compatible with:',
  },
  input: {
    title: '✨ Natural Language Translator',
    subtitle: 'Turn what you need into a command ready for review.',
    placeholder: 'Describe what you want to do in natural language...',
    ariaLabel: 'Describe your intent',
    suggestionsLabel: 'Suggestions:',
    generate: 'Generate command',
    generating: 'Generating…',
  },
  suggestions: [
    'Show local Git branches',
    'List active Docker containers',
    'List Kubernetes pods',
    'Create a folder named logs',
  ],
  emptyState:
    'Write an intent in English or Spanish. CommandDeck will turn it into a command proposal and assess its risk level before any action.',
  loading: {
    text: 'Analyzing intent and building command...',
    subtext: 'Gemini is processing the request',
  },
  error: {
    title: 'Generation error',
    retry: 'Retry',
    notTauri:
      'The app is not running inside Tauri. Use "npm run tauri dev" instead of "npm run dev".',
    invokeFailed: 'Error invoking Gemini from Rust:',
  },
  status: {
    copied: 'Command copied to clipboard.',
  },
  result: {
    label: 'Generated Result',
    copy: 'Copy',
    copied: 'Copied!',
    newQuery: 'New Query',
    paramsBreakdown: 'Parameter Breakdown',
    platformUnknown: 'Platform not determined',
    shellInferred: 'Inferred shell:',
    shellUnknown: 'Shell not determined',
    detectedAuto: 'Detected automatically',
  },
  risk: {
    title: 'Risk Level',
    labels: {
      read: 'Read',
      low: 'Low',
      medium: 'Medium',
      critical: 'Critical',
    },
    messages: {
      read: 'No destructive patterns detected',
      low: 'Low risk according to local analysis',
      medium: 'Requires review before continuing',
      critical: 'Critical action',
    },
    aiHigher: (level: string) =>
      `The AI suggested a higher risk level (${level}) than the one detected by local analysis.`,
    reasons: {
      'El comando puede eliminar, sobrescribir o descartar información.':
        'The command may delete, overwrite or discard information.',
      'El comando modifica el estado de procesos, servicios o repositorios.':
        'The command changes the state of processes, services or repositories.',
      'El comando realiza modificaciones locales.':
        'The command performs local modifications.',
      'La operación puede afectar múltiples elementos.':
        'The operation may affect multiple items.',
      'El comando solicita privilegios elevados del sistema.':
        'The command requests elevated system privileges.',
      'El comando parece realizar únicamente una consulta o lectura.':
        'The command appears to only perform a query or read.',
    },
  },
  tools: {
    git: 'Git',
    docker: 'Docker',
    kubernetes: 'Kubernetes',
    system: 'System',
    unknown: 'Unknown',
  },
  recent: {
    title: 'Recent',
    saved: 'saved',
    clear: 'Clear',
    clearConfirm: 'Are you sure you want to clear the history?',
    reuse: 'Reuse',
    reuseAria: 'Reuse',
    tipTitle: 'Recommended flow',
    tipText: 'Describe → Generate → Review parameters and risk level before copying the command.',
    today: 'Today',
  },
  history: {
    title: 'History',
    entries: 'entries',
    close: 'Close',
    empty: 'There are no commands in the history yet. Generate a command to see it here.',
    intent: 'Intent',
    command: 'Command',
    risk: 'Risk',
    date: 'Date',
    locale: 'en-US',
  },
  auth: {
    welcomeTitle: 'Welcome to CommandDeck',
    welcomeSubtitle: 'Sign in to continue',
    registerTitle: 'Create your account',
    registerSubtitle: 'Sign up to start using CommandDeck',
    name: 'Name',
    namePlaceholder: 'Your full name',
    email: 'Email address',
    emailPlaceholder: 'user@email.com',
    password: 'Password',
    confirmPassword: 'Confirm password',
    passwordHint: `Between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters. You can use letters, numbers, spaces and symbols.`,
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    signOut: 'Sign out',
    signingOut: 'Signing out...',
    checkingSession: 'Checking session...',
    configTitle: 'Supabase configuration required',
    configText: 'Copy .env.example to .env.local and configure your Supabase credentials:',
    createAccount: 'Create account',
    creatingAccount: 'Creating account...',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    forgotPasswordLink: 'Forgot your password?',
    forgotPasswordTitle: 'Reset password',
    forgotPasswordSubtitle: 'Enter your email to receive recovery instructions.',
    sendInstructions: 'Send instructions',
    sendingInstructions: 'Sending instructions...',
    backToLogin: 'Back to sign in',
    resetEmailSent: 'If an account exists for this email, you will receive a recovery link.',
    accountCreatedConfirm: 'Account created. Check your email to confirm your account.',
    errors: {
      emailRequired: 'Enter your email address.',
      emailInvalid: 'Enter a valid email address.',
      nameRequired: 'Enter your name.',
      nameInvalidChars: 'Name may only contain letters and spaces.',
      nameLength: `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`,
      passwordRequired: 'Enter your password.',
      passwordTooShort: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
      passwordTooLong: `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`,
      passwordMismatch: 'Passwords do not match.',
      invalidCredentials: 'Incorrect email or password.',
      userExists: 'An account already exists for this email.',
      emailNotConfirmed: 'You must confirm your email address before signing in.',
      weakPassword: 'The password does not meet the security policy configured in the service.',
      rateLimit: 'Too many attempts. Please wait a moment and try again.',
      network: 'Unable to connect to the authentication service.',
      notConfigured: 'Authentication is not configured.',
      generic: 'An unexpected error occurred. Please try again.',
    },
  },
};

export const translations: Record<Language, Translations> = { es, en };

/** Español por defecto; respeta la preferencia guardada si existe. */
export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    // localStorage no disponible: usar valor por defecto
  }
  return DEFAULT_LANGUAGE;
}

export function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Si no se puede persistir, el idioma sigue funcionando en la sesión actual
  }
}
