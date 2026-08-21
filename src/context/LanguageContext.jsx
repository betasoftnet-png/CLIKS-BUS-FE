import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const translations = {
    'EN-US': {
        // Sidebar & Main Nav
        dashboard: 'Dashboard',
        generateInvoice: 'Generate Invoice',
        finance: 'Finance',
        tax: 'Tax',
        sales: 'Sales',
        salesInvoice: 'Sales Invoice',
        customers: 'Customers',
        purchases: 'Purchases',
        purchaseInvoice: 'Purchase Invoice',
        suppliers: 'Suppliers',
        inventory: 'Inventory',
        warehouses: 'Warehouses / Godowns',
        stockItems: 'Stock Items',
        hr: 'HR & Staffing',
        posBilling: 'POS Billing',
        reports: 'Reports',
        barcodeGen: 'Barcode Gen',
        marketing: 'Marketing',
        settings: 'Settings',
        helpSupport: 'Help & Support',
        customization: 'Customization',
        advancedEngineConfig: 'Advanced Engine Configuration',
        back: 'BACK',
        deployConfig: 'DEPLOY CONFIG',

        // Tabs
        tabProfile: 'Org Profile',
        tabGeneral: 'General',
        tabTransaction: 'Transaction',
        tabPrint: 'Print',
        tabGst: 'Taxes & GST',
        tabParty: 'Contacts',
        tabAccounting: 'Accounting',
        tabPayment: 'Payment',
        tabFinPro: 'FIN-PRO',
        tabBetaClub: 'Beta Club',

        // General Config Section Titles & Labels
        applicationCore: 'Application Core',
        securityPasscode: 'Security Passcode',
        securityPasscodeDesc: 'Validate auth tokens before destructive operations.',
        preventNegativeInventory: 'Prevent Negative Inventory',
        preventNegativeInventoryDesc: 'Restrict invoicing items when stock level <= 0.',
        lockContactGeneration: 'Lock Contact Generation',
        lockContactGenerationDesc: 'Prevent new customer/supplier records within standard transaction forms.',
        operationalFeatures: 'Operational Features',
        activateDeliveryChallans: 'Activate Delivery Challans',
        reverseGoodsLogic: 'Reverse Goods Logic',
        displayAmount: 'Display Amount',
        warehousing: 'Warehousing',
        godownLinks: 'Godown Links',
        integrity: 'Integrity & Security',
        autoBackup: 'Auto Backup',
        auditTrail: 'Audit Trail',
        preferences: 'Preferences',
        darkMode: 'Dark Mode',
        darkModeDesc: 'Use a dark theme for the application interface.',
        language: 'Language',
        systemLanguageDesc: 'System localization language',
        notifications: 'Notifications',
        pushNotifications: 'Push Notifications',
        emailDigest: 'Email Digest',
        privacySecurity: 'Privacy & Security',
        publicProfile: 'Public Profile',
        twoFactor: 'Two-Factor Authentication',
        dataSharing: 'Data & Analytics'
    },
    'HI-IN': {
        // Sidebar & Main Nav
        dashboard: 'डैशबोर्ड (Dashboard)',
        generateInvoice: '+ नया बिल बनाएं',
        finance: 'वित्त (Finance)',
        tax: 'कर एवं टैक्स (Tax)',
        sales: 'बिक्री (Sales)',
        salesInvoice: 'बिक्री बिल (Sales Invoice)',
        customers: 'ग्राहक (Customers)',
        purchases: 'खरीद (Purchases)',
        purchaseInvoice: 'खरीद बिल (Purchase Invoice)',
        suppliers: 'आपूर्तिकर्ता (Suppliers)',
        inventory: 'इन्वेंटरी और स्टॉक',
        warehouses: 'गोदाम (Warehouses / Godowns)',
        stockItems: 'स्टॉक आइटम सूची',
        hr: 'एचआर और कर्मचारी',
        posBilling: 'पीओएस बिलिंग (POS)',
        reports: 'रिपोर्ट और खाते',
        barcodeGen: 'बारकोड जनरेटर',
        marketing: 'मार्केटिंग एवं प्रचार',
        settings: 'सेटिंग्स (Settings)',
        helpSupport: 'सहायता एवं सपोर्ट',
        customization: 'कस्टमाइज़ेशन',
        advancedEngineConfig: 'उन्नत इंजन कॉन्फ़िगरेशन',
        back: 'वापस जाएं',
        deployConfig: 'कॉन्फ़िग सहेजें (DEPLOY)',

        // Tabs
        tabProfile: 'फर्म प्रोफ़ाइल',
        tabGeneral: 'सामान्य सेटिंग्स',
        tabTransaction: 'लेन-देन नियम',
        tabPrint: 'प्रिंट सेटिंग्स',
        tabGst: 'कर एवं जीएसटी',
        tabParty: 'संपर्क (CRM)',
        tabAccounting: 'लेखांकन (Accounting)',
        tabPayment: 'भुगतान (Payments)',
        tabFinPro: 'फिन-प्रो (FIN-PRO)',
        tabBetaClub: 'बीटा क्लब',

        // General Config Section Titles & Labels
        applicationCore: 'एप्लिकेशन कोर (Core)',
        securityPasscode: 'सुरक्षा पासकोड',
        securityPasscodeDesc: 'हटाने या बदलाव से पहले सुरक्षा पासकोड मांगें।',
        preventNegativeInventory: 'ऋणात्मक स्टॉक रोकें',
        preventNegativeInventoryDesc: 'स्टॉक 0 या कम होने पर बिलिंग रोकें।',
        lockContactGeneration: 'नया संपर्क निर्माण लॉक करें',
        lockContactGenerationDesc: 'बिलिंग फॉर्म से नया ग्राहक/सप्लायर जोड़ने पर रोक लगाएं।',
        operationalFeatures: 'परिचालन सुविधाएं',
        activateDeliveryChallans: 'डिलीवरी चालान चालू करें',
        reverseGoodsLogic: 'रिवर्स गुड्स लॉजिक',
        displayAmount: 'राशि दिखाएं',
        warehousing: 'गोदाम एवं वेयरहाउस',
        godownLinks: 'गोदाम लिंक (Godown Links)',
        integrity: 'सुरक्षा एवं बैकअप',
        autoBackup: 'ऑटो बैकअप',
        auditTrail: 'ऑडिट ट्रेल (गतिविधि रिकॉर्ड)',
        preferences: 'प्राथमिकताएं (Preferences)',
        darkMode: 'डार्क मोड (Dark Mode)',
        darkModeDesc: 'एप्लिकेशन इंटरफेस के लिए डार्क थीम का उपयोग करें।',
        language: 'भाषा (Language)',
        systemLanguageDesc: 'प्रणाली स्थानीयकरण भाषा',
        notifications: 'सूचनाएं (Notifications)',
        pushNotifications: 'पुश सूचनाएं',
        emailDigest: 'साप्ताहिक ईमेल सारांश',
        privacySecurity: 'गोपनीयता और सुरक्षा',
        publicProfile: 'सार्वजनिक प्रोफ़ाइल',
        twoFactor: 'दो-चरणीय प्रमाणीकरण (2FA)',
        dataSharing: 'डेटा और विश्लेषण'
    },
    'TA-IN': {
        dashboard: 'டேஷ்போர்டு',
        generateInvoice: '+ இன்வாய்ஸ் உருவாக்கு',
        finance: 'நிதி (Finance)',
        tax: 'வரி (Tax)',
        sales: 'விற்பனை (Sales)',
        salesInvoice: 'விற்பனை பில்',
        customers: 'வாடிக்கையாளர்கள்',
        purchases: 'கொள்முதல் (Purchases)',
        purchaseInvoice: 'கொள்முதல் பில்',
        suppliers: 'விநியோகஸ்தர்கள்',
        inventory: 'சரக்கு இருப்பு',
        warehouses: 'கிடங்குகள் (Godowns)',
        stockItems: 'சரக்கு பொருட்கள்',
        hr: 'ஊழியர்கள் மேலாண்மை',
        posBilling: 'POS பில்லிங்',
        reports: 'அறிக்கைகள்',
        settings: 'அமைப்புகள்',
        helpSupport: 'உதவி & ஆதரவு',
        preferences: 'விருப்பத்தேர்வுகள்',
        darkMode: 'டார்க் மோட்',
        language: 'மொழி',
        securityPasscode: 'பாதுகாப்பு பாஸ்கோடு'
    },
    'TE-IN': {
        dashboard: 'డాష్‌బోర్డ్',
        generateInvoice: '+ ఇన్వాయిస్ సృష్టించండి',
        finance: 'ఫైనాన్స్',
        tax: 'పన్ను (Tax)',
        sales: 'సేల్స్',
        salesInvoice: 'సేల్స్ ఇన్వాయిస్',
        customers: 'వినియోగదారులు',
        purchases: 'కొనుగోళ్లు',
        purchaseInvoice: 'కొనుగోలు ఇన్వాయిస్',
        suppliers: 'సఫలయర్లు',
        inventory: 'ఇన్వెంటరీ స్టాక్',
        warehouses: 'గోదాములు',
        reports: 'నివేదికలు',
        settings: 'సెట్టింగ్‌లు',
        preferences: 'ప్రాధాన్యతలు',
        darkMode: 'డార్క్ మోడ్',
        language: 'భాష'
    },
    'MR-IN': {
        dashboard: 'डॅशबोर्ड',
        generateInvoice: '+ नवीन बिल बनवा',
        finance: 'वित्त (Finance)',
        tax: 'कर (Tax)',
        sales: 'विक्री (Sales)',
        salesInvoice: 'विक्री बिल',
        customers: 'ग्राहक',
        purchases: 'खरेदी (Purchases)',
        purchaseInvoice: 'खरेदी बिल',
        suppliers: 'पुरवठादार',
        inventory: 'इन्व्हेंटरी व साठा',
        warehouses: 'गोदाम',
        reports: 'अहवाल',
        settings: 'सेटिंग्ज',
        preferences: 'पसंती (Preferences)',
        darkMode: 'डार्क मोड',
        language: 'भाषा'
    },
    'GU-IN': {
        dashboard: 'ડેશબોર્ડ',
        generateInvoice: '+ નવું બિલ બનાવો',
        finance: 'નાણાકીય (Finance)',
        tax: 'ટેક્સ (Tax)',
        sales: 'વેચાણ (Sales)',
        salesInvoice: 'વેચાણ બિલ',
        customers: 'ગ્રાહકો',
        purchases: 'ખરીદી (Purchases)',
        purchaseInvoice: 'ખરીદી બિલ',
        suppliers: 'સપ્લાયર્સ',
        inventory: 'ઇન્વેન્ટરી સ્ટોક',
        warehouses: 'ગોડાઉન',
        reports: 'રિપોર્ટ્સ',
        settings: 'સેટિંગ્સ',
        preferences: 'પસંદગીઓ',
        darkMode: 'ડાર્ક મોડ',
        language: 'ભાષા'
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('cliks_language') || 'EN-US';
        }
        return 'EN-US';
    });

    const setLanguage = useCallback((langCode) => {
        setLanguageState(langCode);
        localStorage.setItem('cliks_language', langCode);
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('lang', langCode);
        }
        window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: { language: langCode } }));
    }, []);

    useEffect(() => {
        const handleSync = () => {
            const stored = localStorage.getItem('cliks_language');
            if (stored && stored !== language) {
                setLanguageState(stored);
            }
        };
        window.addEventListener('cliksConfigUpdated', handleSync);
        window.addEventListener('storage', handleSync);
        return () => {
            window.removeEventListener('cliksConfigUpdated', handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, [language]);

    const t = useCallback((key, fallback) => {
        const currentDict = translations[language] || translations['EN-US'];
        if (currentDict && currentDict[key]) {
            return currentDict[key];
        }
        const defaultDict = translations['EN-US'];
        if (defaultDict && defaultDict[key]) {
            return defaultDict[key];
        }
        return fallback || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        return {
            language: 'EN-US',
            setLanguage: () => {},
            t: (key, fallback) => fallback || key,
            translations
        };
    }
    return ctx;
};
