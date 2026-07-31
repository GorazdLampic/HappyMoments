/**
 * Nice Numbers — Gift Store
 * Personalized gifts via Printful print-on-demand.
 * Each product features the customer's milestone number as the design.
 */

// ============================================================
// GIFT COLLECTIONS — curated product bundles by milestone personality
// ============================================================

const GIFT_COLLECTIONS = {
    'Number Nerd': {
        tagline: 'For minds that love the math behind the moment',
        products: ['mug', 'tumbler'],
        icon: '&#129504;'  // brain emoji
    },
    'Celebrator': {
        tagline: 'Toast to life\'s perfectly round moments',
        products: ['mug', 'tshirt'],
        icon: '&#127881;'  // party popper
    },
    'Romantic': {
        tagline: 'Love written in numbers',
        products: ['mug', 'tumbler'],
        icon: '&#10084;'   // heart
    },
    'Family': {
        tagline: 'Numbers that bring everyone together',
        products: ['tshirt', 'mug'],
        icon: '&#128106;'  // family
    },
    'Achiever': {
        tagline: 'Epic milestones deserve epic keepsakes',
        products: ['tshirt', 'tumbler'],
        icon: '&#127942;'  // trophy
    },
    'Lucky': {
        tagline: 'Prosperity, fortune, and auspicious vibes',
        products: ['mug', 'tumbler'],
        icon: '&#127882;'  // red gift
    },
    'Minimalist': {
        tagline: 'Elegant numbers, clean design',
        products: ['tumbler'],
        icon: '&#9674;'    // diamond
    },
    'Adventurer': {
        tagline: 'For those who see patterns everywhere',
        products: ['tumbler', 'tshirt'],
        icon: '&#127757;'  // globe
    }
};

const GIFT_CATALOG = [
    {
        id: 'mug',
        name: 'Milestone Mug',
        description: 'White ceramic 11oz mug with your milestone number',
        price: 22.00,
        currency: 'EUR',
        icon: '&#9749;',
        printful_variant: 1320,
        printful_product: 19,
        photo: 'img/gift-mug.jpg',
        tagline: '{value} {unit} — every morning',
        designType: 'mug',
        categories: ['birthday', 'round', 'repdigit', 'palindrome', 'generic']
    },
    {
        id: 'tshirt',
        name: 'Milestone T-Shirt',
        description: 'Soft cotton t-shirt with your milestone number',
        price: 28.00,
        currency: 'EUR',
        icon: '&#128085;',
        printful_variant: 4012,
        printful_product: 71,
        photo: 'img/gift-tshirt.jpg',
        tagline: 'Wearing {value} with pride',
        designType: 'tshirt',
        hasSize: true,
        categories: ['fibonacci', 'power_of_2', 'scientific', 'repdigit', 'generic']
    },
    {
        id: 'tumbler',
        name: 'Milestone Tumbler',
        description: 'Insulated 20oz stainless tumbler with straw — your milestone number',
        price: 44.00,
        currency: 'EUR',
        icon: '&#129380;',
        printful_variant: 19111,
        printful_product: 742,
        photo: 'img/gift-tumbler.jpg',
        tagline: 'Sip to {value}',
        designType: 'tumbler',
        categories: ['round', 'repdigit', 'birthday', 'scientific', 'generic']
    }
];

// Shipping destinations — the full Printful /countries list (regenerate with
// tools/gen-shipping-countries.js). Common destinations pinned first.
const SHIPPING_COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'AT', name: 'Austria' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'HR', name: 'Croatia' },
    { code: 'IE', name: 'Ireland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'SE', name: 'Sweden' },
    { code: 'DK', name: 'Denmark' },
    { code: 'NO', name: 'Norway' },
    { code: 'FI', name: 'Finland' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' },
    { code: 'GR', name: 'Greece' },
    { code: 'RO', name: 'Romania' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'Korea, Republic of' },
    { code: 'SG', name: 'Singapore' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'IN', name: 'India' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AI', name: 'Anguilla' },
    { code: 'AQ', name: 'Antarctica' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AW', name: 'Aruba' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BM', name: 'Bermuda' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BV', name: 'Bouvet Island' },
    { code: 'IO', name: 'British Indian Ocean Territory' },
    { code: 'BN', name: 'Brunei Darussalam' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CV', name: 'Cape Verde' },
    { code: 'KY', name: 'Cayman Islands' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CX', name: 'Christmas Island' },
    { code: 'CC', name: 'Cocos (Keeling) Islands' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'Congo, the Democratic Republic of the' },
    { code: 'CK', name: 'Cook Islands' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CI', name: 'Cote D\'Ivoire' },
    { code: 'CU', name: 'Cuba, Republic of' },
    { code: 'CW', name: 'Curacao' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'FK', name: 'Falkland Islands (Malvinas)' },
    { code: 'FO', name: 'Faroe Islands' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'GF', name: 'French Guiana' },
    { code: 'PF', name: 'French Polynesia' },
    { code: 'TF', name: 'French Southern Territories' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GI', name: 'Gibraltar' },
    { code: 'GL', name: 'Greenland' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GP', name: 'Guadeloupe' },
    { code: 'GU', name: 'Guam' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GG', name: 'Guernsey' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HM', name: 'Heard Island and Mcdonald Islands' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'IS', name: 'Iceland' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IR', name: 'Iran, Islamic Republic of' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IM', name: 'Isle of Man' },
    { code: 'IL', name: 'Israel' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JE', name: 'Jersey' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KP', name: 'Korea, Democratic People\'s Republic of' },
    { code: 'XK', name: 'Kosovo' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LA', name: 'Lao People\'s Democratic Republic' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libyan Arab Jamahiriya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MO', name: 'Macao' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'MQ', name: 'Martinique' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'YT', name: 'Mayotte' },
    { code: 'FM', name: 'Micronesia, Federated States of' },
    { code: 'MD', name: 'Moldova, Republic of' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MS', name: 'Montserrat' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'AN', name: 'Netherlands Antilles' },
    { code: 'NC', name: 'New Caledonia' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NU', name: 'Niue' },
    { code: 'NF', name: 'Norfolk Island' },
    { code: 'MK', name: 'North Macedonia, Republic of' },
    { code: 'MP', name: 'Northern Mariana Islands' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PW', name: 'Palau' },
    { code: 'PS', name: 'Palestinian Territory, Occupied' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PN', name: 'Pitcairn' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RE', name: 'Reunion' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'SH', name: 'Saint Helena' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'MF', name: 'Saint Martin' },
    { code: 'PM', name: 'Saint Pierre and Miquelon' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'WS', name: 'Samoa' },
    { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'Sao Tome and Principe' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'SN', name: 'Senegal' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SX', name: 'Sint Maarten' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'SO', name: 'Somalia' },
    { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SJ', name: 'Svalbard and Jan Mayen' },
    { code: 'SY', name: 'Syrian Arab Republic' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'TG', name: 'Togo' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'TO', name: 'Tonga' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'TR', name: 'Turkey' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'TC', name: 'Turks and Caicos Islands' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'UG', name: 'Uganda' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'UM', name: 'United States Minor Outlying Islands' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'VA', name: 'Vatican City' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'VG', name: 'Virgin Islands, British' },
    { code: 'VI', name: 'Virgin Islands, U.S.' },
    { code: 'WF', name: 'Wallis and Futuna' },
    { code: 'EH', name: 'Western Sahara' },
    { code: 'YE', name: 'Yemen' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' }
];

// Countries where Printful REQUIRES a state/province code. The gift form shows a
// State dropdown for these and forwards state_code to the order.
const COUNTRY_STATES = {
    AU: [{ code: 'ACT', name: 'Australian Capital Territory' }, { code: 'NSW', name: 'New South Wales' }, { code: 'NT', name: 'Northern Territory' }, { code: 'QLD', name: 'Queensland' }, { code: 'SA', name: 'South Australia' }, { code: 'TAS', name: 'Tasmania' }, { code: 'VIC', name: 'Victoria' }, { code: 'WA', name: 'Western Australia' }],
    BR: [{ code: 'AC', name: 'Acre' }, { code: 'AL', name: 'Alagoas' }, { code: 'AM', name: 'Amazonas' }, { code: 'AP', name: 'Amapá' }, { code: 'BA', name: 'Bahia' }, { code: 'CE', name: 'Ceará' }, { code: 'DF', name: 'Distrito Federal' }, { code: 'ES', name: 'Espírito Santo' }, { code: 'GO', name: 'Goiás' }, { code: 'MA', name: 'Maranhão' }, { code: 'MG', name: 'Minas Gerais' }, { code: 'MS', name: 'Mato Grosso do Sul' }, { code: 'MT', name: 'Mato Grosso' }, { code: 'PA', name: 'Pará' }, { code: 'PB', name: 'Paraíba' }, { code: 'PE', name: 'Pernambuco' }, { code: 'PI', name: 'Piauí' }, { code: 'PR', name: 'Paraná' }, { code: 'RJ', name: 'Rio de Janeiro' }, { code: 'RN', name: 'Rio Grande do Norte' }, { code: 'RO', name: 'Rondônia' }, { code: 'RR', name: 'Roraima' }, { code: 'RS', name: 'Rio Grande do Sul' }, { code: 'SC', name: 'Santa Catarina' }, { code: 'SE', name: 'Sergipe' }, { code: 'SP', name: 'São Paulo' }, { code: 'TO', name: 'Tocantins' }],
    CA: [{ code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' }, { code: 'MB', name: 'Manitoba' }, { code: 'NB', name: 'New Brunswick' }, { code: 'NL', name: 'Newfoundland and Labrador' }, { code: 'NS', name: 'Nova Scotia' }, { code: 'NT', name: 'Northwest Territories' }, { code: 'NU', name: 'Nunavut' }, { code: 'ON', name: 'Ontario' }, { code: 'PE', name: 'Prince Edward Island' }, { code: 'QC', name: 'Quebec' }, { code: 'SK', name: 'Saskatchewan' }, { code: 'YT', name: 'Yukon' }],
    JP: [{ code: '01', name: 'Hokkaido' }, { code: '02', name: 'Aomori' }, { code: '03', name: 'Iwate' }, { code: '04', name: 'Miyagi' }, { code: '05', name: 'Akita' }, { code: '06', name: 'Yamagata' }, { code: '07', name: 'Fukushima' }, { code: '08', name: 'Ibaraki' }, { code: '09', name: 'Tochigi' }, { code: '10', name: 'Gunma' }, { code: '11', name: 'Saitama' }, { code: '12', name: 'Chiba' }, { code: '13', name: 'Tokyo' }, { code: '14', name: 'Kanagawa' }, { code: '15', name: 'Niigata' }, { code: '16', name: 'Toyama' }, { code: '17', name: 'Ishikawa' }, { code: '18', name: 'Fukui' }, { code: '19', name: 'Yamanashi' }, { code: '20', name: 'Nagano' }, { code: '21', name: 'Gifu' }, { code: '22', name: 'Shizuoka' }, { code: '23', name: 'Aichi' }, { code: '24', name: 'Mie' }, { code: '25', name: 'Shiga' }, { code: '26', name: 'Kyoto' }, { code: '27', name: 'Osaka' }, { code: '28', name: 'Hyogo' }, { code: '29', name: 'Nara' }, { code: '30', name: 'Wakayama' }, { code: '31', name: 'Tottori' }, { code: '32', name: 'Shimane' }, { code: '33', name: 'Okayama' }, { code: '34', name: 'Hiroshima' }, { code: '35', name: 'Yamaguchi' }, { code: '36', name: 'Tokushima' }, { code: '37', name: 'Kagawa' }, { code: '38', name: 'Ehime' }, { code: '39', name: 'Kochi' }, { code: '40', name: 'Fukuoka' }, { code: '41', name: 'Saga' }, { code: '42', name: 'Nagasaki' }, { code: '43', name: 'Kumamoto' }, { code: '44', name: 'Oita' }, { code: '45', name: 'Miyazaki' }, { code: '46', name: 'Kagoshima' }, { code: '47', name: 'Okinawa' }],
    US: [{ code: 'AA', name: 'Armed Forces Americas (except Canada)' }, { code: 'AE', name: 'Armed Forces' }, { code: 'AK', name: 'Alaska' }, { code: 'AL', name: 'Alabama' }, { code: 'AP', name: 'Armed Forces Pacific' }, { code: 'AR', name: 'Arkansas' }, { code: 'AS', name: 'American Samoa' }, { code: 'AZ', name: 'Arizona' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' }, { code: 'CT', name: 'Connecticut' }, { code: 'DC', name: 'District of Columbia' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' }, { code: 'FM', name: 'Federated States of Micronesia' }, { code: 'GA', name: 'Georgia' }, { code: 'GU', name: 'Guam' }, { code: 'HI', name: 'Hawaii' }, { code: 'IA', name: 'Iowa' }, { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' }, { code: 'MA', name: 'Massachusetts' }, { code: 'MD', name: 'Maryland' }, { code: 'ME', name: 'Maine' }, { code: 'MH', name: 'Marshall Islands' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MO', name: 'Missouri' }, { code: 'MP', name: 'Northern Mariana Islands' }, { code: 'MS', name: 'Mississippi' }, { code: 'MT', name: 'Montana' }, { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'NE', name: 'Nebraska' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NV', name: 'Nevada' }, { code: 'NY', name: 'New York' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'PR', name: 'Puerto Rico' }, { code: 'PW', name: 'Palau' }, { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VA', name: 'Virginia' }, { code: 'VI', name: 'Virgin Islands' }, { code: 'VT', name: 'Vermont' }, { code: 'WA', name: 'Washington' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WV', name: 'West Virginia' }, { code: 'WY', name: 'Wyoming' }]
};

function getGiftSuggestions(milestone, maxItems) {
    maxItems = maxItems || 4;
    if (!milestone) return [];

    const collection = getGiftCollection(milestone);
    const collectionDef = GIFT_COLLECTIONS[collection.name];
    const collectionProductIds = collectionDef ? collectionDef.products : [];

    // Score products: collection products first, then category match, then generic
    const category = getGiftCategory(milestone);
    const scored = GIFT_CATALOG.map(product => {
        let score = 0;
        // Collection match is the strongest signal
        if (collectionProductIds.includes(product.id)) score += 20;
        // Category match from the original system still contributes
        if (product.categories.includes(category)) score += 10;
        if (product.categories.includes('generic')) score += 2;
        // Add slight randomness for variety among equally scored items
        score += Math.random() * 1.5;
        return { product, score, collection: collection.name };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxItems).map(s => {
        // Attach collection context to each returned product
        const p = Object.assign({}, s.product);
        p._collectionName = s.collection;
        return p;
    });
}

/**
 * Determine the gift collection for a milestone based on its characteristics.
 * Returns { name: string, reason: string }.
 */
function getGiftCollection(milestone) {
    if (!milestone) return { name: 'Celebrator', reason: 'Default collection' };

    const type = milestone.type || '';
    const value = milestone.value || 0;
    const eventId = milestone.eventId || '';
    const description = (milestone.description || '').toLowerCase();
    const isCombined = eventId === 'combined_sum' || eventId === 'combined_ratio' ||
                       eventId === 'combined_duration' || eventId === 'combined';

    // --- Romantic: couple/love milestones ---
    // 520 = "I love you", 1314 = "forever", 5201314 = "I love you forever"
    const romanticValues = [520, 521, 1314, 1688, 5201314];
    if (romanticValues.includes(value)) {
        return { name: 'Romantic', reason: 'Love number (' + value + ')' };
    }
    // Combined ratio milestones (age ratios) are inherently relational
    if (eventId === 'combined_ratio') {
        return { name: 'Romantic', reason: 'Relationship ratio milestone' };
    }

    // --- Achiever: big milestones ---
    if (milestone.isBigMilestone) {
        return { name: 'Achiever', reason: 'Big milestone' };
    }
    // Billion seconds (value >= 1,000,000,000 in seconds)
    if (value >= 1000000000 && (milestone.unitName === 'sec' || milestone.unit === 'seconds')) {
        return { name: 'Achiever', reason: 'Billion seconds milestone' };
    }
    // 10K+ days
    if (value >= 10000 && (milestone.unitName === 'd' || milestone.unit === 'days')) {
        return { name: 'Achiever', reason: value.toLocaleString() + ' days milestone' };
    }

    // --- Family: team/combined sum milestones ---
    if (eventId === 'combined_sum' || eventId === 'combined_duration' || eventId === 'combined') {
        return { name: 'Family', reason: 'Combined milestone' };
    }

    // --- Lucky: Asian auspicious numbers ---
    if (type === 'asian_lucky') {
        return { name: 'Lucky', reason: 'Auspicious number' };
    }
    const luckyValues = [88, 99, 168, 188, 288, 388, 888, 999, 1088, 1188,
                         1888, 2888, 3888, 6666, 8888, 9999, 88888, 99999];
    if (luckyValues.includes(value)) {
        return { name: 'Lucky', reason: 'Lucky number (' + value + ')' };
    }

    // --- Number Nerd: scientific/fibonacci/power milestones ---
    if (type === 'fibonacci') {
        return { name: 'Number Nerd', reason: 'Fibonacci number' };
    }
    if (type === 'power_of_2') {
        return { name: 'Number Nerd', reason: 'Power of 2' };
    }
    if (type === 'scientific') {
        return { name: 'Number Nerd', reason: 'Scientific constant' };
    }

    // --- Minimalist: palindromes ---
    if (type === 'palindrome') {
        return { name: 'Minimalist', reason: 'Palindrome number' };
    }

    // --- Adventurer: sequential/alternating patterns ---
    if (type === 'sequential') {
        return { name: 'Adventurer', reason: 'Sequential pattern' };
    }
    if (type === 'alternating') {
        return { name: 'Adventurer', reason: 'Alternating pattern' };
    }

    // --- Celebrator: birthdays and round numbers ---
    if (milestone.isBirthday) {
        return { name: 'Celebrator', reason: 'Birthday milestone' };
    }
    if (type === 'round' || type === 'power_of_10') {
        return { name: 'Celebrator', reason: 'Round number milestone' };
    }
    if (type === 'repdigit') {
        return { name: 'Celebrator', reason: 'Repeating digit milestone' };
    }

    // --- Default ---
    return { name: 'Celebrator', reason: 'General milestone' };
}

function getGiftCategory(milestone) {
    if (milestone.isBirthday) return 'birthday';
    const typeMap = {
        'power_of_10': 'round', 'round': 'round',
        'repdigit': 'repdigit', 'palindrome': 'palindrome',
        'fibonacci': 'fibonacci', 'power_of_2': 'power_of_2',
        'scientific': 'scientific', 'sequential': 'sequential',
        'alternating': 'generic', 'asian_lucky': 'generic'
    };
    return typeMap[milestone.type] || 'generic';
}

function renderGiftSuggestions(milestone) {
    const section = document.getElementById('giftSection');
    const preview = document.getElementById('giftPreview');
    const products = document.getElementById('giftProducts');
    if (!section || !preview || !products) return;

    if (!milestone) {
        section.style.display = 'none';
        return;
    }

    // Show gifts for any moderately special milestone
    const isSpecialEnough = milestone.isBirthday
        || milestone.isBigMilestone
        || milestone.isCosmic
        || (typeof isVerySpecialNumber === 'function' && isVerySpecialNumber(milestone.value))
        || (milestone.value >= 1000 && milestone.value % 1000 === 0)
        || (milestone.type && milestone.type !== 'special');
    if (!isSpecialEnough) {
        section.style.display = 'none';
        return;
    }
    section.style.display = '';

    const _esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const val = milestone.value.toLocaleString();
    const unit = _esc(milestone.unitName || '');
    const name = _esc(milestone.eventName || '');

    const suggestions = getGiftSuggestions(milestone);
    const collection = getGiftCollection(milestone);
    const collectionDef = GIFT_COLLECTIONS[collection.name];
    const collectionTagline = collectionDef ? collectionDef.tagline : '';
    const collectionIcon = collectionDef ? collectionDef.icon : '';

    preview.innerHTML = `
        <p class="gift-intro">Celebrate <strong>${val} ${unit}</strong> with a personalized gift for ${name}.</p>
        ${collectionDef ? `<p class="gift-collection-label">${collectionIcon} <strong>The ${_esc(collection.name)}</strong> &mdash; ${_esc(collectionTagline)}</p>` : ''}
    `;

    products.innerHTML = suggestions.map(p => {
        const tagline = p.tagline
            .replace(/\{value\}/g, val)
            .replace(/\{unit\}/g, unit)
            .replace(/\{name\}/g, name);

        return `
            <div class="gift-product-card" onclick="openGiftOrder('${p.id}', ${milestone.value}, '${milestone.unitName}', '${(milestone.eventName || '').replace(/'/g, "\\'")}')">
                <div class="gift-icon">${p.icon}</div>
                <div class="gift-info">
                    <div class="gift-name">${p.name}</div>
                    <div class="gift-tagline">${tagline}</div>
                    <div class="gift-price">${p.currency} ${p.price.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Store current milestone context for the order flow
let _currentGiftMilestone = null;
let _currentGiftDesignType = null;

// Re-render the live design preview from the CURRENT form field values, so edits
// to the number / name / message / custom line show up immediately.
function _refreshGiftPreview() {
    if (!_currentGiftMilestone || !_currentGiftDesignType) return;
    renderGiftDesignPreview(_currentGiftDesignType, _currentGiftMilestone.value,
        _currentGiftMilestone.unitName, _currentGiftMilestone.eventName);
}
if (typeof window !== 'undefined') window._refreshGiftPreview = _refreshGiftPreview;

// Show a State/Province dropdown only for countries where Printful requires it
// (US/CA/AU/JP/BR). Rebuilt whenever the selected country changes.
function _updateStateField() {
    const group = document.getElementById('shipStateGroup');
    const countrySel = document.getElementById('shipCountry');
    if (!group || !countrySel) return;
    const states = (typeof COUNTRY_STATES !== 'undefined') ? COUNTRY_STATES[countrySel.value] : null;
    if (states && states.length) {
        const opts = states.map(s => `<option value="${s.code}">${s.name}</option>`).join('');
        group.innerHTML = `<label>State / Province *</label>
            <select id="shipState" class="checkout-email-input" required>
                <option value="">Select…</option>${opts}
            </select>`;
        group.style.display = '';
    } else {
        group.innerHTML = '';
        group.style.display = 'none';
    }
}
if (typeof window !== 'undefined') window._updateStateField = _updateStateField;

function openGiftOrder(productId, value, unit, eventName) {
    const product = GIFT_CATALOG.find(p => p.id === productId);
    if (!product) return;

    // Track analytics
    if (typeof HM_ANALYTICS !== 'undefined') {
        HM_ANALYTICS.track('gift_order_started', { product: productId, value: value, unit: unit });
    }

    // Store milestone context
    _currentGiftMilestone = { value: value, unitName: unit, eventName: eventName || '' };
    _currentGiftDesignType = product.designType;

    // Use the SAME formatter as the milestone row + the printed design, so the
    // "Number on the gift" field, the preview card, and what the user selected
    // all show an identical number (was toLocaleString → "45,000,000" while the
    // card showed "45 million").
    const val = (typeof value === 'number')
        ? ((typeof formatMilestoneValuePlain === 'function') ? formatMilestoneValuePlain(value) : value.toLocaleString())
        : value;
    const _esc = typeof escapeHtml === 'function' ? escapeHtml : (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    const countryOptions = SHIPPING_COUNTRIES.map(c =>
        `<option value="${c.code}"${c.code === 'US' ? ' selected' : ''}>${c.name}</option>`
    ).join('');

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'giftOrderModal';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="modal-content checkout-modal gift-order-modal">
            <h3>${product.icon} ${product.name}</h3>
            <p class="checkout-custom">${product.description}</p>

            <!-- Design Preview -->
            <div class="gift-design-preview" id="giftDesignPreview">
                <p class="gift-design-loading">Generating design preview...</p>
            </div>
            <p style="font-size:0.72rem;color:var(--text-muted);text-align:center;margin:6px 0 0;opacity:0.85;">${typeof tt === 'function' ? tt('gp_disclaimer') : 'A close preview — the printed keepsake is finalised during production.'}</p>

            <div class="gift-order-form">
                <div class="gift-form-section">
                    <div class="gift-form-section-title">Customization</div>
                    <div class="form-group">
                        <label>Name on the gift</label>
                        <input type="text" id="giftRecipient" value="${_esc(eventName === 'Me' ? '' : (eventName || ''))}" placeholder="Who is this for?" class="checkout-email-input" oninput="_refreshGiftPreview()">
                    </div>
                    <div class="form-group">
                        <label>Number on the gift</label>
                        <input type="text" id="giftNumber" value="${val}" maxlength="40" class="checkout-email-input" oninput="_refreshGiftPreview()">
                    </div>
                    <div class="form-group">
                        <label>Unit / label on the gift</label>
                        <input type="text" id="giftUnit" value="${_esc(unit)}" maxlength="40" class="checkout-email-input" oninput="_refreshGiftPreview()">
                    </div>
                    <div class="form-group">
                        <label>Custom line on the gift (optional)</label>
                        <input type="text" id="giftCustom" placeholder="Anything you like" maxlength="60" class="checkout-email-input" oninput="_refreshGiftPreview()">
                    </div>
                    <div class="form-group">
                        <label>Personal message (optional)</label>
                        <input type="text" id="giftMessage" placeholder="e.g. Happy 10,000 days!" maxlength="80" class="checkout-email-input" oninput="_refreshGiftPreview()">
                    </div>
                    ${product.hasSize ? `
                    <div class="form-group">
                        <label>Size</label>
                        <select id="giftSize" class="checkout-email-input">
                            <option value="S">Small</option>
                            <option value="M" selected>Medium</option>
                            <option value="L">Large</option>
                            <option value="XL">X-Large</option>
                            <option value="2XL">2X-Large</option>
                        </select>
                    </div>
                    ` : ''}
                </div>

                <div class="gift-form-section">
                    <div class="gift-form-section-title">Shipping Address</div>
                    <div class="form-group">
                        <label>Full name *</label>
                        <input type="text" id="shipName" placeholder="Full name" class="checkout-email-input" autocomplete="name" required>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="shipEmail" placeholder="your@email.com" class="checkout-email-input" autocomplete="email" required>
                    </div>
                    <div class="form-group">
                        <label>Street address *</label>
                        <input type="text" id="shipAddress" placeholder="Street and number" class="checkout-email-input" autocomplete="address-line1" required>
                    </div>
                    <div class="form-group">
                        <label>City *</label>
                        <input type="text" id="shipCity" placeholder="City" class="checkout-email-input" autocomplete="address-level2" required>
                    </div>
                    <div class="form-row" style="gap: 8px;">
                        <div class="form-group" style="flex: 1;">
                            <label>ZIP / Postal code *</label>
                            <input type="text" id="shipZip" placeholder="ZIP" class="checkout-email-input" autocomplete="postal-code" required>
                        </div>
                        <div class="form-group" style="flex: 2;">
                            <label>Country *</label>
                            <select id="shipCountry" class="checkout-email-input" autocomplete="country" required onchange="_updateStateField()">
                                ${countryOptions}
                            </select>
                        </div>
                    </div>
                    <div class="form-group" id="shipStateGroup" style="display:none;"></div>
                </div>
            </div>

            <div class="checkout-price">EUR ${product.price.toFixed(2)}</div>
            <p class="gift-shipping-note">${typeof tt === 'function' ? tt('gp_ship_world') : 'Shipping included · ships worldwide'}</p>

            <div id="giftOrderError" class="auth-error hidden"></div>

            <div class="modal-buttons">
                <button class="btn-primary" id="giftOrderBtn" onclick="submitGiftOrder('${productId}', ${value}, '${unit}')">
                    Proceed to Payment
                </button>
                <button class="btn-secondary" onclick="document.getElementById('giftOrderModal').remove()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Generate design preview asynchronously
    setTimeout(() => {
        renderGiftDesignPreview(product.designType, value, unit, eventName || '');
        _updateStateField();
    }, 50);
}

function renderGiftDesignPreview(designType, value, unit, name) {
    const container = document.getElementById('giftDesignPreview');
    if (!container) return;

    if (typeof generateGiftDesign !== 'function') {
        container.innerHTML = '<p class="gift-design-loading">Design preview unavailable</p>';
        return;
    }

    try {
        // Reflect the current form edits in the preview (fall back to defaults).
        const numEl = document.getElementById('giftNumber');
        const msgEl = document.getElementById('giftMessage');
        const custEl = document.getElementById('giftCustom');
        const nameEl = document.getElementById('giftRecipient');
        const numberText = numEl ? numEl.value : '';
        const unitEl = document.getElementById('giftUnit');
        const unitText = unitEl ? unitEl.value : '';
        const message = msgEl ? msgEl.value : '';
        const custom = custEl ? custEl.value : '';
        const useName = nameEl ? nameEl.value : name;
        const milestone = { value: value, unitName: unit, eventName: useName };
        const canvas = generateGiftDesign(milestone, designType, { theme: 'dark', message: message, custom: custom, numberText: numberText, unitText: unitText });

        // Scale down for preview
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.borderRadius = '6px';
        canvas.style.border = '1px solid var(--border)';

        container.innerHTML = '';
        container.appendChild(canvas);
    } catch (err) {
        console.error('Design preview error:', err);
        container.innerHTML = '<p class="gift-design-loading">Design preview unavailable</p>';
    }
}

async function submitGiftOrder(productId, value, unit) {
    const product = GIFT_CATALOG.find(p => p.id === productId);
    if (!product) return;

    const errorEl = document.getElementById('giftOrderError');
    const orderBtn = document.getElementById('giftOrderBtn');

    // Collect form values
    const recipientName = (document.getElementById('giftRecipient')?.value || '').trim();
    const personalMessage = (document.getElementById('giftMessage')?.value || '').trim();
    const customLine = (document.getElementById('giftCustom')?.value || '').trim();
    const numberText = (document.getElementById('giftNumber')?.value || '').trim();
    const unitText = (document.getElementById('giftUnit')?.value || '').trim();
    const sizeEl = document.getElementById('giftSize');
    const size = sizeEl ? sizeEl.value : null;

    const shipName = (document.getElementById('shipName')?.value || '').trim();
    const shipEmail = (document.getElementById('shipEmail')?.value || '').trim();
    const shipAddress = (document.getElementById('shipAddress')?.value || '').trim();
    const shipCity = (document.getElementById('shipCity')?.value || '').trim();
    const shipZip = (document.getElementById('shipZip')?.value || '').trim();
    const shipCountry = (document.getElementById('shipCountry')?.value || '').trim();
    const shipStateEl = document.getElementById('shipState');
    const shipState = shipStateEl ? (shipStateEl.value || '').trim() : '';

    // Validate
    function showError(msg) {
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.classList.remove('hidden');
        } else {
            if (typeof showToast === 'function') showToast(msg, 'error');
        }
    }

    if (!shipName) { showError('Please enter the recipient name for shipping.'); return; }
    if (!shipEmail || !shipEmail.includes('@')) { showError('Please enter a valid email address.'); return; }
    if (!shipAddress) { showError('Please enter a street address.'); return; }
    if (!shipCity) { showError('Please enter a city.'); return; }
    if (!shipZip) { showError('Please enter a ZIP/postal code.'); return; }
    if (!shipCountry) { showError('Please select a country.'); return; }
    // Printful requires a state/province for these countries.
    if (typeof COUNTRY_STATES !== 'undefined' && COUNTRY_STATES[shipCountry] && !shipState) {
        showError('Please select a state/province/region.'); return;
    }

    // Disable button and show loading
    if (orderBtn) {
        orderBtn.disabled = true;
        orderBtn.textContent = 'Preparing your order...';
    }
    if (errorEl) errorEl.classList.add('hidden');

    // Render the print-resolution design as a PNG so Printful gets a reliable raster
    // (the same canvas the user previews). Falls back to server SVG if unavailable.
    let designImage = null;
    try {
        if (typeof generateGiftDesignBase64 === 'function') {
            const milestone = {
                value: value,
                unitName: unit,
                eventName: recipientName || (_currentGiftMilestone ? _currentGiftMilestone.eventName : '')
            };
            designImage = generateGiftDesignBase64(milestone, product.id, { theme: 'dark', message: personalMessage, custom: customLine, numberText: numberText, unitText: unitText });
        }
    } catch (err) {
        console.error('Gift design render failed, falling back to server design:', err);
    }

    try {
        // Submit to backend (Stripe checkout, Printful fulfilled separately).
        // On native the app is served from https://localhost, so a relative
        // "/api/*" call would hit the local bundle (returning index.html) — use
        // the absolute backend origin via apiUrl().
        const _giftEndpoint = (typeof apiUrl === 'function') ? apiUrl('/api/gift-order') : '/api/gift-order';
        const response = await fetch(_giftEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productType: product.id,
                milestoneValue: value,
                milestoneUnit: unit,
                milestoneName: recipientName || (_currentGiftMilestone ? _currentGiftMilestone.eventName : ''),
                personalMessage: personalMessage,
                customerEmail: shipEmail,
                shippingAddress: {
                    name: shipName,
                    address1: shipAddress,
                    city: shipCity,
                    country_code: shipCountry,
                    state_code: shipState || undefined,
                    zip: shipZip
                },
                size: size,
                customLine: customLine,
                numberText: numberText,
                unitText: unitText,
                returnOrigin: window.location.origin,
                designImage: designImage
            })
        });

        // Parse defensively: an error page (or, on a mis-routed native call, the
        // SPA's index.html) is NOT JSON, and response.json() would throw the raw
        // "Unexpected token '<' … DOCTYPE is not valid JSON" the user saw.
        const raw = await response.text();
        let result;
        try {
            result = raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error('Gift order: non-JSON response', response.status, raw.slice(0, 120));
            throw new Error('The gift service is temporarily unreachable. Please try again in a moment.');
        }

        if (!response.ok) {
            // Handle "coming soon" gracefully
            if (response.status === 503) {
                showOrderComingSoon(product, value, unit, shipEmail);
                return;
            }
            throw new Error(result.error || 'Order failed');
        }

        // Track analytics
        if (typeof HM_ANALYTICS !== 'undefined') {
            HM_ANALYTICS.track('gift_order_completed', {
                product: productId,
                value: value,
                unit: unit,
                orderId: result.orderId
            });
        }

        // Redirect to Stripe checkout
        if (result.checkoutUrl) {
            window.location.href = result.checkoutUrl;
        } else {
            showError('Payment session could not be created. Please try again.');
            if (orderBtn) { orderBtn.disabled = false; orderBtn.textContent = 'Proceed to Payment'; }
        }

    } catch (err) {
        console.error('Gift order error:', err);
        showError(err.message || 'Something went wrong. Please try again.');
        if (orderBtn) { orderBtn.disabled = false; orderBtn.textContent = 'Proceed to Payment'; }
    }
}

/**
 * Show a "coming soon" fallback when the backend is not yet configured.
 * Collects the email for notification.
 */
function showOrderComingSoon(product, value, unit, email) {
    const modal = document.getElementById('giftOrderModal');
    if (modal) modal.remove();

    const comingSoonModal = document.createElement('div');
    comingSoonModal.className = 'modal';
    comingSoonModal.id = 'giftComingSoonModal';
    comingSoonModal.onclick = (e) => { if (e.target === comingSoonModal) comingSoonModal.remove(); };
    comingSoonModal.innerHTML = `
        <div class="modal-content checkout-modal">
            <h3>${product.icon} ${product.name}</h3>
            <div class="checkout-notice">
                <p>The gift store is launching soon! We'll notify you when personalized ${product.name.toLowerCase()} ordering becomes available.</p>
                <div class="form-group" style="margin-top: 8px;">
                    <input type="email" id="comingSoonEmail" value="${email || ''}" placeholder="your@email.com" class="checkout-email-input">
                </div>
            </div>
            <div class="modal-buttons">
                <button class="btn-primary" onclick="handleGiftNotifyMe()">Notify Me</button>
                <button class="btn-secondary" onclick="document.getElementById('giftComingSoonModal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(comingSoonModal);
}

function handleGiftNotifyMe() {
    const emailEl = document.getElementById('comingSoonEmail');
    if (emailEl && emailEl.value && emailEl.value.includes('@')) {
        if (typeof HM_ANALYTICS !== 'undefined') {
            HM_ANALYTICS.track('gift_notify_signup', { email_hash: emailEl.value.length });
        }
        if (typeof showToast === 'function') {
            showToast('Thanks! We\'ll let you know when the store launches.', 'success');
        }
        const modal = document.getElementById('giftComingSoonModal');
        if (modal) modal.remove();
    } else {
        if (typeof showToast === 'function') {
            showToast('Please enter a valid email address.', 'error');
        }
    }
}

// Generate an inline gift banner for insertion between milestones
function generateGiftBanner(milestone) {
    if (!milestone) return '';
    const suggestions = getGiftSuggestions(milestone, 1);
    if (suggestions.length === 0) return '';

    const p = suggestions[0];
    const val = milestone.value.toLocaleString();
    const unit = milestone.unitName || '';
    const name = milestone.eventName || 'someone special';
    const tagline = p.tagline
        .replace(/\{value\}/g, val)
        .replace(/\{unit\}/g, unit)
        .replace(/\{name\}/g, name);

    const escapedName = (milestone.eventName || '').replace(/'/g, "\\'");

    // Show collection context in the CTA line
    const collection = getGiftCollection(milestone);
    const collectionDef = GIFT_COLLECTIONS[collection.name];
    const collectionLabel = collectionDef
        ? `The ${collection.name} collection &mdash; `
        : '';

    return `
        <div class="gift-banner" onclick="openGiftOrder('${p.id}', ${milestone.value}, '${milestone.unitName}', '${escapedName}')">
            <span class="gift-banner-icon">${p.icon}</span>
            <div class="gift-banner-text">
                <span class="gift-banner-tagline">${tagline}</span>
                <span class="gift-banner-cta">${collectionLabel}${p.name} &middot; EUR ${p.price.toFixed(2)} &rarr;</span>
            </div>
        </div>
    `;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GIFT_CATALOG, GIFT_COLLECTIONS, getGiftSuggestions, getGiftCollection, getGiftCategory, renderGiftSuggestions, generateGiftBanner };
}
