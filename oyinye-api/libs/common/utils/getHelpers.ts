export const months = [
  'Jan',
  'Feb' ,
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

export function randomReference() {
  let length = 8;
  let chars = "0123456789abcdefghijklmnopqrstuvwxyz_?£&*%!#%><ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}



export  function getDeviceType(userAgent: string) {

  if (/Mobile|Android|iPhone/i.test(userAgent)) {
      return 'Mobile';
  }

  if (/Tablet|iPad|Playbook|Silk/i.test(userAgent)) {
      return 'Tablet';
  }

  return 'Desktop';
}

export function getBrowser(userAgent: string) {
  if (userAgent.includes('Edg/')) {
      return 'Edge (Chromium)';
  } else if (userAgent.includes('Edge/')) {
      return 'Edge (Legacy)';
  } else if (userAgent.includes('Chrome')) {
      return 'Chrome';
  } else if (userAgent.includes('Safari')) {
      return 'Safari';
  } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      return 'IE'; // Internet Explorer
  } else {
      return 'Unknown';
  }
}