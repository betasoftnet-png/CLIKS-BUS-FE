import React, { useState, useRef, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User as UserIcon, LogOut, User, Globe, Coins, Flag, ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { useAuth, useCurrency } from "../context";

export function ProfileDropdown({
    onAccount,
    onLogout,
}) {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const dropdownRef = useRef(null);
    
    // Country Selector State
    const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
    const [countrySearchQuery, setCountrySearchQuery] = useState("");
    
    // Beta Trust Selector State
    const [isTrustOpen, setIsTrustOpen] = useState(false);
    
    // Currency & Country Context
    const { currency, setCurrency, country: selectedCountry, setCountry: setSelectedCountry } = useCurrency();

    // Currency Selector State
    const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false);
    const [currencySearchQuery, setCountrySearchQueryCurrency] = useState("");
    const selectedCurrency = `${currency.code} (${currency.symbol})`;

    const countries = [
        { name: "Afghanistan", flag: "🇦🇫" },
        { name: "Albania", flag: "🇦🇱" },
        { name: "Algeria", flag: "🇩🇿" },
        { name: "Andorra", flag: "🇦🇩" },
        { name: "Angola", flag: "🇦🇴" },
        { name: "Antigua and Barbuda", flag: "🇦🇬" },
        { name: "Argentina", flag: "🇦🇷" },
        { name: "Armenia", flag: "🇦🇲" },
        { name: "Australia", flag: "🇦🇺" },
        { name: "Austria", flag: "🇦🇹" },
        { name: "Azerbaijan", flag: "🇦🇿" },
        { name: "Bahamas", flag: "🇧🇸" },
        { name: "Bahrain", flag: "🇧🇭" },
        { name: "Bangladesh", flag: "🇧🇩" },
        { name: "Barbados", flag: "🇧🇧" },
        { name: "Belarus", flag: "🇧🇾" },
        { name: "Belgium", flag: "🇧🇪" },
        { name: "Belize", flag: "🇧🇿" },
        { name: "Benin", flag: "🇧🇯" },
        { name: "Bhutan", flag: "🇧🇹" },
        { name: "Bolivia", flag: "🇧🇴" },
        { name: "Bosnia and Herzegovina", flag: "🇧🇦" },
        { name: "Botswana", flag: "🇧🇼" },
        { name: "Brazil", flag: "🇧🇷" },
        { name: "Brunei", flag: "🇧🇳" },
        { name: "Bulgaria", flag: "🇧🇬" },
        { name: "Burkina Faso", flag: "🇧🇫" },
        { name: "Burundi", flag: "🇧🇮" },
        { name: "Cambodia", flag: "🇰🇭" },
        { name: "Cameroon", flag: "🇨🇲" },
        { name: "Canada", flag: "🇨🇦" },
        { name: "Cape Verde", flag: "🇨🇻" },
        { name: "Central African Republic", flag: "🇨🇫" },
        { name: "Chad", flag: "🇹🇩" },
        { name: "Chile", flag: "🇨🇱" },
        { name: "China", flag: "🇨🇳" },
        { name: "Colombia", flag: "🇨🇴" },
        { name: "Comoros", flag: "🇰🇲" },
        { name: "Congo", flag: "🇨🇬" },
        { name: "Costa Rica", flag: "🇨🇷" },
        { name: "Croatia", flag: "🇭🇷" },
        { name: "Cuba", flag: "🇨🇺" },
        { name: "Cyprus", flag: "🇨🇾" },
        { name: "Czech Republic", flag: "🇨🇿" },
        { name: "Democratic Republic of the Congo", flag: "🇨🇩" },
        { name: "Denmark", flag: "🇩🇰" },
        { name: "Djibouti", flag: "🇩🇯" },
        { name: "Dominica", flag: "🇩🇲" },
        { name: "Dominican Republic", flag: "🇩🇴" },
        { name: "Ecuador", flag: "🇪🇨" },
        { name: "Egypt", flag: "🇪🇬" },
        { name: "El Salvador", flag: "🇸🇻" },
        { name: "Equatorial Guinea", flag: "🇬🇶" },
        { name: "Eritrea", flag: "🇪🇷" },
        { name: "Estonia", flag: "🇪🇪" },
        { name: "Eswatini", flag: "🇸🇿" },
        { name: "Ethiopia", flag: "🇪🇹" },
        { name: "Fiji", flag: "🇫🇯" },
        { name: "Finland", flag: "🇫🇮" },
        { name: "France", flag: "🇫🇷" },
        { name: "Gabon", flag: "🇬🇦" },
        { name: "Gambia", flag: "🇬🇲" },
        { name: "Georgia", flag: "🇬🇪" },
        { name: "Germany", flag: "🇩🇪" },
        { name: "Ghana", flag: "🇬🇭" },
        { name: "Greece", flag: "🇬🇷" },
        { name: "Grenada", flag: "🇬🇩" },
        { name: "Guatemala", flag: "🇬🇹" },
        { name: "Guinea", flag: "🇬🇳" },
        { name: "Guinea-Bissau", flag: "🇬🇼" },
        { name: "Guyana", flag: "🇬🇾" },
        { name: "Haiti", flag: "🇭🇹" },
        { name: "Honduras", flag: "🇭🇳" },
        { name: "Hungary", flag: "🇭🇺" },
        { name: "Iceland", flag: "🇮🇸" },
        { name: "India", flag: "🇮🇳" },
        { name: "Indonesia", flag: "🇮🇩" },
        { name: "Iran", flag: "🇮🇷" },
        { name: "Iraq", flag: "🇮🇶" },
        { name: "Ireland", flag: "🇮🇪" },
        { name: "Israel", flag: "🇮🇱" },
        { name: "Italy", flag: "🇮🇹" },
        { name: "Ivory Coast", flag: "🇨🇮" },
        { name: "Jamaica", flag: "🇯🇲" },
        { name: "Japan", flag: "🇯🇵" },
        { name: "Jordan", flag: "🇯🇴" },
        { name: "Kazakhstan", flag: "🇰🇿" },
        { name: "Kenya", flag: "🇰🇪" },
        { name: "Kiribati", flag: "🇰🇮" },
        { name: "Kosovo", flag: "🇽🇰" },
        { name: "Kuwait", flag: "🇰🇼" },
        { name: "Kyrgyzstan", flag: "🇰🇬" },
        { name: "Laos", flag: "🇱🇦" },
        { name: "Latvia", flag: "🇱🇻" },
        { name: "Lebanon", flag: "🇱🇧" },
        { name: "Lesotho", flag: "🇱🇸" },
        { name: "Liberia", flag: "🇱🇷" },
        { name: "Libya", flag: "🇱🇾" },
        { name: "Liechtenstein", flag: "🇱🇮" },
        { name: "Lithuania", flag: "🇱🇹" },
        { name: "Luxembourg", flag: "🇱🇺" },
        { name: "Madagascar", flag: "🇲🇬" },
        { name: "Malawi", flag: "🇲🇼" },
        { name: "Malaysia", flag: "🇲🇾" },
        { name: "Maldives", flag: "🇲🇻" },
        { name: "Mali", flag: "🇲🇱" },
        { name: "Malta", flag: "🇲🇹" },
        { name: "Marshall Islands", flag: "🇲🇭" },
        { name: "Mauritania", flag: "🇲🇷" },
        { name: "Mauritius", flag: "🇲🇺" },
        { name: "Mexico", flag: "🇲🇽" },
        { name: "Micronesia", flag: "🇫🇲" },
        { name: "Moldova", flag: "🇲🇩" },
        { name: "Monaco", flag: "🇲🇨" },
        { name: "Mongolia", flag: "🇲🇳" },
        { name: "Montenegro", flag: "🇲🇪" },
        { name: "Morocco", flag: "🇲🇦" },
        { name: "Mozambique", flag: "🇲🇿" },
        { name: "Myanmar", flag: "🇲🇲" },
        { name: "Namibia", flag: "🇳🇦" },
        { name: "Nauru", flag: "🇳🇷" },
        { name: "Nepal", flag: "🇳🇵" },
        { name: "Netherlands", flag: "🇳🇱" },
        { name: "New Zealand", flag: "🇳🇿" },
        { name: "Nicaragua", flag: "🇳🇮" },
        { name: "Niger", flag: "🇳🇪" },
        { name: "Nigeria", flag: "🇳🇬" },
        { name: "North Korea", flag: "🇰🇵" },
        { name: "North Macedonia", flag: "🇲🇰" },
        { name: "Norway", flag: "🇳🇴" },
        { name: "Oman", flag: "🇴🇲" },
        { name: "Pakistan", flag: "🇵🇰" },
        { name: "Palau", flag: "🇵🇼" },
        { name: "Palestine", flag: "🇵🇸" },
        { name: "Panama", flag: "🇵🇦" },
        { name: "Papua New Guinea", flag: "🇵🇬" },
        { name: "Paraguay", flag: "🇵🇾" },
        { name: "Peru", flag: "🇵🇪" },
        { name: "Philippines", flag: "🇵🇭" },
        { name: "Poland", flag: "🇵🇱" },
        { name: "Portugal", flag: "🇵🇹" },
        { name: "Qatar", flag: "🇶🇦" },
        { name: "Romania", flag: "🇷🇴" },
        { name: "Russia", flag: "🇷🇺" },
        { name: "Rwanda", flag: "🇷🇼" },
        { name: "Saint Kitts and Nevis", flag: "🇰🇳" },
        { name: "Saint Lucia", flag: "🇱🇨" },
        { name: "Saint Vincent and the Grenadines", flag: "🇻🇨" },
        { name: "Samoa", flag: "🇼🇸" },
        { name: "San Marino", flag: "🇸🇲" },
        { name: "São Tomé and Príncipe", flag: "🇸🇹" },
        { name: "Saudi Arabia", flag: "🇸🇦" },
        { name: "Senegal", flag: "🇸🇳" },
        { name: "Serbia", flag: "🇷🇸" },
        { name: "Seychelles", flag: "🇸🇨" },
        { name: "Sierra Leone", flag: "🇸🇱" },
        { name: "Singapore", flag: "🇸🇬" },
        { name: "Slovakia", flag: "🇸🇰" },
        { name: "Slovenia", flag: "🇸🇮" },
        { name: "Solomon Islands", flag: "🇸🇧" },
        { name: "Somalia", flag: "🇸🇴" },
        { name: "South Africa", flag: "🇿🇦" },
        { name: "South Korea", flag: "🇰🇷" },
        { name: "South Sudan", flag: "🇸🇸" },
        { name: "Spain", flag: "🇪🇸" },
        { name: "Sri Lanka", flag: "🇱🇰" },
        { name: "Sudan", flag: "🇸🇩" },
        { name: "Suriname", flag: "🇸🇷" },
        { name: "Sweden", flag: "🇸🇪" },
        { name: "Switzerland", flag: "🇨🇭" },
        { name: "Syria", flag: "🇸🇾" },
        { name: "Tajikistan", flag: "🇹🇯" },
        { name: "Tanzania", flag: "🇹🇿" },
        { name: "Thailand", flag: "🇹🇭" },
        { name: "Timor-Leste", flag: "🇹🇱" },
        { name: "Togo", flag: "🇹🇬" },
        { name: "Tonga", flag: "🇹🇴" },
        { name: "Trinidad and Tobago", flag: "🇹🇹" },
        { name: "Tunisia", flag: "🇹🇳" },
        { name: "Turkey", flag: "🇹🇷" },
        { name: "Turkmenistan", flag: "🇹🇲" },
        { name: "Tuvalu", flag: "🇹🇻" },
        { name: "Uganda", flag: "🇺🇬" },
        { name: "Ukraine", flag: "🇺🇦" },
        { name: "United Arab Emirates", flag: "🇦🇪" },
        { name: "United Kingdom", flag: "🇬🇧" },
        { name: "United States", flag: "🇺🇸" },
        { name: "Uruguay", flag: "🇺🇾" },
        { name: "Uzbekistan", flag: "🇺🇿" },
        { name: "Vanuatu", flag: "🇻🇺" },
        { name: "Vatican City", flag: "🇻🇦" },
        { name: "Venezuela", flag: "🇻🇪" },
        { name: "Vietnam", flag: "🇻🇳" },
        { name: "Yemen", flag: "🇾🇪" },
        { name: "Zambia", flag: "🇿🇲" },
        { name: "Zimbabwe", flag: "🇿🇼" }
    ];

    const currencies = [
        { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", country: "UAE" },
        { code: "ARS", name: "Peso", symbol: "$", flag: "🇦🇷", country: "Argentina" },
        { code: "AUD", name: "Australian Dollar", symbol: "$", flag: "🇦🇺", country: "Australia" },
        { code: "BDT", name: "Taka", symbol: "৳", flag: "🇧🇩", country: "Bangladesh" },
        { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب", flag: "🇧🇭", country: "Bahrain" },
        { code: "BRL", name: "Real", symbol: "R$", flag: "🇧🇷", country: "Brazil" },
        { code: "CAD", name: "Canadian Dollar", symbol: "$", flag: "🇨🇦", country: "Canada" },
        { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", country: "Switzerland" },
        { code: "CLP", name: "Peso", symbol: "$", flag: "🇨🇱", country: "Chile" },
        { code: "CNY", name: "Yuan Renminbi", symbol: "¥", flag: "🇨🇳", country: "China" },
        { code: "COP", name: "Peso", symbol: "$", flag: "🇨🇴", country: "Colombia" },
        { code: "CRC", name: "Colón", symbol: "₡", flag: "🇨🇷", country: "Costa Rica" },
        { code: "CUP", name: "Cuban Peso", symbol: "₱", flag: "🇨🇺", country: "Cuba" },
        { code: "CZK", name: "Koruna", symbol: "Kč", flag: "🇨🇿", country: "Czech Republic" },
        { code: "DKK", name: "Krone", symbol: "kr", flag: "🇩🇰", country: "Denmark" },
        { code: "EGP", name: "Egyptian Pound", symbol: "£", flag: "🇪🇬", country: "Egypt" },
        { code: "ETB", name: "Birr", symbol: "Br", flag: "🇪🇹", country: "Ethiopia" },
        { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", country: "Eurozone" },
        { code: "GBP", name: "Pound Sterling", symbol: "£", flag: "🇬🇧", country: "United Kingdom" },
        { code: "GHS", name: "Cedi", symbol: "₵", flag: "🇬🇭", country: "Ghana" },
        { code: "HKD", name: "Hong Kong Dollar", symbol: "$", flag: "🇭🇰", country: "Hong Kong" },
        { code: "HUF", name: "Forint", symbol: "Ft", flag: "🇭🇺", country: "Hungary" },
        { code: "IDR", name: "Rupiah", symbol: "Rp", flag: "🇮🇩", country: "Indonesia" },
        { code: "ILS", name: "New Shekel", symbol: "₪", flag: "🇮🇱", country: "Israel" },
        { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", country: "India" },
        { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د", flag: "🇮🇶", country: "Iraq" },
        { code: "IRR", name: "Rial", symbol: "﷼", flag: "🇮🇷", country: "Iran" },
        { code: "JMD", name: "Jamaican Dollar", symbol: "J$", flag: "🇯🇲", country: "Jamaica" },
        { code: "JPY", name: "Yen", symbol: "¥", flag: "🇯🇵", country: "Japan" },
        { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", country: "Kenya" },
        { code: "KRW", name: "Won", symbol: "₩", flag: "🇰🇷", country: "South Korea" },
        { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", flag: "🇰🇼", country: "Kuwait" },
        { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰", country: "Sri Lanka" },
        { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", flag: "🇲🇦", country: "Morocco" },
        { code: "MMK", name: "Kyat", symbol: "Ks", flag: "🇲🇲", country: "Myanmar" },
        { code: "MXN", name: "Peso", symbol: "$", flag: "🇲🇽", country: "Mexico" },
        { code: "MYR", name: "Ringgit", symbol: "RM", flag: "🇲🇾", country: "Malaysia" },
        { code: "NGN", name: "Naira", symbol: "₦", flag: "🇳🇬", country: "Nigeria" },
        { code: "NOK", name: "Krone", symbol: "kr", flag: "🇳🇴", country: "Norway" },
        { code: "NPR", name: "Nepalese Rupee", symbol: "रू", flag: "🇳🇵", country: "Nepal" },
        { code: "NZD", name: "New Zealand Dollar", symbol: "$", flag: "🇳🇿", country: "New Zealand" },
        { code: "OMR", name: "Omani Rial", symbol: "﷼", flag: "🇴🇲", country: "Oman" },
        { code: "PEN", name: "Sol", symbol: "S/", flag: "🇵🇪", country: "Peru" },
        { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", country: "Philippines" },
        { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰", country: "Pakistan" },
        { code: "PLN", name: "Złoty", symbol: "zł", flag: "🇵🇱", country: "Poland" },
        { code: "PYG", name: "Guaraní", symbol: "₲", flag: "🇵🇾", country: "Paraguay" },
        { code: "QAR", name: "Qatari Riyal", symbol: "﷼", flag: "🇶🇦", country: "Qatar" },
        { code: "RUB", name: "Ruble", symbol: "₽", flag: "🇷🇺", country: "Russia" },
        { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦", country: "Saudi Arabia" },
        { code: "SEK", name: "Krona", symbol: "kr", flag: "🇸🇪", country: "Sweden" },
        { code: "SGD", name: "Singapore Dollar", symbol: "$", flag: "🇸🇬", country: "Singapore" },
        { code: "THB", name: "Baht", symbol: "฿", flag: "🇹🇭", country: "Thailand" },
        { code: "TND", name: "Tunisian Dinar", symbol: "د.ت", flag: "🇹🇳", country: "Tunisia" },
        { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", country: "Turkey" },
        { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$", flag: "🇹🇼", country: "Taiwan" },
        { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", country: "Tanzania" },
        { code: "UAH", name: "Hryvnia", symbol: "₴", flag: "🇺🇦", country: "Ukraine" },
        { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", country: "Uganda" },
        { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", country: "United States" },
        { code: "VES", name: "Bolívar", symbol: "Bs.", flag: "🇻🇪", country: "Venezuela" },
        { code: "VND", name: "Dong", symbol: "₫", flag: "🇻🇳", country: "Vietnam" },
        { code: "ZAR", name: "Rand", symbol: "R", flag: "🇿🇦", country: "South Africa" }
    ];

    const filteredCountries = countries.filter(c => 
        c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );

    const filteredCurrencies = currencies.filter(c => 
        c.code.toLowerCase().includes(currencySearchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(currencySearchQuery.toLowerCase())
    );

    const countryFlagObj = countries.find(c => c.name === selectedCountry);
    const countryFlag = countryFlagObj ? countryFlagObj.flag : "🌐";

    const displayEmail = user?.email || "Guest";
    const displayName = user?.username || user?.name || "User";

    // Calculate dynamic trust score
    const getBetaTrustScore = () => {
        if (!user) return { total: 85, base: 70, sub: 15, profile: 0, activity: 0 };
        const baseScore = 70;
        const subBonus = user.tier ? 15 : 0;
        const profileBonus = user.name && user.email ? 10 : 0;
        const todayStr = new Date().toDateString();
        const dailyActivity = Array.from(todayStr).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
        return {
            total: Math.min(100, baseScore + subBonus + profileBonus + dailyActivity),
            base: baseScore,
            sub: subBonus,
            profile: profileBonus,
            activity: dailyActivity
        };
    };
    const trustData = getBetaTrustScore();

    // Close on click outside & reset states
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
                setIsCountrySelectorOpen(false);
                setIsCurrencySelectorOpen(false);
                setIsTrustOpen(false);
                setCountrySearchQuery("");
                setCountrySearchQueryCurrency("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const styles = {
        container: {
            position: 'relative',
            display: 'inline-block',
        },
        triggerButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '6px 14px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
        },
        dropdownMenu: {
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            zIndex: 1000,
            width: '260px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            padding: '8px',
        },
        header: {
            padding: '16px',
            borderBottom: '1px solid #f3f4f6',
            marginBottom: '8px',
        },
        signedInText: {
            fontSize: '11px',
            fontWeight: 700,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
        },
        emailText: {
            fontSize: '14px',
            fontWeight: 700,
            color: '#111827',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        menuItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            textAlign: 'left',
            padding: '10px 12px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#4b5563',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
        },
        logoutItem: {
            color: '#ef4444',
        },
        submenuHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 10px',
            borderBottom: '1px solid #f3f4f6',
            marginBottom: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 800,
            color: '#111827',
            background: 'transparent',
            border: 'none',
            width: '100%',
            textAlign: 'left',
        },
        searchInputWrapper: {
            position: 'relative',
            margin: '0 8px 8px 8px',
        },
        searchInput: {
            width: '100%',
            padding: '8px 12px 8px 32px',
            fontSize: '13px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            outline: 'none',
            transition: 'border-color 0.15s ease',
            color: '#1f2937',
            fontWeight: '600',
        },
        searchIcon: {
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
        },
        countryList: {
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            padding: '0 4px',
        },
        countryItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            textAlign: 'left',
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 650,
            color: '#4b5563',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
        }
    };

    return (
        <div style={styles.container} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={styles.triggerButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
                <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#135029',
                    flexShrink: 0
                }}>
                    <UserIcon size={14} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
                    <span style={{ 
                        textTransform: 'none', 
                        letterSpacing: '0px',
                        fontSize: '12px',
                        fontWeight: '600',
                        maxWidth: '100px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.2',
                        color: '#FFFFFF'
                    }}>{displayName}</span>
                    <span style={{ 
                        fontSize: '9px', 
                        fontWeight: '700', 
                        color: 'rgba(255, 255, 255, 0.75)',
                        lineHeight: '1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                    }}>
                        <span>{countryFlag}</span>
                        <span style={{ 
                            maxWidth: '75px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{selectedCountry || "Country"}</span>
                    </span>
                </div>
                <ChevronDown
                    size={16}
                    style={{
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        opacity: 0.8
                    }}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        style={styles.dropdownMenu}
                    >
                        {isCountrySelectorOpen ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <button 
                                    onClick={() => { setIsCountrySelectorOpen(false); setCountrySearchQuery(""); }}
                                    style={styles.submenuHeader}
                                >
                                    <ArrowLeft size={16} />
                                    <span>Select Country</span>
                                </button>
                                
                                <div style={styles.searchInputWrapper}>
                                    <Search size={14} style={styles.searchIcon} />
                                    <input 
                                        type="text"
                                        placeholder="Search countries..."
                                        value={countrySearchQuery}
                                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                                        style={styles.searchInput}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>

                                <div style={styles.countryList}>
                                    {filteredCountries.length > 0 ? (
                                        filteredCountries.map((c) => (
                                            <button
                                                key={c.name}
                                                onClick={() => {
                                                    setSelectedCountry(c.name);
                                                    setIsCountrySelectorOpen(false);
                                                    setCountrySearchQuery("");
                                                }}
                                                style={styles.countryItem}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '16px' }}>{c.flag}</span>
                                                    <span>{c.name}</span>
                                                </div>
                                                {selectedCountry === c.name && (
                                                    <span style={{ color: '#10B981', fontSize: '11px', fontWeight: '800' }}>✓</span>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
                                            No countries found
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : isCurrencySelectorOpen ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <button 
                                    onClick={() => { setIsCurrencySelectorOpen(false); setCountrySearchQueryCurrency(""); }}
                                    style={styles.submenuHeader}
                                >
                                    <ArrowLeft size={16} />
                                    <span>Select Currency</span>
                                </button>
                                
                                <div style={styles.searchInputWrapper}>
                                    <Search size={14} style={styles.searchIcon} />
                                    <input 
                                        type="text"
                                        placeholder="Search currency..."
                                        value={currencySearchQuery}
                                        onChange={(e) => setCountrySearchQueryCurrency(e.target.value)}
                                        style={styles.searchInput}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>

                                <div style={styles.countryList}>
                                    {filteredCurrencies.length > 0 ? (
                                        filteredCurrencies.map((c) => (
                                            <button
                                                key={c.code}
                                                onClick={() => {
                                                    setCurrency({ code: c.code, symbol: c.symbol });
                                                    setIsCurrencySelectorOpen(false);
                                                    setCountrySearchQueryCurrency("");
                                                }}
                                                style={styles.countryItem}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '16px' }}>{c.flag}</span>
                                                    <span style={{ 
                                                        fontSize: '11px', 
                                                        fontWeight: '800', 
                                                        background: '#f3f4f6', 
                                                        padding: '2px 6px', 
                                                        borderRadius: '4px',
                                                        color: '#4b5563',
                                                        minWidth: '28px',
                                                        textAlign: 'center'
                                                    }}>{c.symbol}</span>
                                                    <span>{c.code} - {c.name}</span>
                                                </div>
                                                {selectedCurrency === `${c.code} (${c.symbol})` && (
                                                    <span style={{ color: '#10B981', fontSize: '11px', fontWeight: '800' }}>✓</span>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
                                            No currencies found
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={styles.header}>
                                    <p style={styles.signedInText}>Signed in as</p>
                                    <p style={styles.emailText} title={displayEmail}>{displayEmail}</p>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px', 
                                        marginTop: '6px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#4b5563'
                                    }}>
                                        <span>{countryFlag}</span>
                                        <span>{selectedCountry || "Select Country"}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <button
                                        onClick={() => { onAccount?.(); setOpen(false); }}
                                        style={styles.menuItem}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <User size={18} />
                                        Account Profile
                                    </button>
                                    
                                    <button
                                        style={styles.menuItem}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Globe size={18} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <span>Language</span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>English</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setIsCurrencySelectorOpen(true)}
                                        style={styles.menuItem}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Coins size={18} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <span>Currency</span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '550' }}>{selectedCurrency}</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setIsCountrySelectorOpen(true)}
                                        style={styles.menuItem}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Flag size={18} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <span>Country</span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '550' }}>{selectedCountry}</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setIsTrustOpen(!isTrustOpen)}
                                        style={styles.menuItem}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <ShieldCheck size={18} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <span>Beta Trust</span>
                                            <span style={{ fontSize: '11.5px', color: '#10B981', fontWeight: '800' }}>{trustData.total}%</span>
                                        </div>
                                    </button>

                                    {isTrustOpen && (
                                        <div style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            padding: '12px',
                                            margin: '4px 8px 8px 8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                <span style={{ color: '#64748b', fontWeight: '600' }}>Base Score</span>
                                                <span style={{ fontWeight: '700', color: '#10B981' }}>{trustData.base}%</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                <span style={{ color: '#64748b', fontWeight: '600' }}>Subscription Bonus</span>
                                                <span style={{ fontWeight: '700', color: trustData.sub > 0 ? '#10B981' : '#94a3b8' }}>+{trustData.sub}%</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                <span style={{ color: '#64748b', fontWeight: '600' }}>Profile Completeness</span>
                                                <span style={{ fontWeight: '700', color: trustData.profile > 0 ? '#10B981' : '#94a3b8' }}>+{trustData.profile}%</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                <span style={{ color: '#64748b', fontWeight: '600' }}>Daily Activity Bonus</span>
                                                <span style={{ fontWeight: '700', color: trustData.activity > 0 ? '#10B981' : '#94a3b8' }}>+{trustData.activity}%</span>
                                            </div>
                                            <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800' }}>
                                                <span style={{ color: '#1e293b' }}>Total Trust Score</span>
                                                <span style={{ color: '#047857' }}>{trustData.total}%</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '8px 0' }} />
                                    
                                    <button
                                        onClick={() => { onLogout?.(); setOpen(false); }}
                                        style={{ ...styles.menuItem, ...styles.logoutItem }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <LogOut size={18} />
                                        Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
