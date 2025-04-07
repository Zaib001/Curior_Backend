// utils/checkM25.js

const m25Postcodes = [
    'E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC',
    'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT',
    'RM', 'SM', 'TW', 'UB'
  ];
  
  const checkIfWithinM25 = (postcode) => {
    if (!postcode) return false;
  
    const area = postcode.match(/^[A-Z]{1,2}/)?.[0];
    return m25Postcodes.includes(area);
  };
  
module.exports = checkIfWithinM25;
  