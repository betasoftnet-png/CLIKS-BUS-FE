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
    'TE-IN': {
        // Sidebar & Main Nav
        dashboard: 'డాష్‌బోర్డ్ (Dashboard)',
        generateInvoice: '+ కొత్త ఇన్వాయిస్ సృష్టించండి',
        finance: 'ఫైనాన్స్ (Finance)',
        tax: 'పన్ను & జిఎస్‌టి (Tax)',
        sales: 'సేల్స్ (Sales)',
        salesInvoice: 'సేల్స్ ఇన్వాయిస్ (Sales Invoice)',
        customers: 'వినియోగదారులు (Customers)',
        purchases: 'కొనుగోళ్లు (Purchases)',
        purchaseInvoice: 'కొనుగోలు బిల్లు (Purchase Invoice)',
        suppliers: 'సరఫరాదారులు (Suppliers)',
        inventory: 'ఇన్వెంటరీ & స్టాక్ (Inventory)',
        warehouses: 'గోదాములు (Godowns)',
        stockItems: 'స్టాక్ ఐటమ్స్',
        hr: 'హెచ్.ఆర్ & సిబ్బంది (HR)',
        posBilling: 'పిఒఎస్ బిల్లింగ్ (POS)',
        reports: 'నివేదికలు (Reports)',
        barcodeGen: 'బార్‌కోడ్ జనరేటర్',
        marketing: 'మార్కెటింగ్',
        settings: 'సెట్టింగ్‌లు (Settings)',
        helpSupport: 'సహాయం & మద్దతు',
        customization: 'కస్టమైజేషన్',
        advancedEngineConfig: 'అడ్వాన్స్‌డ్ ఇంజిన్ కాన్ఫిగరేషన్',
        back: 'వెనుకకు (BACK)',
        deployConfig: 'కాన్ఫిగర్ వర్తింపజేయి (DEPLOY)',

        // Tabs
        tabProfile: 'సంస్థ ప్రొఫైల్',
        tabGeneral: 'సాధారణ సెట్టింగ్‌లు',
        tabTransaction: 'లావాదేవీల నియమాలు',
        tabPrint: 'ప్రింట్ సెట్టింగ్‌లు',
        tabGst: 'పన్నులు & GST',
        tabParty: 'కాంటాక్ట్స్ (CRM)',
        tabAccounting: 'అకౌంటింగ్',
        tabPayment: 'చెల్లింపులు',
        tabFinPro: 'ఫిన్-ప్రో',
        tabBetaClub: 'బీటా క్లబ్',

        // General Config Section Titles & Labels
        applicationCore: 'అప్లికేషన్ కోర్',
        securityPasscode: 'సెక్యూరిటీ పాస్‌కోడ్',
        securityPasscodeDesc: 'హానికరమైన ఆపరేషన్లకు ముందు ప్రామాణీకరించండి.',
        preventNegativeInventory: 'నెగటివ్ ఇన్వెంటరీ నిరోధించండి',
        preventNegativeInventoryDesc: 'స్టాక్ సున్నా లేదా అంతకంటే తక్కువగా ఉన్నప్పుడు బిల్లింగ్ పరిమితం చేయండి.',
        lockContactGeneration: 'కాంటాక్ట్ జనరేషన్ లాక్ చేయండి',
        lockContactGenerationDesc: 'స్టాండర్డ్ ఫారమ్‌లలో కొత్త పరిచయాల సృష్టిని నిరోధించండి.',
        operationalFeatures: 'ఆపరేషనల్ ఫీచర్లు',
        activateDeliveryChallans: 'డెలివరీ చలాన్లను ప్రారంభించండి',
        reverseGoodsLogic: 'రివర్స్ గూడ్స్ లాజిక్',
        displayAmount: 'మొత్తాన్ని చూపించు',
        warehousing: 'వేర్‌హౌసింగ్ & గోదాములు',
        godownLinks: 'గోదాము లింకులు',
        integrity: 'భద్రత & ఆడిట్',
        autoBackup: 'ఆటో బ్యాకప్',
        auditTrail: 'ఆడిట్ ట్రెయిల్',
        preferences: 'ప్రాధాన్యతలు (Preferences)',
        darkMode: 'డార్క్ మోడ్ (Dark Mode)',
        darkModeDesc: 'అప్లికేషన్ కోసం డార్క్ థీమ్‌ను ఉపయోగించండి.',
        language: 'భాష (Language)',
        systemLanguageDesc: 'సిస్టమ్ లొకలైజేషన్ భాష',
        notifications: 'నోటిఫికేషన్లు',
        pushNotifications: 'పుష్ నోటిఫికేషన్లు',
        emailDigest: 'ఈమెయిల్ సారాంశం',
        privacySecurity: 'గోప్యత & భద్రత',
        publicProfile: 'పబ్లిక్ ప్రొఫైల్',
        twoFactor: 'రెండు-దశల ప్రామాణీకరణ (2FA)',
        dataSharing: 'డేటా & విశ్లేషణలు'
    },
    'TA-IN': {
        dashboard: 'டேஷ்போர்டு (Dashboard)',
        generateInvoice: '+ புதிய இன்வாய்ஸ் உருவாக்கு',
        finance: 'நிதி (Finance)',
        tax: 'வரி & ஜிஎஸ்டி (Tax)',
        sales: 'விற்பனை (Sales)',
        salesInvoice: 'விற்பனை பில்',
        customers: 'வாடிக்கையாளர்கள்',
        purchases: 'கொள்முதல் (Purchases)',
        purchaseInvoice: 'கொள்முதல் பில்',
        suppliers: 'விநியோகஸ்தர்கள்',
        inventory: 'சரக்கு & இருப்பு (Inventory)',
        warehouses: 'கிடங்குகள் (Godowns)',
        stockItems: 'சரக்கு பொருட்கள்',
        hr: 'ஊழியர்கள் மேலாண்மை',
        posBilling: 'POS பில்லிங்',
        reports: 'அறிக்கைகள் (Reports)',
        settings: 'அமைப்புகள் (Settings)',
        helpSupport: 'உதவி & ஆதரவு',
        customization: 'தனிப்பயனாக்கம்',
        advancedEngineConfig: 'மேம்பட்ட என்ஜின் அமைப்பு',
        back: 'பின்னால் (BACK)',
        deployConfig: 'சேமிக்க (DEPLOY)',

        tabProfile: 'நிறுவன சுயவிவரம்',
        tabGeneral: 'பொது அமைப்புகள்',
        tabTransaction: 'பரிவர்த்தனை விதிகள்',
        tabPrint: 'அச்சு அமைப்புகள்',
        tabGst: 'வரிகள் & ஜிஎஸ்டி',
        tabParty: 'தொடர்புகள் (CRM)',
        tabAccounting: 'கணக்கியல்',
        tabPayment: 'செலுத்துதல்கள்',
        tabFinPro: 'பின்-ப்ரோ',
        tabBetaClub: 'பீட்டா கிளப்',

        applicationCore: 'பயன்பாட்டு மையம்',
        securityPasscode: 'பாதுகாப்பு பாஸ்கோடு',
        securityPasscodeDesc: 'முக்கியமான செயல்களுக்கு முன் சரிபார்க்கவும்.',
        preventNegativeInventory: 'எதிர்மறை இருப்பைத் தவிர்',
        preventNegativeInventoryDesc: 'இருப்பு 0 ஆக இருக்கும்போது பில்லிங்கைக் கட்டுப்படுத்துங்கள்.',
        lockContactGeneration: 'புதிய தொடர்புகளை பூட்டு',
        operationalFeatures: 'இயக்க அம்சங்கள்',
        activateDeliveryChallans: 'டெலிவரி சலான்களை இயக்கு',
        reverseGoodsLogic: 'தலைகீழ் பொருட்கள் தர்க்கம்',
        displayAmount: 'தொகையைக் காட்டு',
        warehousing: 'கிடங்குகள்',
        godownLinks: 'கிடங்கு இணைப்புகள்',
        integrity: 'பாதுகாப்பு & தணிக்கை',
        autoBackup: 'தானியங்கி பேக்கப்',
        auditTrail: 'தணிக்கைப் பாதை',
        preferences: 'விருப்பத்தேர்வுகள் (Preferences)',
        darkMode: 'டார்க் மோட் (Dark Mode)',
        darkModeDesc: 'பயன்பாட்டிற்கு இருண்ட தீமைப் பயன்படுத்தவும்.',
        language: 'மொழி (Language)',
        systemLanguageDesc: 'அமைப்பு மொழி அமைப்புகள்',
        notifications: 'அறிவிப்புகள்',
        pushNotifications: 'புஷ் அறிவிப்புகள்',
        emailDigest: 'மின்னஞ்சல் சுருக்கம்',
        privacySecurity: 'தனியுரிமை & பாதுகாப்பு',
        publicProfile: 'பொது சுயவிவரம்',
        twoFactor: 'இரு காரணி அங்கீகாரம்',
        dataSharing: 'தரவு பகுப்பாய்வு'
    },
    'MR-IN': {
        dashboard: 'डॅशबोर्ड (Dashboard)',
        generateInvoice: '+ नवीन बिल बनवा',
        finance: 'वित्त (Finance)',
        tax: 'कर व जीएसटी (Tax)',
        sales: 'विक्री (Sales)',
        salesInvoice: 'विक्री बिल (Sales Invoice)',
        customers: 'ग्राहक (Customers)',
        purchases: 'खरेदी (Purchases)',
        purchaseInvoice: 'खरेदी बिल (Purchase Invoice)',
        suppliers: 'पुरवठादार (Suppliers)',
        inventory: 'इन्व्हेंटरी व साठा',
        warehouses: 'गोदाम (Godowns)',
        stockItems: 'स्टॉक आयटम्स',
        hr: 'एचआर व कर्मचारी',
        posBilling: 'POS बिलिंग',
        reports: 'अहवाल (Reports)',
        settings: 'सेटिंग्ज (Settings)',
        helpSupport: 'मदत व पाठिंबा',
        customization: 'कस्टमायझेशन',
        advancedEngineConfig: 'प्रगत इंजिन कॉन्फिगरेशन',
        back: 'मागे (BACK)',
        deployConfig: 'कॉन्फिग लागू करा (DEPLOY)',

        tabProfile: 'संस्था प्रोफाइल',
        tabGeneral: 'सामान्य सेटिंग्स',
        tabTransaction: 'व्यवहार नियम',
        tabPrint: 'प्रिंट सेटिंग्स',
        tabGst: 'कर व जीएसटी',
        tabParty: 'संपर्क (CRM)',
        tabAccounting: 'अकाउंटिंग',
        tabPayment: 'पेमेंट',
        tabFinPro: 'फिन-प्रो',
        tabBetaClub: 'बीटा क्लब',

        applicationCore: 'ॲप्लिकेशन कोर',
        securityPasscode: 'सुरक्षा पासकोड',
        securityPasscodeDesc: 'महत्वाच्या क्रियेपूर्वी सुरक्षा पासकोड तपासा.',
        preventNegativeInventory: 'नकारात्मक स्टॉक रोखा',
        preventNegativeInventoryDesc: 'साठा ० असताना बिलिंग रोखा.',
        lockContactGeneration: 'नवीन संपर्क निर्मिती लॉक करा',
        operationalFeatures: 'ऑपरेशनल वैशिष्ट्ये',
        activateDeliveryChallans: 'डिलिव्हरी चालान सुरू करा',
        reverseGoodsLogic: 'रिव्हर्स गुड्स लॉजिक',
        displayAmount: 'रक्कम दाखवा',
        warehousing: 'गोदाम व्यवस्थापन',
        godownLinks: 'गोदाम लिंक्स',
        integrity: 'सुरक्षा व बॅकअप',
        autoBackup: 'ऑटो बॅकअप',
        auditTrail: 'ऑडिट ट्रेल',
        preferences: 'पसंती (Preferences)',
        darkMode: 'डार्क मोड (Dark Mode)',
        darkModeDesc: 'इंटरफेससाठी डार्क थीम वापरा.',
        language: 'भाषा (Language)',
        systemLanguageDesc: 'प्रणाली भाषा',
        notifications: 'सूचना',
        pushNotifications: 'पुश सूचना',
        emailDigest: 'ईमेल सारांश',
        privacySecurity: 'गोपनीयता व सुरक्षा',
        publicProfile: 'सार्वजनिक प्रोफाइल',
        twoFactor: 'दुहेरी प्रमाणीकरण (2FA)',
        dataSharing: 'डेटा ॲनालिटिक्स'
    },
    'GU-IN': {
        dashboard: 'ડેશબોર્ડ (Dashboard)',
        generateInvoice: '+ નવું બિલ બનાવો',
        finance: 'નાણાકીય (Finance)',
        tax: 'ટેક્સ અને જીએસટી (Tax)',
        sales: 'વેચાણ (Sales)',
        salesInvoice: 'વેચાણ બિલ (Sales Invoice)',
        customers: 'ગ્રાહકો (Customers)',
        purchases: 'ખરીદી (Purchases)',
        purchaseInvoice: 'ખરીદી બિલ (Purchase Invoice)',
        suppliers: 'સપ્લાયર્સ (Suppliers)',
        inventory: 'ઇન્વેન્ટરી સ્ટોક',
        warehouses: 'ગોડાઉન (Godowns)',
        stockItems: 'સ્ટોક વસ્તુઓ',
        hr: 'એચઆર અને સ્ટાફ',
        posBilling: 'POS બિલિંગ',
        reports: 'રિપોર્ટ્સ (Reports)',
        settings: 'સેટિંગ્સ (Settings)',
        helpSupport: 'મદદ અને સપોર્ટ',
        customization: 'કસ્ટમાઇઝેશન',
        advancedEngineConfig: 'એડવાન્સ્ડ એન્જિન કન્ફિગરેશન',
        back: 'પાછા (BACK)',
        deployConfig: 'કન્ફિગ સેટ કરો (DEPLOY)',

        tabProfile: 'સંસ્થા પ્રોફાઇલ',
        tabGeneral: 'સામાન્ય સેટિંગ્સ',
        tabTransaction: 'વ્યવહાર નિયમો',
        tabPrint: 'પ્રિન્ટ સેટિંગ્સ',
        tabGst: 'ટેક્સ અને GST',
        tabParty: 'સંપર્કો (CRM)',
        tabAccounting: 'એકાઉન્ટિંગ',
        tabPayment: 'ચુકવણીઓ',
        tabFinPro: 'ફિન-પ્રો',
        tabBetaClub: 'બીટા ક્લબ',

        applicationCore: 'એપ્લિકેશન કોર',
        securityPasscode: 'સુરક્ષા પાસકોડ',
        securityPasscodeDesc: 'મહત્વપૂર્ણ ક્રિયાઓ પહેલાં ચકાસણી કરો.',
        preventNegativeInventory: 'નેગેટિવ ઇન્વેન્ટરી અટકાવો',
        preventNegativeInventoryDesc: 'જ્યારે સ્ટોક ૦ હોય ત્યારે બિલિંગ મર્યાદિત કરો.',
        lockContactGeneration: 'નવા સંપર્ક બનાવટ લોક કરો',
        operationalFeatures: 'ઓપરેશનલ ફીચર્સ',
        activateDeliveryChallans: 'ડિલિવરી ચલણ સક્રિય કરો',
        reverseGoodsLogic: 'રિવર્સ ગુડ્સ લોજિક',
        displayAmount: 'રકમ દર્શાવો',
        warehousing: 'ગોડાઉન મેનેજમેન્ટ',
        godownLinks: 'ગોડાઉન લિંક્સ',
        integrity: 'સુરક્ષા અને બેકઅપ',
        autoBackup: 'ઓટો બેકઅપ',
        auditTrail: 'ઓડિટ ટ્રેઇલ',
        preferences: 'પસંદગીઓ (Preferences)',
        darkMode: 'ડાર્ક મોડ (Dark Mode)',
        darkModeDesc: 'ઇન્ટરફેસ માટે ડાર્ક થીમનો ઉપયોગ કરો.',
        language: 'ભાષા (Language)',
        systemLanguageDesc: 'સિસ્ટમ સ્થાનિકીકરણ ભાષા',
        notifications: 'નોટિફિકેશન્સ',
        pushNotifications: 'પુશ નોટિફિકેશન્સ',
        emailDigest: 'ઈમેઇલ સારાંશ',
        privacySecurity: 'ગોપનીયતા અને સુરક્ષા',
        publicProfile: 'પબ્લિક પ્રોફાઇલ',
        twoFactor: 'ટુ-ફેક્ટર ઓથેન્ટિકેશન (2FA)',
        dataSharing: 'ડેટા એનાલિટિક્સ'
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('cliks_language');
            if (stored) return stored;

            const storedConfigRaw = localStorage.getItem('cliks_business_config') || localStorage.getItem('cliks_active_config');
            if (storedConfigRaw) {
                try {
                    const parsed = JSON.parse(storedConfigRaw);
                    if (parsed && parsed.language) return parsed.language;
                } catch (e) {}
            }
        }
        return 'EN-US';
    });

    const setLanguage = useCallback((langCode) => {
        if (!langCode) return;
        setLanguageState(langCode);
        localStorage.setItem('cliks_language', langCode);

        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('lang', langCode);
        }

        // Sync with cliks_business_config and cliks_active_config in localStorage
        try {
            const currentConfigRaw = localStorage.getItem('cliks_business_config') || '{}';
            const currentConfig = JSON.parse(currentConfigRaw);
            currentConfig.language = langCode;
            localStorage.setItem('cliks_business_config', JSON.stringify(currentConfig));
            localStorage.setItem('cliks_active_config', JSON.stringify(currentConfig));
        } catch (e) {}

        // Broadcast global update event so all pages & components re-render immediately
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
